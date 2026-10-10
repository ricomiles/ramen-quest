import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { setPin, supabase } from './supabase'
import { compressImage } from './media'
import { buildVisits } from './score'
import type { Person, PersonId, Rating, Visit, VisitRow, Wish } from './types'

export type VisitFields = Omit<VisitRow, 'id' | 'created_at' | 'created_by'>

type Data = {
  me: PersonId
  names: Record<PersonId, string>
  visits: Visit[]
  wishes: Wish[]
  loading: boolean
  saveVisit: (id: string | null, fields: VisitFields, mine: { scores: Record<string, number>; note: string }) => Promise<string>
  deleteVisit: (v: Visit) => Promise<void>
  uploadPhoto: (file: File) => Promise<string>
  addWish: (w: Partial<Wish> & { spot_name: string }) => Promise<void>
  updateWish: (id: string, patch: Partial<Wish>) => Promise<void>
  deleteWish: (id: string) => Promise<void>
  signOut: () => void
}

const Ctx = createContext<Data | null>(null)
export const useData = () => useContext(Ctx)!

function check<T>({ data, error }: { data: T; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data
}

export function DataProvider({ me, onSignOut, children }: { me: PersonId; onSignOut: () => void; children: ReactNode }) {
  const [people, setPeople] = useState<Person[]>([])
  const [rows, setRows] = useState<VisitRow[]>([])
  const [ratings, setRatings] = useState<Rating[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)
  const channel = useRef<RealtimeChannel | null>(null)

  // The whole log is tiny, so any change just reloads everything.
  const reload = useCallback(async () => {
    const [p, v, r, w] = await Promise.all([
      supabase.from('people').select('id, name'),
      supabase.from('visits').select('*'),
      supabase.from('ratings').select('*'),
      supabase.from('wishes').select('*').order('created_at'),
    ])
    setPeople(check(p) ?? [])
    setRows(check(v) ?? [])
    setRatings(check(r) ?? [])
    setWishes(check(w) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    reload()
    // DB change events can't see the PIN header, so we ping each other instead.
    channel.current = supabase
      .channel('slurp')
      .on('broadcast', { event: 'changed' }, () => reload())
      .subscribe()
    const onFocus = () => document.visibilityState === 'visible' && reload()
    document.addEventListener('visibilitychange', onFocus)
    return () => {
      if (channel.current) supabase.removeChannel(channel.current)
      document.removeEventListener('visibilitychange', onFocus)
    }
  }, [reload])

  const value = useMemo<Data>(() => {
    const names = { a: 'Rico', b: 'Rhiz' } as Record<PersonId, string>
    for (const p of people) names[p.id] = p.name

    // Reload locally and tell the other phone to reload too.
    const changed = async () => {
      channel.current?.send({ type: 'broadcast', event: 'changed', payload: {} })
      await reload()
    }

    return {
      me,
      names,
      wishes,
      loading,
      visits: buildVisits(rows, ratings, me),

      async saveVisit(id, fields, mine) {
        const visit = id
          ? check(await supabase.from('visits').update(fields).eq('id', id).select().single())
          : check(await supabase.from('visits').insert({ ...fields, created_by: me }).select().single())
        if (Object.keys(mine.scores).length || mine.note.trim()) {
          check(await supabase.from('ratings').upsert({ visit_id: visit.id, person: me, ...mine, updated_at: new Date().toISOString() }))
        } else {
          check(await supabase.from('ratings').delete().match({ visit_id: visit.id, person: me }))
        }
        await changed()
        return visit.id as string
      },

      async deleteVisit(v) {
        const paths = v.photos.map((url) => url.split('/photos/').pop()!).filter(Boolean)
        if (paths.length) await supabase.storage.from('photos').remove(paths)
        check(await supabase.from('visits').delete().eq('id', v.id))
        await changed()
      },

      async uploadPhoto(file) {
        const blob = await compressImage(file)
        const path = `${crypto.randomUUID()}.jpg`
        check(await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' }))
        return supabase.storage.from('photos').getPublicUrl(path).data.publicUrl
      },

      async addWish(w) {
        check(await supabase.from('wishes').insert({ added_by: me, ...w }))
        await changed()
      },
      async updateWish(id, patch) {
        check(await supabase.from('wishes').update(patch).eq('id', id))
        await changed()
      },
      async deleteWish(id) {
        check(await supabase.from('wishes').delete().eq('id', id))
        await changed()
      },
      signOut() {
        setPin(null)
        onSignOut()
      },
    }
  }, [me, people, rows, ratings, wishes, loading, reload, onSignOut])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
