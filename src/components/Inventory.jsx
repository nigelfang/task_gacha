import { useState } from "react";
import { BANNERS } from "../data/banners.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: 5, label: "★★★★★" },
  { key: 4, label: "★★★★" },
  { key: 3, label: "★★★" },
];

export default function Inventory({ save, onConsume }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null); // item being considered for consuming
  const [qty, setQty] = useState(1);
  const items = Object.values(save.inventory)
    .filter((it) => filter === "all" || it.rarity === filter)
    .sort((a, b) => b.rarity - a.rarity || b.count - a.count || a.name.localeCompare(b.name));

  const bannerName = (id) => BANNERS.find((b) => b.id === id)?.name ?? "Retired banner";
  const unique = Object.keys(save.inventory).length;

  const openConsume = (it) => {
    setSelected(it);
    setQty(1);
  };

  const confirmConsume = () => {
    onConsume(selected.name, qty);
    setSelected(null);
  };

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
            <button
              key={it.name}
              className={`inv-card r${it.rarity}`}
              onClick={() => openConsume(it)}
            >
              <img className="card-icon" src={it.image} alt={it.name} />
              <span className={`stars ${it.rarity === 5 ? "gold" : it.rarity === 4 ? "purple" : "blue"}`}>
                {"★".repeat(it.rarity)}
              </span>
              <span className="card-name">{it.name}</span>
              <span className="inv-meta">{bannerName(it.bannerId)}</span>
              {it.count > 1 && <span className="badge count">×{it.count}</span>}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="consume-backdrop" onClick={() => setSelected(null)}>
          <div className="consume-modal" onClick={(e) => e.stopPropagation()}>
            <img className="card-icon" src={selected.image} alt={selected.name} />
            <span
              className={`stars ${selected.rarity === 5 ? "gold" : selected.rarity === 4 ? "purple" : "blue"}`}
            >
              {"★".repeat(selected.rarity)}
            </span>
            <span className="card-name">{selected.name}</span>
            {selected.desc && <span className="consume-desc">{selected.desc}</span>}
            <span className="consume-owned">You own {selected.count}</span>

            <div className="qty-stepper">
              <button
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="qty-value">{qty}</span>
              <button
                disabled={qty >= selected.count}
                onClick={() => setQty((q) => Math.min(selected.count, q + 1))}
              >
                +
              </button>
            </div>

            <div className="consume-actions">
              <button className="consume-cancel" onClick={() => setSelected(null)}>
                Cancel
              </button>
              <button className="consume-confirm" onClick={confirmConsume}>
                Consume {qty > 1 ? `×${qty}` : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
