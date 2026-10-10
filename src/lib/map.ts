import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export const CEBU_CITY: L.LatLngTuple = [10.3157, 123.8854]

export function createMap(el: HTMLElement, center: L.LatLngTuple = CEBU_CITY, zoom = 14) {
  const map = L.map(el, { zoomControl: false }).setView(center, zoom)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map)
  return map
}

/** Score-tag pin. `cls` adds hot / wish / sel. */
export const pinIcon = (label: string, cls = '') =>
  L.divIcon({ className: 'pin-anchor', html: `<div class="pin ${cls}">${label}</div>`, iconSize: [0, 0] })
