import { Link, useNavigate } from 'react-router-dom'
import { useData } from '../lib/data'
import { fmt, homeStats } from '../lib/score'
import { BottomNav, Mascot, Photo, scoreText, shortDate } from '../components/ui'

export default function Home() {
  const { visits, names, me, loading, signOut } = useData()
  const nav = useNavigate()
  const { avg, best, harsh } = homeStats(visits)
  const n = visits.length

  return (
    <div className="screen">
      <div className="top-meta">
        <span>Hi {names[me]}!</span>
        <button className="link-btn" onClick={signOut}>sign out</button>
      </div>

      <div className="hero">
        <div className="hero-fade" />
        <div className="hero-mascot"><Mascot /></div>
        <div className="chip-ink">第{n}話 · CH.{n}</div>
        <div className="hero-title dela">RAMEN<br />QUEST!</div>
        <div className="bubble-oval hero-bubble">
          {n ? `${n} bowl${n === 1 ? '' : 's'}. still hungry!!` : "0 bowls. let's go eat!!"}
        </div>
        <div className="sfx hero-sfx">ズル</div>
      </div>

      {loading ? null : n === 0 ? (
        <button className="btn btn-red btn-block big-cta" onClick={() => nav('/add')}>
          <span className="dela">+</span> Log our first bowl
        </button>
      ) : (
        <>
          <div className="stat-strip">
            <div className="stat"><div className="dela t24">{fmt(avg)}</div><div className="tiny">OUR AVG</div></div>
            <div className="stat"><div className="dela t24 ellipsis">{best ? bestName(best.spot_name) : '–'}</div><div className="tiny">BEST BOWL</div></div>
            <div className="stat red"><div className="dela t24">{harsh ? names[harsh] : '–'}</div><div className="tiny">HARSH CRITIC</div></div>
          </div>

          <div className="section-head"><span className="dela t20">Episodes</span><span className="jp-muted">エピソード</span></div>
          <div className="list">
            {visits.map((v) => (
              <Link key={v.id} to={`/ep/${v.id}`} className="ep-row press">
                <Photo src={v.photos[0]} className="thumb64" />
                <div className="min0">
                  <div className="name ellipsis">{v.spot_name}</div>
                  <div className="meta">Ep.{v.ep}{v.style ? ` · ${v.style}` : ''} · {shortDate(v.date)}</div>
                </div>
                <div className={'dela t28 score' + (v.id === best?.id || v.awaitingMe ? ' red' : '')}>{scoreText(v)}</div>
              </Link>
            ))}
          </div>
        </>
      )}
      <BottomNav />
    </div>
  )
}

/** "Menya Kaze" → "Kaze" so it fits the stat box. */
const bestName = (name: string) => name.split(' ').slice(-1)[0]
