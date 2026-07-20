import { useEffect, useRef, useState } from "react";
import { BANNERS, CONFIG } from "./data/banners.js";
import { freshPity, rollMany } from "./gacha.js";
import { clearSave, loadSave, persistSave } from "./storage.js";
import BannerMenu from "./components/BannerMenu.jsx";
import BannerView from "./components/BannerView.jsx";
import RollOverlay from "./components/RollOverlay.jsx";
import Inventory from "./components/Inventory.jsx";

const DAILY_COOLDOWN_MS = CONFIG.dailyCollectCooldownHours * 60 * 60 * 1000;

function formatCooldown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function App() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState({ name: "menu" }); // menu | banner | inventory
  const [overlay, setOverlay] = useState(null); // { banner, results, refund }
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const toastTimer = useRef(null);

  useEffect(() => persistSave(save), [save]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const pityFor = (bannerId) => save.pity[bannerId] ?? freshPity();

  const doRoll = (banner, count) => {
    const cost = count === 10 ? CONFIG.costTen : CONFIG.costSingle * count;
    if (save.credits < cost) {
      showToast(`Not enough credits — need ${cost.toLocaleString()} 💎`);
      return;
    }

    const pity = { ...pityFor(banner.id) };
    const raw = rollMany(banner, pity, count);

    // Apply inventory changes; tag results with isNew / dupe refund
    const inventory = { ...save.inventory };
    let refund = 0;
    let fiveStars = 0;
    let fourStars = 0;
    const results = raw.map(({ item, fiftyResult }) => {
      if (item.rarity === 5) fiveStars++;
      if (item.rarity === 4) fourStars++;
      const owned = inventory[item.name];
      let isNew = false;
      let bonus = 0;
      if (owned) {
        inventory[item.name] = { ...owned, count: owned.count + 1 };
        bonus = CONFIG.dupeBonus[item.rarity] ?? 0;
        refund += bonus;
      } else {
        inventory[item.name] = { ...item, count: 1, bannerId: banner.id };
        isNew = true;
      }
      return { item, fiftyResult, isNew, bonus };
    });

    setSave((s) => ({
      ...s,
      credits: s.credits - cost + refund,
      pity: { ...s.pity, [banner.id]: pity },
      inventory,
      stats: {
        totalPulls: s.stats.totalPulls + count,
        fiveStars: s.stats.fiveStars + fiveStars,
        fourStars: s.stats.fourStars + fourStars,
      },
    }));
    setOverlay({ banner, results, refund });
  };

  const msSinceCollect = save.lastCollect == null ? Infinity : now - save.lastCollect;
  const canCollect = msSinceCollect >= DAILY_COOLDOWN_MS;
  const msUntilCollect = canCollect ? 0 : DAILY_COOLDOWN_MS - msSinceCollect;

  const dailyCollect = () => {
    if (!canCollect) return;
    setSave((s) => ({ ...s, credits: s.credits + CONFIG.dailyCollectAmount, lastCollect: Date.now() }));
    showToast(`+${CONFIG.dailyCollectAmount.toLocaleString()} 💎 collected!`);
  };

  const consumeItem = (name, qty) => {
    setSave((s) => {
      const owned = s.inventory[name];
      if (!owned) return s;
      const remaining = owned.count - qty;
      const inventory = { ...s.inventory };
      if (remaining > 0) {
        inventory[name] = { ...owned, count: remaining };
      } else {
        delete inventory[name];
      }
      return { ...s, inventory };
    });
    showToast(`Consumed ${qty > 1 ? `${qty}× ` : ""}${name}`);
  };

  const resetSave = () => {
    if (confirm("Wipe credits, pity, and inventory? This can't be undone.")) {
      clearSave();
      setSave(loadSave());
      setScreen({ name: "menu" });
      showToast("Save wiped — fresh start!");
    }
  };

  const banner =
    screen.name === "banner" ? BANNERS.find((b) => b.id === screen.bannerId) : null;

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setScreen({ name: "menu" })}>
          ✦ Love and Deeptask
        </button>
        <nav className="nav">
          <button
            className={screen.name !== "inventory" ? "active" : ""}
            onClick={() => setScreen({ name: "menu" })}
          >
            Banners
          </button>
          <button
            className={screen.name === "inventory" ? "active" : ""}
            onClick={() => setScreen({ name: "inventory" })}
          >
            Inventory
            {Object.keys(save.inventory).length > 0 && (
              <span className="nav-badge">{Object.keys(save.inventory).length}</span>
            )}
          </button>
        </nav>
        <div className="wallet">
          <span className="credits">💎 {save.credits.toLocaleString()}</span>
          <button
            className={`collect-btn ${canCollect ? "ready" : "cooldown"}`}
            onClick={dailyCollect}
            disabled={!canCollect}
            title={
              canCollect
                ? `Daily collect: +${CONFIG.dailyCollectAmount}`
                : `Next daily collect in ${formatCooldown(msUntilCollect)}`
            }
          >
            {canCollect ? "🎁 Collect" : formatCooldown(msUntilCollect)}
          </button>
        </div>
      </header>

      <main>
        {screen.name === "menu" && (
          <BannerMenu
            banners={BANNERS}
            pityFor={pityFor}
            onSelect={(id) => setScreen({ name: "banner", bannerId: id })}
          />
        )}
        {screen.name === "banner" && banner && (
          <BannerView
            banner={banner}
            pity={pityFor(banner.id)}
            credits={save.credits}
            onRoll={(count) => doRoll(banner, count)}
            onBack={() => setScreen({ name: "menu" })}
          />
        )}
        {screen.name === "inventory" && <Inventory save={save} onConsume={consumeItem} />}
      </main>

      <footer className="footer">
        <button className="danger" onClick={resetSave}>
          Reset save
        </button>
      </footer>

      {overlay && (
        <RollOverlay
          banner={overlay.banner}
          results={overlay.results}
          refund={overlay.refund}
          onClose={() => setOverlay(null)}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
