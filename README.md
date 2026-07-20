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
- `BANNERS` — the banner list. Each banner defines its featured 5★, the standard 5★ pool (what you lose the 50/50 to), featured/regular 4★s, and the 3★ pool. Items are just `{ name, icon, desc }` — icons are emoji, so no art assets needed.

Add or remove banners freely; the menu adapts. Item names must be unique (they key the inventory), and changing a banner's `id` resets its pity counter.

## Mechanics

- 5★ base rate 0.6%, soft pity ramps from roll 66, hard pity guarantees at 80.
- At least one 4★+ every 10 rolls.
- 50/50: first 5★ is a coin flip between the rate-up and the standard pool; losing guarantees the rate-up next time.
- 10-roll discount, duplicate credit refunds, per-banner pity tracking.
- Credits, pity, and inventory persist in localStorage. "Reset save" in the footer wipes everything; the ＋ button by your credits is a free top-up.
