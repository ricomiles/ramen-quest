import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const PIN_KEY = 'slurp-pin'

function readPin() {
  try {
    return localStorage.getItem(PIN_KEY)
  } catch {
    return null
  }
}

// Every request carries the PIN; the database policies use it to know who we are.
const make = (pin: string | null) =>
  createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: pin ? { 'x-slurp-pin': pin } : {} },
  })

export let supabase: SupabaseClient = make(readPin())
export const hasPin = () => !!readPin()

export function setPin(pin: string | null) {
  try {
    if (pin) localStorage.setItem(PIN_KEY, pin)
    else localStorage.removeItem(PIN_KEY)
  } catch {
    /* private mode: PIN lasts for this session only */
  }
  supabase = make(pin)
}
