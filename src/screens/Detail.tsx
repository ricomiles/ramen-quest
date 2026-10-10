import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useData } from '../lib/data'
import { styleJp } from '../lib/config'
import { IDS, fmt, other } from '../lib/score'
import { Photo, VsBars, shortDate, visitBars } from '../components/ui'

export default function Detail() {
  const { id } = useParams()
  const { visits, names, me, loading, deleteVisit } = useData()
  const nav = useNavigate()
  const [viewer, setViewer] = useState<number | null>(null)
  const v = visits.find((x) => x.id === id)

  if (loading) return <div className="screen" />
  if (!v) return <div className="screen pad-top"><p className="callout">Episode not found. <Link to="/">Back to log</Link></p></div>

  const [hero, second, ...rest] = v.photos
  const myRated = v.overall[me] != null

  async function remove() {
    if (!confirm(`Delete "${v!.spot_name}"? This can't be undone.`)) return
    await deleteVisit(v!)
    nav('/', { replace: true })
  }

  return (
    <div className="screen no-nav">
      <div className="collage">
        <Photo src={hero} className="hero-photo" >
          <button className="back-btn" onClick={() => nav(-1)} aria-label="Back">←</button>
          {hero && <button className="photo-hit" onClick={() => setViewer(0)} aria-label="View photo" />}
        </Photo>
        <div className="tone-cell"><span className="sfx sfx-cell">うまい!</span></div>
        <Photo src={second}>
          {second && <button className="photo-hit" onClick={() => setViewer(1)} aria-label="View photo" />}
          {rest.length > 0 && <span className="more">+{rest.length}</span>}
        </Photo>
      </div>

      <div className="detail-head">
        <div className="min0">
          <div className="tiny muted">EPISODE {v.ep}{v.style ? ` · ${styleJp(v.style)}` : ''}</div>
          <div className="dela t30 lh105">{v.spot_name}</div>
          <div className="meta13">{[v.area, shortDate(v.date, true)].filter(Boolean).join(' · ')}</div>
        </div>
        <div className="together-badge">
          <div className="dela t32 lh1">{v.awaitingMe ? '?' : fmt(v.together)}</div>
          <div className="t10 bold">TOGETHER</div>
        </div>
      </div>

      {v.awaitingMe ? (
        <div className="panel mt14 center-pad">
          <div className="dela t20">{names[other(me)]} already rated!</div>
          <p className="muted">No peeking. Rate it yourself to see the scores.</p>
          <Link to={`/ep/${v.id}/edit`} className="btn btn-red btn-block press">Rate it!</Link>
        </div>
      ) : (
        <div className="panel mt14">
          <div className="vs-head">
            <div className="bold">{names.a} <span className="dela t20">{fmt(v.overall.a)}</span></div>
            <div className="dela t16 yellow-text">VS</div>
            <div className="bold right"><span className="dela t20">{fmt(v.overall.b)}</span> {names.b}</div>
          </div>
          <div className="pad1012"><VsBars rows={visitBars(v)} /></div>
        </div>
      )}

      {!v.awaitingMe && (
        <div className="bubbles">
          {IDS.map((pid) => v.ratings[pid]?.note && (
            <div key={pid} className={'speech ' + (pid === 'a' ? 'left' : 'right')}>
              <b>{names[pid]}:</b> {v.ratings[pid]!.note}
            </div>
          ))}
        </div>
      )}

      {v.ordered && (
        <div className="panel mt14 pad1014">
          <div className="tiny muted">WHAT WE ORDERED</div>
          <div>{v.ordered}</div>
        </div>
      )}

      <div className="action-row">
        {!myRated && !v.awaitingMe && <Link to={`/ep/${v.id}/edit`} className="btn btn-red press">Rate it!</Link>}
        <Link to={`/ep/${v.id}/edit`} className="btn press">Edit</Link>
        <button className="btn press" onClick={remove}>Delete</button>
      </div>

      {viewer != null && (
        <div className="viewer" onClick={() => setViewer((i) => (i! + 1 < v.photos.length ? i! + 1 : null))}>
          <img src={v.photos[viewer]} alt="" />
          <div className="viewer-hint">{viewer + 1} / {v.photos.length} · tap for next</div>
        </div>
      )}
    </div>
  )
}
