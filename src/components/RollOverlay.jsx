import { useEffect, useState } from "react";
import { CONFIG } from "../data/banners.js";

const FIFTY_LABEL = {
  won: "Won the 50/50!",
  lost: "Lost the 50/50…",
  guaranteed: "Guaranteed rate-up!",
};

// Replaceable roll effects — drop a file named roll.* (background loop) or
// comet*.* (per-item streak) into src/assets/effects/ to swap the art.
// Each comet gets a rarity-color overlay blended on top, so any comet art
// (local file or remote URL, see CONFIG.cometGifs) still reads as
// blue/purple/gold by rarity no matter what it looks like on its own.
const effectFiles = import.meta.glob("../assets/effects/*.{gif,webp,png,apng}", {
  eager: true,
  import: "default",
});
const effectsByFilename = Object.fromEntries(
  Object.entries(effectFiles).map(([path, url]) => [path.split("/").pop(), url])
);

function resolveEffect(base) {
  const entry = Object.entries(effectsByFilename).find(
    ([filename]) => filename.split(".")[0] === base
  );
  return entry?.[1];
}

function toDirectGifUrl(url) {
  // Turn a Giphy share/embed link into its direct media .gif URL.
  const m = url.match(/giphy\.com\/(?:gifs|embed)\/(?:[\w-]*-)?([a-zA-Z0-9]+)(?:[/?#].*)?$/i);
  return m ? `https://media.giphy.com/media/${m[1]}/giphy.gif` : url;
}

function resolveCometSource(entry) {
  if (/^https?:\/\//i.test(entry)) return toDirectGifUrl(entry);
  return effectsByFilename[entry] ?? entry;
}

const localCometFiles = Object.entries(effectsByFilename)
  .filter(([filename]) => /^comet/i.test(filename))
  .map(([, url]) => url);

const cometSources =
  CONFIG.cometGifs.length > 0 ? CONFIG.cometGifs.map(resolveCometSource) : localCometFiles;

const rollGif = resolveEffect("roll");

const STREAK_MS = 15000; // total length of the pre-reveal streak animation
const FLY_MS = 1500;     // how long a single comet takes to streak in
const RING_DELAY_MS = 1100; // ring starts this long after the final comet begins flying
const FLASH_DELAY_MS = 1300; // flash starts this long after the final comet begins flying
const FLASH_TAIL_MS = 600;   // buffer reserved after the flash finishes

export default function RollOverlay({ banner, results, refund, onClose }) {
  const [phase, setPhase] = useState("streak"); // streak -> reveal
  const maxRarity = Math.max(...results.map((r) => r.item.rarity));
  // Pick one comet gif per rolled item, once, so it doesn't reshuffle on re-render.
  const [cometPicks] = useState(() =>
    results.map(() =>
      cometSources.length > 0
        ? cometSources[Math.floor(Math.random() * cometSources.length)]
        : undefined
    )
  );

  useEffect(() => {
    if (phase !== "streak") return;
    const t = setTimeout(() => setPhase("reveal"), STREAK_MS);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "streak") {
    const n = results.length;
    const spanMs = Math.max(STREAK_MS - FLY_MS - FLASH_DELAY_MS - FLASH_TAIL_MS, 0);
    const gapMs = n > 1 ? spanMs / (n - 1) : 0;
    const lastStartMs = (n - 1) * gapMs;

    return (
      <div
        className={`overlay streak-stage rarity-${maxRarity}`}
        onClick={() => setPhase("reveal")}
      >
        {rollGif && <img className="roll-gif" src={rollGif} alt="" />}
        <div className="starfield" />
        {results.map((r, i) => {
          const startMs = i * gapMs;
          // scatter each comet's entry point/path a little so 10-in-a-row don't overlap
          const jx = ((i * 77) % 7) - 10;
          const jy = ((i * 23) % 15) - 7;
          return (
            <div
              key={i}
              className={`comet r${r.item.rarity}`}
              style={{
                animationDelay: `${startMs / 1000}s`,
                animationDuration: `${FLY_MS / 900}s`,
                "--jx": `${jx}vw`,
                "--jy": `${jy}vh`,
              }}
            >
              {cometPicks[i] ? (
                <>
                  <img className="comet-gif" src={cometPicks[i]} alt="" />
                  <div className="comet-tint" />
                </>
              ) : (
                <div className="comet-dot" />
              )}
            </div>
          );
        })}
        <div
          className="comet-ring"
          style={{ animationDelay: `${(lastStartMs + RING_DELAY_MS) / 1000}s` }}
        />
        <div
          className="flash"
          style={{ animationDelay: `${(lastStartMs + FLASH_DELAY_MS) / 1000}s` }}
        />
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
            <img className="card-icon" src={r.item.image} alt={r.item.name} />
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
          <span className="refund">Duplicate bonus: +{refund.toLocaleString()} 💎</span>
        )}
        <button className="ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}
