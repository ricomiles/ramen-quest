# Slurp Log ズルズル帳

Rico & Rhiz's ramen rating PWA. Vite + React + Supabase, deployed on Vercel.
The design reference is in `design_handoff_slurp_log/`.

## Setup

1. **Supabase**: create a project. Open `supabase/schema.sql`, **change the two PINs** on line 10
   (8+ digits recommended), then paste the whole file into the SQL Editor and run it.
2. **Env**: copy `.env.example` to `.env.local` and fill in the Project URL and anon key
   (Supabase → Project Settings → API).
3. **Run**: `pnpm install && pnpm dev`

## Deploy (Vercel)

Import the repo in Vercel (it detects Vite). Add the same two `VITE_SUPABASE_*` env vars, then deploy.
`vercel.json` handles SPA routing. On your phone, open the site and choose **Add to Home Screen**.

## How "accounts" work

- Each person has a PIN in the `people` table. Enter it once and the phone remembers it.
- Every request sends the PIN as an `x-slurp-pin` header. Row-level security checks it,
  so nothing can be read or written without a valid PIN.
- You can only write your **own** rating, so you each rate independently.
- **No peeking**: if your partner rated a bowl and you haven't, their scores stay hidden until you rate it.
- Change a PIN or name: `update people set pin = '…', name = '…' where id = 'a';`
  Then sign out and back in on that phone.

## Notes

- Live sync uses a Supabase Realtime broadcast ("something changed, reload"). The app also reloads when it comes back to the foreground.
- Photos are compressed on the device (1600px JPEG) and stored in the public `photos` bucket under random filenames.
- Map pins come from "📍 We're here" or "🔍 Find" (OpenStreetMap search) on a bowl or to-try item.
- Categories and styles are config-driven per food type in `src/lib/config.ts`.
- Regenerate icons from `public/favicon.svg` with `pnpm icons`.
