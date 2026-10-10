import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '../lib/data'
import { categoriesFor } from '../lib/config'
import { combinedScore, fmt } from '../lib/score'
import { BottomNav, Photo, Title } from '../components/ui'

export default function Ranks() {
  const { visits, names } = useData()
  const [cat, setCat] = useState('overall')
  const filters = [{ key: 'overall', en: 'Overall' }, ...categoriesFor('ramen')]

  const ranked = visits
    .map((v) => ({ v, s: combinedScore(v, cat) }))
    .filter((x): x is { v: typeof x.v; s: number } => x.s != null)
    .sort((x, y) => y.s - x.s)
  const [champ, ...rest] = ranked

  return (
    <div className="screen">
      <Title en="Rankings" jp="ランキング" right={<Link to="/vs" className="bold u t13">Head-to-head →</Link>} />

      <div className="chips mx16 mt12">
        {filters.map((f) => (
          <button key={f.key} className={'chip' + (cat === f.key ? ' on' : '')} onClick={() => setCat(f.key)}>{f.en}</button>
        ))}
      </div>

      {!champ ? (
        <p className="empty">No rated bowls yet.</p>
      ) : (
        <>
          <Link to={`/ep/${champ.v.id}`} className="champion">
            <div className="chip-ink yellow-text">No.1 ★ CHAMPION</div>
            <Photo src={champ.v.photos[0]} className="champ-photo" />
            <div className="champ-name dela">{champ.v.spot_name}</div>
            <div className="champ-foot">
              <span className="score-tag dela t28">{fmt(champ.s)}</span>
              <span className="mini-chip">{[champ.v.style, `Ep.${champ.v.ep}`].filter(Boolean).join(' · ')}</span>
            </div>
          </Link>

          <div className="rank-list">
            {rest.map(({ v, s }, i) => (
              <Link key={v.id} to={`/ep/${v.id}`} className="rank-row">
                <span className="rank-num dela">{String(i + 2).padStart(2, '0')}</span>
                <div className="min0">
                  <div className="name ellipsis">{v.spot_name}</div>
                  <div className="meta">{[v.style, `${names.a} ${fmt(v.overall.a)}`, `${names.b} ${fmt(v.overall.b)}`].filter(Boolean).join(' · ')}</div>
                </div>
                <span className="dela t24">{fmt(s)}</span>
              </Link>
            ))}
          </div>
        </>
      )}
      <BottomNav />
    </div>
  )
}
