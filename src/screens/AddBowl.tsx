import { Suspense, lazy, useState, type ChangeEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useData, type VisitFields } from '../lib/data'
import { FOOD_TYPES, categoriesFor } from '../lib/config'
import { IDS, fmt, mean, other } from '../lib/score'
import { currentPosition, geocode } from '../lib/media'
import type { Visit, Wish } from '../lib/types'

// Leaflet is heavy; only load the picker when it opens.
const MapPicker = lazy(() => import('../components/MapPicker'))

const today = () => new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time

export default function AddBowl() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const { visits, wishes, loading } = useData()
  if (loading) return <div className="screen" />
  const visit = id ? visits.find((v) => v.id === id) : undefined
  const wish = wishes.find((w) => w.id === params.get('wish'))
  return <Form key={id ?? 'new'} visit={visit} wish={wish} />
}

function Form({ visit, wish }: { visit?: Visit; wish?: Wish }) {
  const { me, names, saveVisit, uploadPhoto, deleteWish } = useData()
  const nav = useNavigate()
  const foodType = visit?.food_type ?? 'ramen'
  const cats = categoriesFor(foodType)
  const partner = other(me)

  const [f, setF] = useState<VisitFields>({
    food_type: foodType,
    spot_name: visit?.spot_name ?? wish?.spot_name ?? '',
    area: visit?.area ?? '',
    style: visit?.style ?? null,
    lat: visit?.lat ?? wish?.lat ?? null,
    lng: visit?.lng ?? wish?.lng ?? null,
    date: visit?.date ?? today(),
    ordered: visit?.ordered ?? '',
    photos: visit?.photos ?? [],
  })
  const [scores, setScores] = useState<Record<string, number>>(visit?.ratings[me]?.scores ?? {})
  const [note, setNote] = useState(visit?.ratings[me]?.note ?? '')
  const [uploading, setUploading] = useState(0)
  const [busy, setBusy] = useState(false)
  const [locMsg, setLocMsg] = useState('')
  const [picking, setPicking] = useState(false)
  const [error, setError] = useState('')

  const set = <K extends keyof VisitFields>(k: K, v: VisitFields[K]) => setF((s) => ({ ...s, [k]: v }))

  const myOverall = mean(cats.map((c) => scores[c.key]))
  const partnerOverall = visit?.overall[partner] ?? null
  const together = mean([myOverall, partnerOverall])
  const partnerRated = !!visit && (visit.awaitingMe || partnerOverall != null)

  async function addPhotos(e: ChangeEvent<HTMLInputElement>) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    setUploading((n) => n + files.length)
    for (const file of files) {
      try {
        const url = await uploadPhoto(file)
        setF((s) => ({ ...s, photos: [...s.photos, url] }))
      } catch (err) {
        setError(`Photo upload failed: ${(err as Error).message}`)
      } finally {
        setUploading((n) => n - 1)
      }
    }
  }

  async function locate(how: 'here' | 'find') {
    setLocMsg(how === 'here' ? 'Locating…' : 'Searching…')
    try {
      const pos = how === 'here' ? await currentPosition() : await geocode([f.spot_name, f.area].filter(Boolean).join(', '))
      if (!pos) return setLocMsg('Not found. Try adding the area, or pin it while you’re there.')
      setF((s) => ({ ...s, ...pos }))
      setLocMsg('')
    } catch {
      setLocMsg('Couldn’t get location.')
    }
  }

  async function save() {
    if (!f.spot_name.trim()) return setError('Where did we eat? Spot name is required.')
    if (!Object.keys(scores).length && !partnerRated) return setError('Score at least one category.')
    setBusy(true)
    setError('')
    try {
      const fields = { ...f, spot_name: f.spot_name.trim(), area: f.area?.trim() || null, ordered: f.ordered?.trim() || null }
      const id = await saveVisit(visit?.id ?? null, fields, { scores, note })
      if (wish) await deleteWish(wish.id)
      nav(`/ep/${id}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <div className="screen no-nav">
      <div className="push-head">
        <button className="link-btn bold" onClick={() => nav(-1)}>✕ Cancel</button>
        <span className="dela t20">{visit ? `Ep.${visit.ep}` : 'New episode'}</span>
        <span style={{ width: 60 }} />
      </div>

      <label className="field mt14">
        <span className="label">WHERE?</span>
        <input className="big" value={f.spot_name} onChange={(e) => set('spot_name', e.target.value)} placeholder="Spot name" />
      </label>

      <div className="chips mt8">
        {FOOD_TYPES[foodType].styles.map((s) => (
          <button key={s.en} className={'chip' + (f.style === s.en ? ' on' : '')} onClick={() => set('style', f.style === s.en ? null : s.en)}>
            {s.jp ? `${s.jp} ` : ''}{s.en}
          </button>
        ))}
      </div>

      <div className="field-pair mt8">
        <label className="field">
          <span className="label">AREA</span>
          <input value={f.area ?? ''} onChange={(e) => set('area', e.target.value)} placeholder="Neighbourhood" />
        </label>
        <label className="field">
          <span className="label">DATE</span>
          <input type="date" value={f.date} onChange={(e) => set('date', e.target.value)} />
        </label>
      </div>

      <div className="loc-row mt8">
        <span className="label">{f.lat != null ? 'ON THE MAP ✓' : 'MAP PIN'}</span>
        <button className="chip" onClick={() => locate('here')}>📍 We're here</button>
        <button className="chip" onClick={() => setPicking(true)}>🗺️ {f.lat != null ? 'Move pin' : 'Pick on map'}</button>
        <button className="chip" onClick={() => locate('find')} disabled={!f.spot_name}>🔍 Find</button>
        {f.lat != null && <button className="chip" onClick={() => setF((s) => ({ ...s, lat: null, lng: null }))}>✕</button>}
      </div>
      {locMsg && <div className="hint">{locMsg}</div>}

      <div className="photo-strip mt10">
        {f.photos.map((url) => (
          <div key={url} className="photo" style={{ backgroundImage: `url(${url})` }}>
            <button className="photo-x" aria-label="Remove photo" onClick={() => set('photos', f.photos.filter((p) => p !== url))}>✕</button>
          </div>
        ))}
        {Array.from({ length: uploading }, (_, i) => <div key={i} className="photo loading">…</div>)}
        <label className="photo add">
          <span className="t26">+</span>photo
          <input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
        </label>
      </div>

      <div className="rater mt14">
        {IDS.map((pid) =>
          pid === me ? (
            <div key={pid} className="rater-cell active">
              {myOverall == null ? `${names[me]}'s turn!` : <>{names[me]} ✓ <span className="dela">{fmt(myOverall)}</span></>}
            </div>
          ) : (
            <div key={pid} className="rater-cell">
              {partnerRated ? <>{names[pid]} ✓ <span className="dela">{visit!.awaitingMe ? '??' : fmt(partnerOverall)}</span></> : <span className="muted">{names[pid]} · later</span>}
            </div>
          ),
        )}
      </div>

      <div className="score-rows">
        {cats.map((c) => (
          <div key={c.key} className="score-row">
            <span className="cat-label">{c.en}<br /><span className="jp-muted">{c.jp}</span></span>
            <div className="cells">
              {Array.from({ length: 10 }, (_, i) => {
                const n = i + 1
                const v = scores[c.key]
                const cls = v == null || n > v ? 'cell' : n === v ? 'cell pick' : 'cell fill'
                const pick = () =>
                  setScores((s) => {
                    const next = { ...s }
                    if (s[c.key] === n) delete next[c.key] // tap again to clear
                    else next[c.key] = n
                    return next
                  })
                return <button key={n} className={cls} onClick={pick} aria-label={`${c.en} ${n}`}>{n === v ? n : ''}</button>
              })}
            </div>
          </div>
        ))}
      </div>

      <textarea className="bubble-input mt14" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={`${names[me]}'s thoughts…`} />

      <label className="field mt10">
        <span className="label">WHAT WE ORDERED</span>
        <input value={f.ordered ?? ''} onChange={(e) => set('ordered', e.target.value)} placeholder="Spicy miso, extra egg, gyoza…" />
      </label>

      {error && <p className="callout">{error}</p>}

      <button className="save-bar press" onClick={save} disabled={busy || uploading > 0}>
        <span className="dela t18">{busy ? 'Saving…' : uploading ? 'Uploading…' : 'Save episode!'}</span>
        <span className="bold">{fmt(together)} together</span>
      </button>

      {picking && (
        <Suspense fallback={null}>
          <MapPicker
            title={f.spot_name}
            initial={f.lat != null ? { lat: f.lat, lng: f.lng! } : null}
            onCancel={() => setPicking(false)}
            onSave={(pos) => {
              setF((s) => ({ ...s, ...pos }))
              setLocMsg('')
              setPicking(false)
            }}
          />
        </Suspense>
      )}
    </div>
  )
}
