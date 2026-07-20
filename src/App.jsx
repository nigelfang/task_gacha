import { useEffect, useRef, useState } from "react";
import { BANNERS, CONFIG } from "./data/banners.js";
import { freshPity, rollMany } from "./gacha.js";
import { clearSave, loadSave, persistSave } from "./storage.js";
import BannerMenu from "./components/BannerMenu.jsx";
import BannerView from "./components/BannerView.jsx";
import RollOverlay from "./components/RollOverlay.jsx";
import Inventory from "./components/Inventory.jsx";

export default function App() {
  const [save, setSave] = useState(loadSave);
  const [screen, setScreen] = useState({ name: "menu" }); // menu | banner | inventory
  const [overlay, setOverlay] = useState(null); // { banner, results, refund }
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => persistSave(save), [save]);

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

  const topUp = () => {
    setSave((s) => ({ ...s, credits: s.credits + CONFIG.freeTopUp }));
    showToast(`+${CONFIG.freeTopUp.toLocaleString()} 💎 claimed!`);
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
          ✦ Gacha Sim
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
          <button className="topup" onClick={topUp} title={`Free top-up: +${CONFIG.freeTopUp}`}>
            ＋
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
        {screen.name === "inventory" && <Inventory save={save} />}
      </main>

      <footer className="footer">
        <span>
          Rolls are simulated — 5★ base {(CONFIG.rates.five * 100).toFixed(1)}%, hard pity{" "}
          {CONFIG.hardPity5}. Edit <code>src/data/banners.js</code> to customize.
        </span>
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
