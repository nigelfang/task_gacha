// ════════════════════════════════════════════════════════════════════
//  BANNER & GAME CONFIGURATION  —  THIS IS THE FILE YOU EDIT
//
//  Everything customizable lives here: costs, odds, pity rules, and
//  the banners themselves. Save the file and the app hot-reloads
//  (when running `npm run dev`).
// ════════════════════════════════════════════════════════════════════

// ── Game settings ───────────────────────────────────────────────────
export const CONFIG = {
  startingCredits: 1000, // credits a brand-new player starts with
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
    featured5: item("Maid Outfit", "maid.jpg", "Maid outfit for nacho to wear."),
    standard5: [

    ],
    featured4: [
      item("Mimi Petting Zoo", "petting.png", "All you can pet until mimi gets angry."),
    ],
    pool4: [
      item("Howlin Ray's Hot Chicken", "howlin.jpg", "Spicy chicken from Howlin Ray's."),
    ],
    pool3: [
      item("Soup Time", "soup-harrassment.png", "Harrass soup until she gives up."),
      item("Ice Cream - Nacho", "ice_cream.jpg", "Yummy ice cream when it hot."),
      item("Boba - Nacho", "boba.png", "Booba."),
      item("Shaved Ice - Nacho", "shaved_ice.webp", "Ululanis?"),
      item("Frozen Yogurt - Nacho", "froyo.png", "Froyo."),
    ],
  },
  {
    id: "laney-banner",
    name: "Laney Banner",
    tagline: "Prizes that you can get yourself",
    theme: { from: "#0b1e3d", to: "#2a0b3d", accent: "#ff8fd8" },
    featured5: item("VIP Concert Tickets", "vip.jpg", "VIP Tickets to a cool concert."),
    standard5: [

    ],
    featured4: [
    ],
    pool4: [
      item("K-Pop Photo Card", "photo-card.jpg", "A K-Pop photo card"),
      item("K-Pop Album", "kpop-album.png", "A K-Pop album"),

    ],
    pool3: [
      item("Ice Cream", "ice_cream.jpg", "Yummy ice cream when it hot."),
      item("Boba", "boba.png", "Booba."),
      item("Shaved Ice", "shaved_ice.webp", "Ululanis?"),
      item("Frozen Yogurt", "froyo.png", "Froyo."),
    ],
  },
  /*
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
  */
];
