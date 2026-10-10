import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useData } from '../lib/data'
import { fmt } from '../lib/score'
import { currentPosition, directionsUrl, distanceKm, type LatLng } from '../lib/media'
import { BottomNav, Photo } from '../components/ui'

const CEBU_CITY: L.LatLngTuple = [10.3157, 123.8854]

type Filter = 'all' | 'slurped' | 'totry'
type Spot = { key: string; lat: number; lng: number; label: string; hot: boolean; wish: boolean }

export default function MapScreen() {
  const { visits, wishes, names } = useData()
  const nav = useNavigate()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const layer = useRef<L.LayerGroup | null>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<string | null>(null)
  const [me, setMe] = useState<LatLng | null>(null)
  const fitted = useRef(false)

  const spots: Spot[] = [
    ...(filter !== 'totry' ? visits : [])
      .filter((v) => v.lat != null)
      .map((v) => ({ key: v.id, lat: v.lat!, lng: v.lng!, label: v.awaitingMe ? '?' : fmt(v.together), hot: (v.together ?? 0) >= 8, wish: false })),
    ...(filter !== 'slurped' ? wishes : [])
      .filter((w) => w.lat != null)
      .map((w) => ({ key: w.id, lat: w.lat!, lng: w.lng!, label: '?', hot: false, wish: true })),
  ]

  useEffect(() => {
    map.current = L.map(el.current!, { zoomControl: false, attributionControl: true }).setView(CEBU_CITY, 14)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map.current)
    layer.current = L.layerGroup().addTo(map.current)
    currentPosition().then(setMe).catch(() => {}) // only used for "0.8 km" distances
    return () => {
      map.current?.remove()
    }
  }, [])

  // Redraw pins whenever data, filter or selection changes.
  const sig = spots.map((s) => s.key + s.label).join() + selected
  useEffect(() => {
    layer.current!.clearLayers()
    for (const s of spots) {
      const cls = ['pin', s.hot && 'hot', s.wish && 'wish', s.key === selected && 'sel'].filter(Boolean).join(' ')
      L.marker([s.lat, s.lng], {
        icon: L.divIcon({ className: 'pin-anchor', html: `<div class="${cls}">${s.label}</div>`, iconSize: [0, 0] }),
      })
        .on('click', () => setSelected(s.key))
        .addTo(layer.current!)
    }
  }, [sig])

  // Fit to pins once we have some.
  useEffect(() => {
    if (fitted.current || !spots.length) return
    fitted.current = true
    map.current!.fitBounds(L.latLngBounds(spots.map((s) => [s.lat, s.lng])), { padding: [60, 60], maxZoom: 15 })
  }, [spots])

  const v = visits.find((x) => x.id === selected)
  const w = wishes.find((x) => x.id === selected)
  const pos = v?.lat != null ? { lat: v.lat, lng: v.lng! } : w?.lat != null ? { lat: w.lat, lng: w.lng! } : null
  const km = pos && me ? `${distanceKm(me, pos).toFixed(1)} km` : null

  return (
    <div className="screen map-screen">
      <div ref={el} className="map" />
      <div className="map-filters chips">
        {(['all', 'slurped', 'totry'] as Filter[]).map((f) => (
          <button key={f} className={'chip solid' + (filter === f ? ' on' : '')} onClick={() => setFilter(f)}>
            {{ all: 'All', slurped: 'Slurped', totry: 'To-try' }[f]}
          </button>
        ))}
      </div>

      <div className="sheet">
        <div className="grab" />
        {v ? (
          <>
            <div className="sheet-row">
              <Photo src={v.photos[0]} className="thumb72" />
              <div className="min0">
                <div className="tiny muted">{['EP.' + v.ep, v.area?.toUpperCase(), km].filter(Boolean).join(' · ')}</div>
                <div className="dela t20 ellipsis">{v.spot_name}</div>
                {!v.awaitingMe && <div className="t13 bold">{names.a} {fmt(v.overall.a)} · {names.b} {fmt(v.overall.b)}</div>}
              </div>
              <div className="score-tag dela">{v.awaitingMe ? '?' : fmt(v.together)}</div>
            </div>
            <div className="btn-pair">
              <button className="btn press" onClick={() => nav(`/ep/${v.id}`)}>Open episode</button>
              <a className="btn btn-yellow press" href={directionsUrl(pos!)} target="_blank" rel="noreferrer">Directions →</a>
            </div>
          </>
        ) : w ? (
          <>
            <div className="sheet-row">
              <div className="thumb72 wish-thumb dela">?</div>
              <div className="min0">
                <div className="tiny muted">{['TO-TRY', km].filter(Boolean).join(' · ')}</div>
                <div className="dela t20 ellipsis">{w.spot_name}</div>
                {w.note && <div className="t13 muted ellipsis">{w.note}</div>}
              </div>
            </div>
            <div className="btn-pair">
              <button className="btn press" onClick={() => nav(`/add?wish=${w.id}`)}>Went!</button>
              <a className="btn btn-yellow press" href={directionsUrl(pos!)} target="_blank" rel="noreferrer">Directions →</a>
            </div>
          </>
        ) : (
          <p className="muted center-pad">
            {spots.length ? 'Tap a pin.' : 'No pins yet. Use “We’re here” or “Find” when logging a bowl.'}
          </p>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
