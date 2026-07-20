import { CONFIG } from "../data/banners.js";

const starsClass = (rarity) => (rarity === 5 ? "gold" : rarity === 4 ? "purple" : "blue");

export default function BannerView({ banner, pity, credits, onRoll, onBack }) {
  const b = banner;
  const canSingle = credits >= CONFIG.costSingle;
  const canTen = credits >= CONFIG.costTen;

  const allItems = [
    { ...b.featured5, rarity: 5, featured: true },
    ...(b.standard5 ?? []).map((it) => ({ ...it, rarity: 5, featured: false })),
    ...(b.featured4 ?? []).map((it) => ({ ...it, rarity: 4, featured: true })),
    ...(b.pool4 ?? []).map((it) => ({ ...it, rarity: 4, featured: false })),
    ...(b.pool3 ?? []).map((it) => ({ ...it, rarity: 3, featured: false })),
  ].sort((x, y) => y.rarity - x.rarity || Number(y.featured) - Number(x.featured));

  return (
    <section
      className="banner-view"
      style={{ "--from": b.theme.from, "--to": b.theme.to, "--accent": b.theme.accent }}
    >
      <button className="back" onClick={onBack}>
        ← All banners
      </button>

      <div className="banner-hero">
        <div className="hero-art">
          <img className="hero-icon" src={b.featured5.image} alt={b.featured5.name} />
          <div className="hero-glow" />
        </div>
        <div className="hero-info">
          <p className="hero-kicker">Rate-Up ★★★★★</p>
          <h1>{b.featured5.name}</h1>
          <p className="hero-desc">{b.featured5.desc}</p>
          {b.featured4?.length > 0 && (
            <div className="featured4-row">
              <span className="hero-kicker small">Rate-Up ★★★★</span>
              {b.featured4.map((f) => (
                <span key={f.name} className="chip chip-purple">
                  <img className="chip-icon" src={f.image} alt="" /> {f.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <details className="items-dropdown">
        <summary>All items in this banner ({allItems.length})</summary>
        <div className="items-dropdown-grid">
          {allItems.map((it) => (
            <div key={it.name} className={`items-dropdown-entry r${it.rarity}`} title={it.desc}>
              <img className="dropdown-item-icon" src={it.image} alt={it.name} />
              <span className={`stars ${starsClass(it.rarity)}`}>{"★".repeat(it.rarity)}</span>
              <span className="dropdown-item-name">{it.name}</span>
              {it.featured && <span className="chip chip-gold dropdown-featured">Rate-up</span>}
            </div>
          ))}
        </div>
      </details>

      <div className="banner-panel">
        <div className="pity-panel">
          <div className="pity-row">
            <span>5★ pity</span>
            <div className="pity-bar">
              <div
                className="pity-fill gold-bg"
                style={{ width: `${Math.min(100, (pity.pity5 / CONFIG.hardPity5) * 100)}%` }}
              />
              <span
                className="soft-marker"
                style={{ left: `${(CONFIG.softPity5 / CONFIG.hardPity5) * 100}%` }}
                title={`Soft pity starts at ${CONFIG.softPity5}`}
              />
            </div>
            <span className="pity-num">
              {pity.pity5}/{CONFIG.hardPity5}
            </span>
          </div>
          <div className="pity-row">
            <span>4★ pity</span>
            <div className="pity-bar">
              <div
                className="pity-fill purple-bg"
                style={{ width: `${Math.min(100, (pity.pity4 / CONFIG.pity4) * 100)}%` }}
              />
            </div>
            <span className="pity-num">
              {pity.pity4}/{CONFIG.pity4}
            </span>
          </div>
          <p className="pity-note">
            Next 5★:{" "}
            {pity.guaranteed ? (
              <strong className="gold">guaranteed {b.featured5.name}</strong>
            ) : (
              <>50/50 between {b.featured5.name} and the standard pool</>
            )}
          </p>
        </div>

        <div className="roll-buttons">
          <button className="roll-btn" disabled={!canSingle} onClick={() => onRoll(1)}>
            <span className="roll-label">Roll ×1</span>
            <span className="roll-cost">💎 {CONFIG.costSingle.toLocaleString()}</span>
          </button>
          <button className="roll-btn primary" disabled={!canTen} onClick={() => onRoll(10)}>
            <span className="roll-label">Roll ×10</span>
            <span className="roll-cost">
              💎 {CONFIG.costTen.toLocaleString()}{" "}
              <s className="old-cost">{(CONFIG.costSingle * 10).toLocaleString()}</s>
            </span>
          </button>
        </div>

        <details className="rates">
          <summary>Drop rates & rules</summary>
          <ul>
            <li>
              5★ base rate {(CONFIG.rates.five * 100).toFixed(1)}% — rises sharply from roll{" "}
              {CONFIG.softPity5} (soft pity), guaranteed at roll {CONFIG.hardPity5}.
            </li>
            <li>
              4★ base rate {(CONFIG.rates.four * 100).toFixed(1)}% — at least one 4★+ every{" "}
              {CONFIG.pity4} rolls.
            </li>
            <li>
              First 5★ is a 50/50 between the rate-up and the standard pool. Losing the 50/50
              guarantees the rate-up next time.
            </li>
            <li>
              Duplicates refund credits: 3★ +{CONFIG.dupeBonus[3]}, 4★ +{CONFIG.dupeBonus[4]},
              5★ +{CONFIG.dupeBonus[5]}.
            </li>
            <li className="standard5-line">
              Standard 5★ pool:{" "}
              {b.standard5.map((s, i) => (
                <span key={s.name} className="standard5-entry">
                  <img className="chip-icon" src={s.image} alt="" /> {s.name}
                  {i < b.standard5.length - 1 && ", "}
                </span>
              ))}
            </li>
          </ul>
        </details>
      </div>
    </section>
  );
}
