import { useNavigate } from 'react-router-dom'
import { useData } from '../lib/data'
import { fmt, headToHead, verdict } from '../lib/score'
import { BottomNav, Title, VsBars } from '../components/ui'

export default function HeadToHead() {
  const { visits, names } = useData()
  const nav = useNavigate()
  const h = headToHead(visits)
  const leader = h.bHigher >= h.aHigher ? 'b' : 'a'

  return (
    <div className="screen">
      <Title en="Head-to-head" jp="対決" right={<button className="link-btn bold u" onClick={() => nav(-1)}>← Back</button>} />

      <div className="vs-split">
        <div className="vs-half tone">
          <div className="avatar">{names.a}</div>
          <div className="name-tag"><div className="bold t13">{names.a.toUpperCase()}</div><div className="dela t26 lh1">{fmt(h.avg.a)}</div></div>
        </div>
        <div className="vs-half red">
          <div className="avatar right">{names.b}</div>
          <div className="name-tag right"><div className="bold t13">{names.b.toUpperCase()}</div><div className="dela t26 lh1">{fmt(h.avg.b)}</div></div>
        </div>
        <div className="vs-badge dela">VS</div>
      </div>

      <div className="stat-strip">
        <div className="stat">
          <div className="dela t22">{leader === 'a' ? h.aHigher : h.bHigher} / {h.total}</div>
          <div className="tiny">{names[leader].toUpperCase()} SCORED HIGHER</div>
        </div>
        <div className="stat"><div className="dela t22">{h.ties}</div><div className="tiny">EXACT TIES</div></div>
        <div className="stat ink"><div className="dela t22">{h.gap ? fmt(h.gap.size) : '–'}</div><div className="tiny">BIGGEST GAP</div></div>
      </div>

      <div className="section-head"><span className="dela t17">Average by category</span></div>
      <div className="panel mx16 pad1012">
        <VsBars numbers rows={h.cats.map((c) => ({ label: c.en, a: c.a, b: c.b }))} />
      </div>

      <div className="speech verdict"><b>Verdict:</b> {verdict(h, names)}</div>
      <BottomNav />
    </div>
  )
}
