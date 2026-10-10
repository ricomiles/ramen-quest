import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { categoriesFor } from '../lib/config'
import { fmt } from '../lib/score'
import type { Visit } from '../lib/types'

export function BottomNav() {
  const nav = useNavigate()
  const { pathname } = useLocation()
  const tab = (to: string, label: string) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) => 'nav-cell' + (isActive || (to === '/ranks' && pathname === '/vs') ? ' active' : '')}
    >
      {label}
    </NavLink>
  )
  return (
    <nav className="bottom-nav">
      {tab('/', 'Log')}
      {tab('/ranks', 'Ranks')}
      {tab('/map', 'Map')}
      {tab('/to-try', 'To-try')}
      <button className="nav-plus" onClick={() => nav('/add')} aria-label="Add bowl">
        +
      </button>
    </nav>
  )
}

export function Title({ en, jp, right }: { en: string; jp: string; right?: ReactNode }) {
  return (
    <div className="title-row">
      <div className="title">
        <span className="dela t24">{en}</span>
        <span className="jp-muted">{jp}</span>
      </div>
      {right}
    </div>
  )
}

/** Bowl photo, or the striped placeholder when there isn't one. */
export function Photo({ src, className = '', children }: { src?: string; className?: string; children?: ReactNode }) {
  return (
    <div className={'photo ' + className} style={src ? { backgroundImage: `url(${src})` } : undefined}>
      {children}
    </div>
  )
}

/** Mirrored Rico (ink, left) vs Rhiz (red, right) bars, one row per category. */
export function VsBars({
  rows,
  numbers = false,
}: {
  rows: { label: string; a: number | null | undefined; b: number | null | undefined }[]
  numbers?: boolean
}) {
  return (
    <div className="vs-bars">
      {rows.map((r) => (
        <div key={r.label} className={'vs-row' + (numbers ? ' with-nums' : '')}>
          {numbers && <span>{fmt(r.a)}</span>}
          <div className="bar bar-a" style={{ width: `${(r.a ?? 0) * 10}%` }} />
          <div className="vs-label">{r.label}</div>
          <div className="bar bar-b" style={{ width: `${(r.b ?? 0) * 10}%`, borderWidth: r.b ? 2 : 0 }} />
          {numbers && <span className="num-b">{fmt(r.b)}</span>}
        </div>
      ))}
    </div>
  )
}

export const visitBars = (v: Visit) =>
  categoriesFor(v.food_type).map((c) => ({ label: c.en, a: v.ratings.a?.scores[c.key], b: v.ratings.b?.scores[c.key] }))

/** "13 Sep" or "Sat 13 Sep" */
export function shortDate(iso: string, weekday = false) {
  const d = new Date(iso + 'T00:00')
  const part = (o: Intl.DateTimeFormatOptions) => d.toLocaleDateString('en-US', o)
  return [weekday && part({ weekday: 'short' }), d.getDate(), part({ month: 'short' })].filter(Boolean).join(' ')
}

/** Score text for lists: "?" means my partner rated and is waiting on me. */
export const scoreText = (v: Visit) => (v.awaitingMe ? '?' : fmt(v.together))

/** Simple ink ramen-bowl mascot until real art exists. */
export function Mascot() {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
      <g fill="none" stroke="#1D1A17" strokeWidth="4" strokeLinecap="round">
        <path d="M40 22c-6 8 6 12 0 20M60 16c-6 8 6 12 0 20M80 22c-6 8 6 12 0 20" />
        <path d="M14 56h92c0 26-20 44-46 44S14 82 14 56z" fill="#FBFAF7" />
        <path d="M42 100l-4 10h44l-4-10" fill="#FBFAF7" />
        <path d="M86 20l18 30M96 16l12 34" />
      </g>
      <circle cx="46" cy="76" r="4" fill="#1D1A17" />
      <circle cx="74" cy="76" r="4" fill="#1D1A17" />
      <path d="M52 84q8 8 16 0" fill="none" stroke="#1D1A17" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="36" cy="86" rx="6" ry="3" fill="#E4382A" opacity=".7" />
      <ellipse cx="84" cy="86" rx="6" ry="3" fill="#E4382A" opacity=".7" />
    </svg>
  )
}
