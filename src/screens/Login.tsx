import { useState, type FormEvent } from 'react'
import { supabase, setPin } from '../lib/supabase'
import type { PersonId } from '../lib/types'
import { Mascot } from '../components/ui'

export default function Login({ onIn }: { onIn: (me: PersonId) => void }) {
  const [pin, setValue] = useState('')
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setPin(pin)
    const { data, error } = await supabase.rpc('my_person')
    setBusy(false)
    if (data) return onIn(data as PersonId)
    setPin(null)
    setMsg(error ? error.message : 'Wrong PIN. No ramen for you.')
  }

  return (
    <div className="app screen pad-top">
      <div className="hero">
        <div className="hero-fade" />
        <div className="hero-mascot"><Mascot /></div>
        <div className="chip-ink">ズルズル帳</div>
        <div className="hero-title dela">SLURP<br />LOG!</div>
        <div className="bubble-oval hero-bubble">who's hungry?</div>
      </div>

      <form onSubmit={submit} className="stack">
        <label className="field">
          <span className="label">YOUR PIN</span>
          <input
            className="pin-input"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="current-password"
            value={pin}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
          />
        </label>
        {msg && <p className="callout">{msg}</p>}
        <button className="btn btn-red btn-block dela" disabled={busy || !pin}>{busy ? '…' : "Let's eat!"}</button>
      </form>
    </div>
  )
}
