import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { hasPin, supabase } from './lib/supabase'
import { DataProvider } from './lib/data'
import type { PersonId } from './lib/types'
import Login from './screens/Login'
import Home from './screens/Home'
import AddBowl from './screens/AddBowl'
import Detail from './screens/Detail'
import HeadToHead from './screens/HeadToHead'
import ToTry from './screens/ToTry'
import Ranks from './screens/Ranks'

// Leaflet is the heaviest dependency, so only load it when the Map tab opens.
const MapScreen = lazy(() => import('./screens/MapScreen'))

export default function App() {
  // undefined = still checking the saved PIN, null = need to enter one
  const [me, setMe] = useState<PersonId | null | undefined>(hasPin() ? undefined : null)

  useEffect(() => {
    if (me !== undefined) return
    supabase.rpc('my_person').then(({ data }) => setMe((data as PersonId) ?? null))
  }, [me])

  if (me === undefined) return <div className="app" />
  if (!me) return <Login onIn={setMe} />

  return (
    <DataProvider me={me} onSignOut={() => setMe(null)}>
      <BrowserRouter>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/add" element={<AddBowl />} />
            <Route path="/ep/:id" element={<Detail />} />
            <Route path="/ep/:id/edit" element={<AddBowl />} />
            <Route path="/ranks" element={<Ranks />} />
            <Route path="/vs" element={<HeadToHead />} />
            <Route path="/map" element={<Suspense fallback={<div className="screen" />}><MapScreen /></Suspense>} />
            <Route path="/to-try" element={<ToTry />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </DataProvider>
  )
}
