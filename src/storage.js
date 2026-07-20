import { CONFIG } from "./data/banners.js";

const KEY = "gacha-sim-save-v1";

export function defaultSave() {
  return {
    credits: CONFIG.startingCredits,
    pity: {},      // bannerId -> pity object
    inventory: {}, // item name -> { name, image, desc, rarity, count, bannerId }
    stats: { totalPulls: 0, fiveStars: 0, fourStars: 0 },
    lastCollect: null, // timestamp (ms) of the last daily collect claim, or null
  };
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultSave();
    return { ...defaultSave(), ...JSON.parse(raw) };
  } catch {
    return defaultSave();
  }
}

export function persistSave(save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(save));
  } catch {
    /* storage unavailable — play without persistence */
  }
}

export function clearSave() {
  localStorage.removeItem(KEY);
}
