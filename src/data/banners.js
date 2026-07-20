// ════════════════════════════════════════════════════════════════════
//  BANNER & GAME CONFIGURATION  —  THIS IS THE FILE YOU EDIT
//
//  Everything customizable lives here: costs, odds, pity rules, and
//  the banners themselves. Save the file and the app hot-reloads
//  (when running `npm run dev`).
// ════════════════════════════════════════════════════════════════════

// ── Game settings ───────────────────────────────────────────────────
export const CONFIG = {
  startingCredits: 16000, // credits a brand-new player starts with
  costSingle: 160,        // cost of a single roll
  costTen: 1440,          // cost of a 10-roll (discounted vs 1600)
  freeTopUp: 1600,        // credits granted by the "Free top-up" button

  rates: {
    five: 0.006, // base 5★ chance per roll (0.6%)
    four: 0.051, // base 4★ chance per roll (5.1%)
  },
  softPity5: 66,      // 5★ odds start climbing at this roll count
  softPityRamp: 0.06, // extra 5★ chance added per roll past soft pity
  hardPity5: 80,      // a 5★ is guaranteed on this roll
  pity4: 10,          // at least one 4★-or-better every N rolls
  featuredChance4: 0.5, // chance a 4★ drop comes from the featured 4★ list

  // Credits refunded when you pull an item you already own
  dupeBonus: { 3: 15, 4: 50, 5: 500 },
};

// ── Item helper ─────────────────────────────────────────────────────
// An item is { name, icon, desc }.
//   name  must be unique across all banners (it's the inventory key)
//   icon  any emoji (or 1–2 characters of text)
//   desc  short flavor text shown on the card
const item = (name, icon, desc = "") => ({ name, icon, desc });

// ── Banners ─────────────────────────────────────────────────────────
// Each banner has:
//   id         unique string — used in save data, don't reuse or rename
//              casually (renaming resets that banner's pity counter)
//   name       display name
//   tagline    short flavor text on the banner card
//   theme      { from, to, accent } — CSS colors for the banner art
//   featured5  THE rate-up 5★. The 50/50 system applies to it.
//   standard5  off-banner 5★s you can lose the 50/50 to
//   featured4  rate-up 4★s (picked featuredChance4 of the time a 4★ drops)
//   pool4      the other 4★s
//   pool3      common 3★ drops
//
// Add, remove, or re-theme banners freely — the menu adapts.
export const BANNERS = [
  {
    id: "crimson-eclipse",
    name: "Crimson Eclipse",
    tagline: "The Ashen Valkyrie descends",
    theme: { from: "#3b0d17", to: "#1a0b2e", accent: "#ff6b6b" },
    featured5: item("Seraphina, Ashen Valkyrie", "🔥", "She burned her wings so the dawn could rise."),
    standard5: [
      item("Ignar, Dragonlord Ascendant", "🐉", "The mountain that learned to fly."),
      item("Lumielle, Saint of Dawn", "🌅", "Her prayer is a sunrise that never ends."),
      item("Voidkeeper Thane", "🌑", "He guards the door that must not open."),
    ],
    featured4: [
      item("Ember Witch Calla", "🧙‍♀️", "Sparks follow her like loyal pets."),
      item("Knight of Briars Rowan", "🌹", "Every thorn a promise kept."),
    ],
    pool4: [
      item("Stormcaller Ilya", "⛈️", "Argues with the sky. Usually wins."),
      item("Runeblade Cassia", "🗡️", "Her sword remembers every duel."),
      item("Frostbow Neve", "🏹", "One shot, one winter."),
      item("Alchemist Puck", "⚗️", "Explosions are just enthusiastic chemistry."),
    ],
    pool3: [
      item("Iron Longsword", "⚔️", "Reliable. Pointy."),
      item("Oak Shortbow", "🪵", "It creaks encouragingly."),
      item("Apprentice Grimoire", "📕", "Chapter one: don't panic."),
      item("Traveler's Spear", "🔱", "Doubles as a walking stick."),
      item("Bronze Buckler", "🛡️", "Has stopped at least one arrow."),
      item("Rusty Dagger", "🔪", "Tetanus sold separately."),
    ],
  },
  {
    id: "stellar-hearts",
    name: "Stellar Hearts",
    tagline: "Some orbits are meant to cross",
    theme: { from: "#0b1e3d", to: "#2a0b3d", accent: "#ff8fd8" },
    featured5: item("Kael — Event Horizon", "🌌", "Past the point of no return, he was already holding your hand."),
    standard5: [
      item("Orion — First Light", "✨", "The first star you ever wished on."),
      item("Cassian — Gravity's Pull", "🪐", "You fell. He calls it physics."),
      item("Nova — Solar Flare", "☀️", "Too bright to look at. Impossible to look away."),
    ],
    featured4: [
      item("Kael — Starlit Promise", "💫", "A vow written in constellations."),
      item("Orion — Midnight Signal", "📡", "Three beeps: I. Miss. You."),
    ],
    pool4: [
      item("Cassian — Neon Rain", "🌧️", "The city glowed, but he watched you."),
      item("Nova — Comet Trail", "☄️", "Catch him if you can."),
      item("Kael — Quiet Orbit", "🌙", "Comfortable silence, light-years wide."),
      item("Orion — Photon Waltz", "🕺", "May I have this lightspeed dance?"),
    ],
    pool3: [
      item("Coffee Date Memory", "☕", "Two cups, one blanket of steam."),
      item("Rainy Walk Memory", "☔", "One umbrella was definitely intentional."),
      item("Arcade Night Memory", "🕹️", "He let you win. You let him think that."),
      item("Stargazing Memory", "🔭", "You watched the stars. He watched you."),
      item("Text Message Memory", "💬", "Read 2:47 AM. Replied 2:47 AM."),
      item("Shared Playlist Memory", "🎧", "Track 7 is about you."),
    ],
  },
  {
    id: "mundane-miracles",
    name: "Mundane Miracles",
    tagline: "Legendary loot for ordinary life",
    theme: { from: "#0d3b2e", to: "#2e2a0b", accent: "#ffd166" },
    featured5: item("The Infinite Coffee Mug", "☕", "Scientists are baffled. Baristas are furious."),
    standard5: [
      item("The One Red Pen", "🖊️", "Forged to grade them all."),
      item("Ergonomic Throne", "🪑", "Your back pain trembles before it."),
      item("Golden Stapler of Dawn", "✨", "Binds documents and destinies alike."),
    ],
    featured4: [
      item("Sticky Notes of Prophecy", "🗒️", "They already know what you forgot."),
      item("First-Try USB Cable", "🔌", "Plugs in correctly. Every. Time."),
    ],
    pool4: [
      item("Headphones of Focus", "🎧", "+10 to ignoring everything."),
      item("Self-Refilling Snack Drawer", "🍪", "Audited weekly. Never explained."),
      item("The Immortal Desk Plant", "🪴", "Thrives on neglect and cold brew."),
      item("Thunderclack Keyboard", "⌨️", "Coworkers know when you're inspired."),
    ],
    pool3: [
      item("Ballpoint Pen", "🖊️", "Works 60% of the time, every time."),
      item("Paper Clip", "📎", "Contains one (1) idea."),
      item("Push Pin", "📌", "Point taken."),
      item("Plain Envelope", "✉️", "Full of potential. And nothing else."),
      item("Rubber Band", "➰", "Snaps back. Unlike Mondays."),
      item("Coffee Stirrer", "🥄", "Stirrer of drinks. Starter of nothing."),
    ],
  },
];
