# Handoff: Slurp Log (ズルズル帳) — couples' ramen rating app

## Overview
A mobile-first web app for two people (Rico & Rhiz) who go on a ramen hunt together and rate each spot. Each person scores every visit separately across 5 categories; the categories roll up to a personal overall score, and the two overalls average into a "together" score. Visits get photos, an order note, and a comment from each person. Other screens: head-to-head comparison, a map of visited and to-try spots, a to-try list, and a leaderboard. Ramen comes first, but the data model should allow other foods later (see State).

## About the Design Files
The files in this bundle are **design references created in HTML**: static mockups showing the intended look and layout, not production code. Your job is to **recreate these designs in the target codebase's existing environment** using its patterns and libraries. If there is no codebase yet, pick a suitable stack. A good default is a React/Next.js or Vite + React PWA with Tailwind or CSS modules, plus a small backend (e.g. Supabase) for shared data and photo storage, since two phones need to see the same log.

Open `Slurp Log - Manga.dc.html` in a browser to see all 7 screens side by side at 390×844. `Slurp Log - explorations.dc.html` holds the three earlier directions. Only **1a "Manga panel"** was chosen.

## Fidelity
**High-fidelity** for visual language: colors, type, borders, shadows, and component treatments are final. Copy and data are sample content. Spacing values in the file are intended. Recreate them closely, but adapt to real content lengths. The mockups are static, so the interactions below are specified in writing.

## Visual language (Manga panel)
- Thick black ink outlines everywhere: `3px solid #1D1A17` on cards, inputs, panels, and the nav bar; `2–2.5px` on small chips and bubbles.
- Square corners on panels and cards (manga frames). The only rounded shapes are speech bubbles (`border-radius: 22px`, with one corner at `4px` as the tail; or `50%` for oval bubbles) and the phone frame.
- Hard offset shadows, never blurred: `4px 4px 0 #1D1A17` on primary buttons and featured cards.
- Screentone texture: `background: radial-gradient(#1D1A17 1.1px, transparent 1.3px) 0 0/7px 7px` over paper `#FBFAF7` (or over yellow `#FFD23F`).
- Sound-effect text (onomatopoeia) in Dela Gothic One, red, rotated −8° to −12°: ズル ("slurp"), うまい! ("tasty!"), ドキドキ ("heart pounding"). These are decoration. Use one per screen at most and keep it clear of text.
- Bilingual category labels: English first, Japanese small and muted (スープ Broth, 麺 Noodles, 具 Toppings, 雰囲気 Vibe, コスパ Value).
- Visits are called "Episodes" (Ep.1, Ep.2 …) and the to-try list is "Next episodes / 次回予告".
- Rico = black (#1D1A17), Rhiz = red (#E4382A). Use this pairing in every comparison bar.

## Design Tokens
Colors
- `ink` #1D1A17: text, outlines, Rico's bars, active nav fill
- `paper` #FBFAF7: app background
- `red` #E4382A: primary action, Rhiz's bars, together-score badges, top scores
- `yellow` #FFD23F: highlights (Rhiz's speech bubble, VS badge, verdict callout, champion panel)
- `muted` #6B635A: secondary text; `placeholder` #8A8278
- `placeholder stripes` #EEEAE2 / #D9D3C7 (image placeholders only)
- Canvas background behind the phones: #E8E4DC (presentation only)

Typography (Google Fonts)
- Display: **Dela Gothic One** 400, used for titles, scores, and sound effects. Sizes: screen title 24px, hero title 40px with line-height 0.95, detail title 30px, big score 28–32px, stat value 22–24px, list score 24–28px.
- UI/body: **M PLUS Rounded 1c** at 400, 700, and 800. Body 14px with line-height 1.45; list names 16px/800; meta 12–13px/400–700 muted; tiny labels 11px/800 UPPERCASE; nav 12px/800.

Spacing
- Screen side padding: 16px for panels and 20px for headings.
- Gap between stacked cards: 8–10px. Gap inside rows: 12px.
- Card padding: 6px for thumbnail rows, 8–10px for stat boxes, 10–14px for content cards.
- Hit targets are at least 44px. The nav is 62px tall, inputs and buttons 46–58px.

Radius: 0 everywhere except speech bubbles (22px, with a 4px tail corner).
Shadows: `4px 4px 0 #1D1A17` (buttons, featured cards), `3px 3px 0 #1D1A17` (map pins).

## Screens / Views

### 01 Home (Log)
- Status bar, then a **hero panel** (3px border, 200px tall, screentone background with a white radial fade). Inside: a black chip "第5話 · CH.5" (top-left); a title "RAMEN QUEST!" in Dela 40px; a mascot art slot (120×120, dashed border, top-right); an oval speech bubble "5 bowls. still hungry!!" (bottom-left); and the sound effect ズル in red (bottom-right).
- **Stat strip**: 3 equal boxes with 8px gaps and 3px borders: Our avg (7.9), Best bowl (Kaze), Harsh critic (Rico). The third box is red-filled with white text.
- Section header "Episodes" with エピソード in small muted text.
- **Episode rows**: a grid of 64px thumbnail, info column, and score; 3px border; 6px padding. Name 16px/800; meta "Ep.5 · Miso · 4 Oct" 12px muted; score in Dela 28px. Only the highest-scoring row's score is red. Newest first. Tapping a row opens Detail.
- **Bottom nav** (shared by all main screens): 3px-bordered bar with 4 equal cells (Log, Ranks, Map, To-try) plus a 64px red "+" cell separated by a 3px left border. The active cell is filled ink with white text. Tapping "+" opens Add bowl.

### 02 Add bowl (New episode)
- Header: "✕ Cancel" on the left and the centered title "New episode".
- Fields: Spot ("WHERE?" label, name 20px/800); style chips (豚骨 Tonkotsu, 醤油 Shoyu, 味噌 Miso, 塩 Shio, plus Tsukemen/Other in the build), single-select, selected chip filled ink. Also add Area and Date fields (not drawn; style them like the Spot field).
- Photos: a 3-column row (1.3fr 1fr 1fr, 96px tall); thumbnails have a 3px border; the add tile has a 3px **dashed** border with "+ photo". Multiple photos allowed.
- **Rater switch**: a 2-cell segmented control: "Rico ✓ 8.0" (done) and "Rhiz's turn!" (active, red fill). Each person fills in their own scores. Switching keeps both drafts.
- **Category scoring**: one row per category with a 78px label (English + Japanese) and a 10-cell grid (gap 3px, cell height 26px). Tapping cell N sets the score to N. Cells 1..N-1 fill ink, cell N fills red and shows the number, cells after N are outlined. Unscored rows are all outlined.
- Note: a bubble-shaped textarea (2.5px border, radius 24px) with the placeholder "Rhiz's thoughts…". Also add an "What we ordered" text field (not drawn; it shows on Detail).
- Sticky save bar: red, 3px border, hard shadow, 58px tall, with "Save episode!" on the left (Dela 18px) and the live "8.2 together" on the right.

### 03 Bowl detail (Episode)
- Photo collage: a 2fr/1fr grid, 120+80px rows, 6px gap. The hero spans 2 rows. One small cell is screentone with the sound effect "うまい!". There is a back button (34px white square, 2.5px border).
- Title block: "EPISODE 1 · 醤油" (12px/800 muted), name in Dela 30px, "Eastside · Sat 13 Sep". Right side: a together-score badge (red, 3px border, rotated 3°, Dela 32px, "TOGETHER" label).
- **VS panel**: a 3px-bordered box. Its header row is ink with "Rico 8.4 | VS (yellow) | 8.8 Rhiz". Below it, per category, a mirrored bar row (grid 1fr / 64px label / 1fr): Rico's bar is ink and grows leftwards from the label; Rhiz's bar is red with a 2px ink border and grows rightwards. Bar height 12px, width = score×10%.
- Comments: speech bubbles. Rico's is left-aligned with a white fill; Rhiz's is right-aligned with a yellow fill. Max width 86%.
- In the build, also show "What we ordered" and Edit/Delete actions.

### 04 Head-to-head (reached from Ranks)
- A split VS panel, 190px tall. The left half is screentone (Rico) and the right half is red (Rhiz). Each half has an avatar art slot and a name/avg tag. A yellow "VS" badge sits centered, rotated −8°.
- 3 stat boxes: "3 / 5 Rhiz scored higher", "1 Exact ties", "1.6 Biggest gap" (the last one ink-filled).
- "Average by category": mirrored bars with numbers on both ends (grid 28px/1fr/64px/1fr/28px).
- Verdict bubble (yellow): a generated one-liner, e.g. which categories each person weights more and the visit with the biggest disagreement.

### 05 Map
- A full-bleed map (use a real map, e.g. MapLibre/Leaflet, with grayscale or desaturated tiles to fit the ink look) behind the top ~544px.
- Filter chips at the top-left: All / Slurped / To-try.
- Pins are score tags: 3px border, hard 3px shadow, Dela 15px. Pins for scores of 8.0 and up are red; others are paper. To-try pins have a **dashed** border and show "?". The selected pin is scaled 1.15.
- A bottom sheet (316px, 3px top border, grab handle) shows the selected spot: thumbnail, "EP.5 · RIVERSIDE · 0.8 km", name, both scores, the together badge, and the buttons "Open episode" and "Directions →" (yellow). Directions opens the native maps app.

### 06 To-try (Next episodes / 次回予告)
- Add row: a text input and a 58px ink "+" button.
- Cards: 3px border, name in Dela 19px, note line (style · tip · whose pick). The first or pinned card gets a "NEXT UP" red label and a hard shadow. A card with no info yet has a dashed border and muted text.
- "Went!" button: tapping it opens Add bowl with the spot name prefilled, and removes the item after saving. The first card's button is red-filled; the others are outlined.
- "Can't decide? Spin it!" bubble plus the ドキドキ sound effect. Tapping it picks a random to-try spot. Optional; a nice-to-have.

### 07 Leaderboard (Rankings / ランキング)
- Header link "Head-to-head →".
- Category filter chips: Overall, Broth, Noodles, Toppings, Vibe, Value (single-select, active chip ink). The ranking re-sorts by the combined score for that category.
- Champion panel: yellow with screentone, 190px. Contains "No.1 ★ CHAMPION", the name in Dela 30px on a paper plate, the score badge, a style/episode chip, and the bowl photo.
- Rows 02+: an outlined rank number (Dela 30px, paper fill, 2px ink text-stroke), name, "Style · Rico x · Rhiz y", and the score. Rows are separated by 3px ink rules.

## Interactions & Behavior
- Navigation: a bottom nav with 4 tabs plus the "+" button. Detail, Add, and Head-to-head are pushed screens with Back or Cancel.
- Press states: buttons translate (2px, 2px) and lose their hard shadow (a "pressed into the page" effect), with a 80–120ms transition. Avoid opacity fades.
- Add bowl validation: a spot name is required. At least one person must have scored at least one category. Unscored categories are left out of averages and shown as "–".
- Scores are integers 1–10 per category. Personal overall = mean of that person's scored categories. Together = mean of the available personal overalls. Show one decimal place.
- Photos: compress on the client before upload (about 1600px on the long edge, JPEG/WebP). Show them in color.
- Empty states: Home with no visits shows the hero with "0 bowls. let's go eat!!" and a big "+" call to action. To-try with no items shows "No leads yet. Ask a friend!".
- Responsive: designed at 390px wide. The app column caps at 480px and sits centered on larger screens. Make it installable as a PWA (add-to-home-screen).

## State Management
```ts
type Person = { id: 'a' | 'b'; name: string };            // Rico, Rhiz (editable)
type Category = 'broth' | 'noodles' | 'toppings' | 'vibe' | 'value';
type Visit = {
  id: string; foodType: 'ramen' | string;                 // future: other foods
  spotName: string; area?: string; style?: string;        // Tonkotsu/Shoyu/Shio/Miso/Tsukemen/Other
  lat?: number; lng?: number; date: string;               // ISO date
  ordered?: string; photos: string[];                     // storage URLs
  scores: Record<'a'|'b', Partial<Record<Category, number>>>;
  notes: Record<'a'|'b', string>;
};
type WishItem = { id: string; spotName: string; note?: string; addedBy: 'a'|'b'; lat?: number; lng?: number; pinned?: boolean };
```
- Derived values: per-visit personal and together scores; episode number (chronological index); home stats (count, average together score, best bowl, the "harsher critic" = whoever has the lower mean); head-to-head stats (per-category means for each person, count of visits each person scored higher, ties, largest gap and which visit it was); rankings per category.
- Shared data: both partners must see the same log, so use a shared "household" record with realtime sync, or a single shared login.
- Keep categories config-driven per `foodType` so non-ramen foods can define their own categories later.

## Assets
- No final imagery yet. All striped boxes are placeholders: bowl photos (user uploads), mascot art for the Home hero, and Rico/Rhiz avatar art for Head-to-head. Commission or draw original anime-style art; do not use copyrighted characters.
- Fonts: Dela Gothic One and M PLUS Rounded 1c (Google Fonts, OFL).
- Icons: the mockups use text glyphs (←, ✕, +, ★). Swap in an icon set with heavy strokes (e.g. Lucide at stroke-width 2.5–3) or keep the glyphs.

## Files
- `Slurp Log - Manga.dc.html`: the chosen direction, all 7 screens (labels 01–07). This is the main reference.
- `Slurp Log - explorations.dc.html`: earlier explorations (1a/1b/1c), for context only.
- `support.js`: the runtime needed to open the .dc.html files in a browser.
