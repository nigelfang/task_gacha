import { useEffect, useState } from "react";

const FIFTY_LABEL = {
  won: "Won the 50/50!",
  lost: "Lost the 50/50…",
  guaranteed: "Guaranteed rate-up!",
};

export default function RollOverlay({ banner, results, refund, onClose }) {
  const [phase, setPhase] = useState("streak"); // streak -> reveal
  const maxRarity = Math.max(...results.map((r) => r.item.rarity));

  useEffect(() => {
    if (phase !== "streak") return;
    const t = setTimeout(() => setPhase("reveal"), 1800);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "streak") {
    return (
      <div
        className={`overlay streak-stage rarity-${maxRarity}`}
        onClick={() => setPhase("reveal")}
      >
        <div className="starfield" />
        <div className="comet" />
        <div className="comet-ring" />
        <div className="flash" />
        <p className="skip-hint">Click to skip</p>
      </div>
    );
  }

  return (
    <div className="overlay reveal-stage">
      <h2 className="reveal-title">{banner.name}</h2>
      <div className={`results ${results.length === 1 ? "single" : "grid"}`}>
        {results.map((r, i) => (
          <div
            key={i}
            className={`card r${r.item.rarity}`}
            style={{ animationDelay: `${i * 0.16}s` }}
          >
            <span className="card-icon">{r.item.icon}</span>
            <span className={`stars ${r.item.rarity === 5 ? "gold" : r.item.rarity === 4 ? "purple" : "blue"}`}>
              {"★".repeat(r.item.rarity)}
            </span>
            <span className="card-name">{r.item.name}</span>
            {r.item.desc && results.length === 1 && (
              <span className="card-desc">{r.item.desc}</span>
            )}
            {r.item.rarity === 5 && r.fiftyResult && (
              <span className={`fifty ${r.fiftyResult}`}>{FIFTY_LABEL[r.fiftyResult]}</span>
            )}
            {r.isNew ? (
              <span className="badge new">NEW</span>
            ) : (
              <span className="badge dupe">+{r.bonus} 💎</span>
            )}
          </div>
        ))}
      </div>
      <div className="reveal-footer">
        {refund > 0 && (
          <span className="refund">Duplicate refund: +{refund.toLocaleString()} 💎</span>
        )}
        <button className="ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
