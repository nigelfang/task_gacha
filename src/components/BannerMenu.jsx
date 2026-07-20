import { CONFIG } from "../data/banners.js";

export default function BannerMenu({ banners, pityFor, onSelect }) {
  return (
    <section className="menu">
      <h1 className="menu-title">Choose a Banner</h1>
      <p className="menu-sub">Every wish is a small act of hope. Or math. Mostly math.</p>
      <div className="banner-grid">
        {banners.map((b) => {
          const pity = pityFor(b.id);
          return (
            <button
              key={b.id}
              className="banner-card"
              style={{ "--from": b.theme.from, "--to": b.theme.to, "--accent": b.theme.accent }}
              onClick={() => onSelect(b.id)}
            >
              <div className="banner-card-art">
                <span className="banner-card-icon">{b.featured5.icon}</span>
                <div className="banner-card-glow" />
              </div>
              <div className="banner-card-body">
                <h2>{b.name}</h2>
                <p className="tagline">{b.tagline}</p>
                <p className="featured-line">
                  <span className="stars gold">★★★★★</span> {b.featured5.name}
                </p>
                <div className="chips">
                  <span className="chip">
                    Pity {pity.pity5}/{CONFIG.hardPity5}
                  </span>
                  {pity.guaranteed && <span className="chip chip-gold">Rate-up guaranteed</span>}
                  <span className="chip">{pity.pulls} pulls</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
