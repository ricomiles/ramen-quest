import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { createMap, pinIcon } from '../lib/map'
import { currentPosition, type LatLng } from '../lib/media'

/** Full-screen "tap where it is" map. Used by Add bowl, To-try and the Map tab. */
export default function MapPicker({
  title,
  initial,
  onSave,
  onCancel,
}: {
  title: string
  initial: LatLng | null
  onSave: (pos: LatLng) => void | Promise<void>
  onCancel: () => void
}) {
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const marker = useRef<L.Marker | null>(null)
  const [pos, setPos] = useState<LatLng | null>(initial)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const m = initial ? createMap(el.current!, [initial.lat, initial.lng], 17) : createMap(el.current!)
    m.on('click', (e: L.LeafletMouseEvent) => setPos({ lat: e.latlng.lat, lng: e.latlng.lng }))
    map.current = m
    return () => {
      m.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    marker.current?.remove()
    if (pos) marker.current = L.marker([pos.lat, pos.lng], { icon: pinIcon('?', 'wish sel') }).addTo(map.current!)
  }, [pos])

  async function jumpToMe() {
    setMsg('Locating…')
    try {
      const p = await currentPosition()
      map.current!.setView([p.lat, p.lng], 17)
      setMsg('')
    } catch {
      setMsg('Couldn’t get your location.')
    }
  }

  async function save() {
    if (!pos) return
    setBusy(true)
    await onSave(pos)
  }

  return (
    <div className="picker">
      <div ref={el} className="picker-map" />
      <div className="picker-sheet">
        <div className="grab" />
        <div className="picker-info">
          <div className="min0">
            <div className="tiny muted">PIN ON MAP</div>
            <div className="dela t20 ellipsis">{title || 'This spot'}</div>
            <div className="t13 bold">{msg || (pos ? 'Looks good? Tap elsewhere to move it.' : 'Tap the map where it is.')}</div>
          </div>
          <button className="chip" onClick={jumpToMe}>📍 Me</button>
        </div>
        <div className="btn-pair">
          <button className="btn press" onClick={onCancel}>Cancel</button>
          <button className="btn btn-red press" onClick={save} disabled={!pos || busy}>{busy ? 'Saving…' : 'Save pin'}</button>
        </div>
      </div>
    </div>
  )
}
