import { useEffect, useRef, useState } from "react";
import { BANNERS, CONFIG } from "./data/banners.js";
import { freshPity, rollMany } from "./gacha.js";
import { defaultSave, clearSave, loadSave, persistSave } from "./storage.js";
import { supabase } from "./supabaseClient.js";
import { fetchCloudSave, pushCloudSave } from "./cloudSave.js";
import Auth from "./components/Auth.jsx";
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
  // session: undefined = still checking, null = signed out, object = signed in.
  // Without Supabase configured (no .env), skip auth entirely and go straight to guest mode.
  const [session, setSession] = useState(supabase ? undefined : null);
  const [mode, setMode] = useState(supabase ? null : "guest"); // null | "guest" | "cloud"
  const [save, setSave] = useState(null);

  const [screen, setScreen] = useState({ name: "menu" }); // menu | banner | inventory
  const [overlay, setOverlay] = useState(null); // { banner, results, refund }
  const [toast, setToast] = useState(null);
  const [now, setNow] = useState(() => Date.now());
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  // Watch auth state.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) setMode("cloud");
  }, [session]);

  // Load the save once we know whether it's coming from the cloud or this browser.
  useEffect(() => {
    if (mode === "guest") {
      setSave(loadSave());
    } else if (mode === "cloud" && session) {
      let cancelled = false;
      fetchCloudSave(session.user.id)
        .then((cloud) => {
          if (cancelled) return;
          if (cloud) {
            setSave(cloud);
          } else {
            // First time this account has signed in — carry over any local/guest
            // progress on this browser instead of starting from zero.
            const initial = loadSave();
            setSave(initial);
            pushCloudSave(session.user.id, initial).catch((e) =>
              showToast(`Cloud save error: ${e.message}`)
            );
          }
        })
        .catch((e) => showToast(`Cloud save error: ${e.message}`));
      return () => {
        cancelled = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, session]);

  // Persist on every change, to whichever backend is active.
  useEffect(() => {
    if (!save) return;
    if (mode === "cloud" && session) {
      pushCloudSave(session.user.id, save).catch((e) => showToast(`Cloud save error: ${e.message}`));
    } else if (mode === "guest") {
      persistSave(save);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [save, mode, session]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

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

  const msSinceCollect = save && save.lastCollect != null ? now - save.lastCollect : Infinity;
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
      const fresh = defaultSave();
      setSave(fresh);
      if (mode === "guest") clearSave();
      setScreen({ name: "menu" });
      showToast("Save wiped — fresh start!");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setMode(null);
    setSave(null);
    setScreen({ name: "menu" });
  };

  const banner =
    screen.name === "banner" ? BANNERS.find((b) => b.id === screen.bannerId) : null;

  if (session === undefined) {
    return <div className="app-loading">Loading…</div>;
  }

  if (supabase && !session && mode !== "guest") {
    return <Auth onGuest={() => setMode("guest")} />;
  }

  if (!save) {
    return <div className="app-loading">Loading your save…</div>;
  }

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

      {supabase && (
        <div className="account-bar">
          {mode === "cloud" && session ? (
            <>
              <span className="account-info">Signed in as {session.user.email}</span>
              <button className="account-action" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <span className="account-info">Guest mode — save stays on this browser</span>
              <button className="account-action" onClick={() => setMode(null)}>
                Sign in
              </button>
            </>
          )}
        </div>
      )}

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
