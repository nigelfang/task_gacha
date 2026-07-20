// Pure gacha logic — no UI, no storage. Deterministic given an rng.
import { CONFIG } from "./data/banners.js";

export function freshPity() {
  return {
    pity5: 0,       // rolls since last 5★
    pity4: 0,       // rolls since last 4★ (or better)
    guaranteed: false, // true = lost last 50/50, next 5★ is the featured one
    pulls: 0,       // lifetime rolls on this banner
  };
}

// Chance of a 5★ on the (pity5+1)-th roll since the last 5★,
// including soft pity ramp and hard pity.
export function fiveStarChance(pity5Before) {
  const n = pity5Before + 1;
  if (n >= CONFIG.hardPity5) return 1;
  let p = CONFIG.rates.five;
  if (n >= CONFIG.softPity5) p += (n - CONFIG.softPity5 + 1) * CONFIG.softPityRamp;
  return Math.min(1, p);
}

const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// Rolls once on `banner`, MUTATING `pity`. Returns { item, fiftyResult }.
//   item        { name, icon, desc, rarity }
//   fiftyResult "won" | "lost" | "guaranteed" | null (non-5★)
export function rollOne(banner, pity, rng = Math.random) {
  let rarity;
  if (rng() < fiveStarChance(pity.pity5)) rarity = 5;
  else if (pity.pity4 + 1 >= CONFIG.pity4 || rng() < CONFIG.rates.four) rarity = 4;
  else rarity = 3;

  let def;
  let fiftyResult = null;

  if (rarity === 5) {
    const noStandardPool = !banner.standard5 || banner.standard5.length === 0;
    if (pity.guaranteed || noStandardPool) {
      def = banner.featured5;
      fiftyResult = "guaranteed";
      pity.guaranteed = false;
    } else if (rng() < 0.5) {
      def = banner.featured5;
      fiftyResult = "won";
    } else {
      def = pick(banner.standard5, rng);
      fiftyResult = "lost";
      pity.guaranteed = true; // next 5★ is the featured one
    }
    pity.pity5 = 0;
    pity.pity4 = 0; // a 5★ also satisfies the 10-roll guarantee
  } else if (rarity === 4) {
    const hasFeatured = banner.featured4 && banner.featured4.length > 0;
    const useFeatured =
      hasFeatured &&
      (rng() < CONFIG.featuredChance4 || !banner.pool4 || banner.pool4.length === 0);
    def = useFeatured ? pick(banner.featured4, rng) : pick(banner.pool4, rng);
    pity.pity4 = 0;
    pity.pity5 += 1;
  } else {
    def = pick(banner.pool3, rng);
    pity.pity4 += 1;
    pity.pity5 += 1;
  }

  pity.pulls += 1;
  return { item: { ...def, rarity }, fiftyResult };
}

export function rollMany(banner, pity, count, rng = Math.random) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(rollOne(banner, pity, rng));
  return out;
}
