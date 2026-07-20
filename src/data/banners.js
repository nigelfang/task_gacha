// ════════════════════════════════════════════════════════════════════
//  BANNER & GAME CONFIGURATION  —  THIS IS THE FILE YOU EDIT
//
//  Everything customizable lives here: costs, odds, pity rules, and
//  the banners themselves. Save the file and the app hot-reloads
//  (when running `npm run dev`).
// ════════════════════════════════════════════════════════════════════

// ── Game settings ───────────────────────────────────────────────────
export const CONFIG = {
  startingCredits: 100000, // credits a brand-new player starts with
  costSingle: 160,        // cost of a single roll
  costTen: 1440,          // cost of a 10-roll (discounted vs 1600)
  dailyCollectAmount: 100,     // credits granted by the daily collect button
  dailyCollectCooldownHours: 12, // hours between daily collects

  rates: {
    five: 0.004, // base 5★ chance per roll (0.6%)
    four: 0.041, // base 4★ chance per roll (5.1%)
  },
  softPity5: 76,      // 5★ odds start climbing at this roll count
  softPityRamp: 0.04, // extra 5★ chance added per roll past soft pity
  hardPity5: 100,      // a 5★ is guaranteed on this roll
  pity4: 30,          // at least one 4★-or-better every N rolls
  featuredChance4: 0.4, // chance a 4★ drop comes from the featured 4★ list

  // Credits refunded when you pull an item you already own
  dupeBonus: { 3: 15, 4: 50, 5: 500 },

  // Comet art for the roll animation. Each entry is either a filename in
  // src/assets/effects/ (e.g. "comet.gif") or a direct image URL — Giphy
  // share links (giphy.com/gifs/...) are auto-converted to their direct
  // .gif; other hosts need the direct media link (ending in .gif/.webp/.png).
  // One entry is picked at random per comet on every roll. Leave empty to
  // auto-use whatever local file(s) named comet*.* you have in that folder.
  cometGifs: [
    "https://media.giphy.com/media/s7tpEMLzriGWuRIi0e/giphy.gif",
    "https://media.giphy.com/media/yPAWyc35MhDUNrzySi/giphy.gif",
    "https://media.giphy.com/media/EADTT88AK7YUNY7qaq/giphy.gif",
    "https://media.giphy.com/media/JCSr1AN4mNgLKAy3a0/giphy.gif",
    "https://media.giphy.com/media/pbKSEFrEEudOIclaL8/giphy.gif",
    "https://media.giphy.com/media/dnSDhYT5Y9a7yvtwmU/giphy.gif",
    "https://media.giphy.com/media/FF5i6JkK5BE83PU9K1/giphy.gif",
    "https://media.giphy.com/media/N0NrT8LOweVJBau89o/giphy.gif",
    "https://media.giphy.com/media/MQGNf0r6Xagrw5KfVL/giphy.gif",
    "https://media.giphy.com/media/GDKFgaD6n4TBVitoGu/giphy.gif",
    "https://media.giphy.com/media/LOXAmVhFOdo0BmP9n6/giphy.gif",
    "https://media.giphy.com/media/KDJyeD3ek5biJLIEpB/giphy.gif",
    "https://media.giphy.com/media/jTAkn6hKyy2esWjOOZ/giphy.gif",
    "https://media.giphy.com/media/KB1GG8B346PxkRwc6B/giphy.gif",
    "https://media.giphy.com/media/ZvxIIsZWjC0RLfDe1c/giphy.gif"
  ],
};

// ── Item images ──────────────────────────────────────────────────────
// Drop art into src/assets/items/ and reference the filename below.
// Missing files fall back to a placeholder so the app still runs.
const itemImageFiles = import.meta.glob("../assets/items/*.{png,jpg,jpeg,webp,gif,svg}", {
  eager: true,
  import: "default",
});
const itemImages = Object.fromEntries(
  Object.entries(itemImageFiles).map(([path, url]) => [path.split("/").pop(), url])
);
const placeholderImage = itemImages["_placeholder.svg"];

function resolveImage(image) {
  const url = itemImages[image];
  if (!url) {
    console.warn(`Missing item image "${image}" in src/assets/items/ — using placeholder.`);
  }
  return url ?? placeholderImage;
}

// ── Item helper ─────────────────────────────────────────────────────
// An item is { name, image, desc }.
//   name   must be unique across all banners (it's the inventory key)
//   image  filename of an image in src/assets/items/
//   desc   short flavor text shown on the card
const item = (name, image, desc = "") => ({ name, image: resolveImage(image), desc });

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
    id: "nacho-banner",
    name: "Nacho Banner",
    tagline: "Prizes that Nacho will get you",
    theme: { from: "#3b0d17", to: "#1a0b2e", accent: "#ff6b6b" },
    featured5: item("Maid Outfit", "seraphina.svg", "Maid outfit for nacho to wear."),
    standard5: [
      item("Ignar, Dragonlord Ascendant", "ignar.svg", "The mountain that learned to fly."),
      item("Lumielle, Saint of Dawn", "lumielle.svg", "Her prayer is a sunrise that never ends."),
      item("Voidkeeper Thane", "voidkeeper.svg", "He guards the door that must not open."),
    ],
    featured4: [
      item("Mimi Petting Zoo", "ember-witch-calla.svg", "All you can pet until mimi gets angry."),
      item("Knight of Briars Rowan", "knight-of-briars-rowan.svg", "Every thorn a promise kept."),
    ],
    pool4: [
      item("Stormcaller Ilya", "stormcaller-ilya.svg", "Argues with the sky. Usually wins."),
      item("Runeblade Cassia", "runeblade-cassia.svg", "Her sword remembers every duel."),
      item("Frostbow Neve", "frostbow-neve.svg", "One shot, one winter."),
      item("Alchemist Puck", "alchemist-puck.svg", "Explosions are just enthusiastic chemistry."),
    ],
    pool3: [
      item("Iron Longsword", "iron-longsword.svg", "Reliable. Pointy."),
      item("Oak Shortbow", "oak-shortbow.svg", "It creaks encouragingly."),
      item("Apprentice Grimoire", "apprentice-grimoire.svg", "Chapter one: don't panic."),
      item("Traveler's Spear", "travelers-spear.svg", "Doubles as a walking stick."),
      item("Bronze Buckler", "bronze-buckler.svg", "Has stopped at least one arrow."),
      item("Rusty Dagger", "rusty-dagger.svg", "Tetanus sold separately."),
    ],
  },
  {
    id: "laney-banner",
    name: "Laney Banner",
    tagline: "Prizes that you can get yourself",
    theme: { from: "#0b1e3d", to: "#2a0b3d", accent: "#ff8fd8" },
    featured5: item("Kael — Event Horizon", "kael-event-horizon.svg", "Past the point of no return, he was already holding your hand."),
    standard5: [
      item("Orion — First Light", "orion-first-light.svg", "The first star you ever wished on."),
      item("Cassian — Gravity's Pull", "cassian-gravitys-pull.svg", "You fell. He calls it physics."),
      item("Nova — Solar Flare", "nova-solar-flare.svg", "Too bright to look at. Impossible to look away."),
    ],
    featured4: [
      item("Kael — Starlit Promise", "kael-starlit-promise.svg", "A vow written in constellations."),
      item("Orion — Midnight Signal", "orion-midnight-signal.svg", "Three beeps: I. Miss. You."),
    ],
    pool4: [
      item("Cassian — Neon Rain", "cassian-neon-rain.svg", "The city glowed, but he watched you."),
      item("Nova — Comet Trail", "nova-comet-trail.svg", "Catch him if you can."),
      item("Kael — Quiet Orbit", "kael-quiet-orbit.svg", "Comfortable silence, light-years wide."),
      item("Orion — Photon Waltz", "orion-photon-waltz.svg", "May I have this lightspeed dance?"),
    ],
    pool3: [
      item("Coffee Date Memory", "coffee-date-memory.svg", "Two cups, one blanket of steam."),
      item("Rainy Walk Memory", "rainy-walk-memory.svg", "One umbrella was definitely intentional."),
      item("Arcade Night Memory", "arcade-night-memory.svg", "He let you win. You let him think that."),
      item("Stargazing Memory", "stargazing-memory.svg", "You watched the stars. He watched you."),
      item("Text Message Memory", "text-message-memory.svg", "Read 2:47 AM. Replied 2:47 AM."),
      item("Shared Playlist Memory", "shared-playlist-memory.svg", "Track 7 is about you."),
    ],
  },
  {
    id: "seasonal-banner",
    name: "Seasonal Banner",
    tagline: "Seasonal prizes for limited time",
    theme: { from: "#0d3b2e", to: "#2e2a0b", accent: "#ffd166" },
    featured5: item("The Infinite Coffee Mug", "infinite-coffee-mug.svg", "Scientists are baffled. Baristas are furious."),
    standard5: [
      item("The One Red Pen", "one-red-pen.svg", "Forged to grade them all."),
      item("Ergonomic Throne", "ergonomic-throne.svg", "Your back pain trembles before it."),
      item("Golden Stapler of Dawn", "golden-stapler.svg", "Binds documents and destinies alike."),
    ],
    featured4: [
      item("Sticky Notes of Prophecy", "sticky-notes.svg", "They already know what you forgot."),
      item("First-Try USB Cable", "usb-cable.svg", "Plugs in correctly. Every. Time."),
    ],
    pool4: [
      item("Headphones of Focus", "headphones-of-focus.svg", "+10 to ignoring everything."),
      item("Self-Refilling Snack Drawer", "snack-drawer.svg", "Audited weekly. Never explained."),
      item("The Immortal Desk Plant", "desk-plant.svg", "Thrives on neglect and cold brew."),
      item("Thunderclack Keyboard", "keyboard.svg", "Coworkers know when you're inspired."),
    ],
    pool3: [
      item("Ballpoint Pen", "ballpoint-pen.svg", "Works 60% of the time, every time."),
      item("Paper Clip", "paper-clip.svg", "Contains one (1) idea."),
      item("Push Pin", "push-pin.svg", "Point taken."),
      item("Plain Envelope", "envelope.svg", "Full of potential. And nothing else."),
      item("Rubber Band", "rubber-band.svg", "Snaps back. Unlike Mondays."),
      item("Coffee Stirrer", "coffee-stirrer.svg", "Stirrer of drinks. Starter of nothing."),
    ],
  },
];
