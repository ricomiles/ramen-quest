/** Downscale to ~1600px on the long edge and re-encode as JPEG before upload. */
export async function compressImage(file: File, maxEdge = 1600, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not encode image'))), 'image/jpeg', quality),
  )
}

export type LatLng = { lat: number; lng: number }

export const currentPosition = () =>
  new Promise<LatLng>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      reject,
      { enableHighAccuracy: true, timeout: 10000 },
    ),
  )

/** Free OpenStreetMap geocoder, biased to the Cebu City area. Fine for a couple of manual lookups. */
export async function geocode(query: string): Promise<LatLng | null> {
  const cebu = 'countrycodes=ph&viewbox=123.75,10.45,124.05,10.20'
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&${cebu}&q=${encodeURIComponent(query)}`)
  const [hit] = await res.json()
  return hit ? { lat: +hit.lat, lng: +hit.lon } : null
}

export function distanceKm(a: LatLng, b: LatLng) {
  const rad = (d: number) => (d * Math.PI) / 180
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

export const directionsUrl = ({ lat, lng }: LatLng) =>
  /iPhone|iPad|Macintosh/.test(navigator.userAgent)
    ? `https://maps.apple.com/?daddr=${lat},${lng}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
