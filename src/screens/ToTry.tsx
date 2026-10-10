import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../lib/data'
import { geocode } from '../lib/media'
import type { Wish } from '../lib/types'
import { BottomNav, Title } from '../components/ui'

export default function ToTry() {
  const { wishes, names, addWish, updateWish, deleteWish } = useData()
  const nav = useNavigate()
  const [text, setText] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [spun, setSpun] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  // Pinned first, then oldest first. The top card is "next up".
  const list = [...wishes].sort((x, y) => Number(y.pinned) - Number(x.pinned) || x.created_at.localeCompare(y.created_at))

  async function add(e: FormEvent) {
    e.preventDefault()
    const [name, ...rest] = text.split(',')
    if (!name.trim()) return
    setText('')
    await addWish({ spot_name: name.trim(), note: rest.join(',').trim() || null })
  }

  async function find(w: Wish) {
    setMsg('Searching…')
    const pos = await geocode(w.spot_name).catch(() => null)
    if (pos) await updateWish(w.id, pos)
    setMsg(pos ? '' : `Couldn't find "${w.spot_name}" on the map.`)
  }

  function spin() {
    if (!list.length) return
    setSpun(list[Math.floor(Math.random() * list.length)].id)
  }

  return (
    <div className="screen">
      <Title en="Next episodes" jp="次回予告" />
      <div className="sub">Spots we've heard about. Tap "Went!" to rate.</div>

      <form className="add-row" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a spot… (name, who told us)" />
        <button className="dela" aria-label="Add">+</button>
      </form>

      {!list.length ? (
        <p className="empty">No leads yet. Ask a friend!</p>
      ) : (
        <div className="list mt14">
          {list.map((w, i) => {
            const first = i === 0
            const meta = [w.note, w.added_by && `${names[w.added_by]}'s pick`].filter(Boolean).join(' · ')
            const cls = ['wish-card', first && 'featured', !w.note && 'dashed', spun === w.id && 'spun'].filter(Boolean).join(' ')
            return (
              <div key={w.id} className={cls}>
                <button className="wish-body" onClick={() => setOpen(open === w.id ? null : w.id)}>
                  {first && <div className="tiny red-text">NEXT UP{w.pinned ? ' ★' : ''}</div>}
                  <div className="dela t19">{w.spot_name}</div>
                  <div className="t13 muted">{meta || 'No info yet'}{w.lat != null ? ' · 📍' : ''}</div>
                </button>
                <button className={'went press' + (first ? ' red' : '')} onClick={() => nav(`/add?wish=${w.id}`)}>Went!</button>
                {open === w.id && (
                  <div className="wish-actions">
                    <button className="chip" onClick={() => updateWish(w.id, { pinned: !w.pinned })}>{w.pinned ? 'Unpin' : '★ Next up'}</button>
                    <button className="chip" onClick={() => find(w)}>🔍 Find on map</button>
                    <button className="chip" onClick={() => { const note = prompt('Note', w.note ?? ''); if (note != null) updateWish(w.id, { note: note.trim() || null }) }}>Edit note</button>
                    <button className="chip" onClick={() => deleteWish(w.id)}>Delete</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {msg && <div className="hint">{msg}</div>}

      {list.length > 1 && (
        <div className="spin-row">
          <button className="bubble-oval press" onClick={spin}>
            {spun ? `Tonight: ${list.find((w) => w.id === spun)?.spot_name}!` : "Can't decide? Spin it!"}
          </button>
          <div className="sfx sfx-spin">ドキドキ</div>
        </div>
      )}
      <BottomNav />
    </div>
  )
}
