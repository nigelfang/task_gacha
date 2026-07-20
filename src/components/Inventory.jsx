import { useState } from "react";
import { BANNERS } from "../data/banners.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: 5, label: "★★★★★" },
  { key: 4, label: "★★★★" },
  { key: 3, label: "★★★" },
];

export default function Inventory({ save }) {
  const [filter, setFilter] = useState("all");
  const items = Object.values(save.inventory)
    .filter((it) => filter === "all" || it.rarity === filter)
    .sort((a, b) => b.rarity - a.rarity || b.count - a.count || a.name.localeCompare(b.name));

  const bannerName = (id) => BANNERS.find((b) => b.id === id)?.name ?? "Retired banner";
  const unique = Object.keys(save.inventory).length;

  return (
    <section className="inventory">
      <div className="inv-header">
        <h1>Inventory</h1>
        <div className="inv-stats">
          <span className="chip">🎲 {save.stats.totalPulls} total pulls</span>
          <span className="chip chip-gold">★5 owned: {save.stats.fiveStars}</span>
          <span className="chip chip-purple">★4 owned: {save.stats.fourStars}</span>
          <span className="chip">{unique} unique prizes</span>
        </div>
      </div>

      <div className="inv-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? "active" : ""}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="empty">
          {unique === 0
            ? "Nothing here yet — pick a banner and tempt fate."
            : "No prizes of this rarity yet. The gacha awaits."}
        </p>
      ) : (
        <div className="inv-grid">
          {items.map((it) => (
            <div key={it.name} className={`inv-card r${it.rarity}`}>
              <span className="card-icon">{it.icon}</span>
              <span className={`stars ${it.rarity === 5 ? "gold" : it.rarity === 4 ? "purple" : "blue"}`}>
                {"★".repeat(it.rarity)}
              </span>
              <span className="card-name">{it.name}</span>
              <span className="inv-meta">{bannerName(it.bannerId)}</span>
              {it.count > 1 && <span className="badge count">×{it.count}</span>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
