# Gacha Sim

A gachapon simulator in the style of Genshin Impact / Love and Deep Space. Pick a banner, roll, watch the reveal, hoard your prizes.

## Run it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Customize banners & prizes

Everything editable lives in **`src/data/banners.js`**:

- `CONFIG` — starting credits, roll costs, drop rates, pity thresholds, duplicate refunds.
- `BANNERS` — the banner list. Each banner defines its featured 5★, the standard 5★ pool (what you lose the 50/50 to), featured/regular 4★s, and the 3★ pool. Items are just `{ name, image, desc }`, where `image` is the filename of an art asset.

Add or remove banners freely; the menu adapts. Item names must be unique (they key the inventory), and changing a banner's `id` resets its pity counter.

### Item art

Item images live in **`src/assets/items/`**. Drop a `.png`/`.jpg`/`.webp`/`.gif`/`.svg` file in there and reference its filename as the `image` argument to `item(...)` in `banners.js`. If a referenced file is missing, the app logs a warning and falls back to a placeholder image so it still runs.

### Roll animation

The pre-reveal streak animation (~10s) plays a looping background clip from **`src/assets/effects/roll.gif`** (swap it by replacing that file, keeping the name `roll`; `.gif`/`.webp`/`.png`/`.apng` all work). Click anywhere during the streak to skip it.

One comet flies in per pulled item — roll ×10 shows 10 comets staggered across the animation — and a rarity-color layer is blended on top of each (`mix-blend-mode: color`), so whatever comet art you use gets recolored blue/purple/gold to match that item's rarity automatically. Comet art comes from **`CONFIG.cometGifs`** in `banners.js`: a list of entries, each either

- a filename in `src/assets/effects/` (e.g. `"comet.gif"`), or
- a direct image URL — Giphy share links (`giphy.com/gifs/...`) are auto-converted to their direct `.gif`; other hosts need the direct media link (one ending in `.gif`/`.webp`/`.png`, not a webpage).

One entry from the list is picked at random for each comet, every roll. Leave `cometGifs` empty and the app auto-uses whatever local file(s) named `comet*.*` are in `src/assets/effects/` (ships with one placeholder, `comet.gif`).

## Mechanics

- 5★ base rate 0.6%, soft pity ramps from roll 66, hard pity guarantees at 80.
- At least one 4★+ every 10 rolls.
- 50/50: first 5★ is a coin flip between the rate-up and the standard pool; losing guarantees the rate-up next time.
- 10-roll discount, duplicate credit refunds, per-banner pity tracking.
- "Reset save" in the footer wipes everything; the "🎁 Collect" button by your credits grants a free daily top-up with a 12-hour cooldown (shown as a countdown once claimed).
- Each banner page has an "All items in this banner" dropdown listing every possible drop (rate-ups, standard pool, and the regular 4★/3★ pools) with art and rarity.
- Clicking a prize in the Inventory opens a popup to consume it — pick a quantity (up to how many you own) and confirm. Consuming just removes the copies; there's no credit refund for it.

## Accounts & cloud save (Supabase)

Saves can either stay in this browser's `localStorage` (guest mode, no setup needed — this is the default) or sync to an account via [Supabase](https://supabase.com) (free tier). Both are wired up already; you just need to point the app at your own Supabase project.

**Setup:**

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the SQL editor (left sidebar) → New query → paste in **`supabase/schema.sql`** → Run. This creates the `saves` table with row-level security so each account can only read/write its own save.
3. Go to Project Settings → API and copy the **Project URL** and **anon public** key.
4. Copy `.env.example` to `.env` and fill in those two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Restart `npm run dev` (Vite only reads `.env` on startup).
6. By default Supabase requires email confirmation on sign-up. For quick local testing, go to Authentication → Providers → Email and turn off "Confirm email" — otherwise new accounts need to click a confirmation link sent to their inbox before they can sign in.

**Behavior:**

- If `.env` isn't set up, the app skips accounts entirely and behaves exactly as before (guest-only, `localStorage`).
- With Supabase configured, you land on a sign-in/sign-up screen with a "Continue as guest" escape hatch.
- The first time an account signs in with no cloud save yet, it adopts whatever guest progress already exists on that browser (so playing as a guest first, then signing up, doesn't lose anything). After that, the account's cloud save is authoritative.
- "Sign out" (in the thin bar under the header) returns to the sign-in screen; guest saves are untouched and still there if you continue as a guest again.
