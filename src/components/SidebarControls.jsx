import React from "react";
import { contrastRatio, generateVariants } from "../utils/colorUtils";

export default function SidebarControls({
  palette,
  selected,
  setSelected,
  randomPalette,
  copyCss,
  copyTailwind,
}) {

  return (
    <div style={{ marginTop: 18 }}>
      {/* Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={randomPalette}
          className="soft-btn soft-btn--primary"
        >
          Random
        </button>
        <button
          type="button"
          onClick={copyCss}
          className="soft-btn soft-btn--outline"
        >
          Copy CSS
        </button>
        <button
          type="button"
          onClick={copyTailwind}
          className="soft-btn soft-btn--ghost"
        >
          Copy Tailwind
        </button>
      </div>

      {/* Palette */}
      <div style={{ marginTop: 18 }}>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Palette</div>

        <div className="palette-list">
          {palette.map((p) => {
            const isActive = p === selected;

            // calculate contrast vs white for info only
            const cr = contrastRatio(p, "#ffffff");

            return (
              <button
                key={p}
                type="button"
                className={`swatch ${isActive ? "swatch--active" : ""}`}
                onClick={() => setSelected(p)}
              >
                <div className="swatch-color" style={{ background: p }} />

                <div className="swatch-meta">
                  <div className="swatch-hex">{p}</div>
                  <div className="swatch-contrast">{cr} :1</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected color */}
        <div style={{ marginTop: 12, color: "#6b7280" }}>
          Selected: <strong style={{ color: selected, marginLeft: 8 }}>{selected}</strong>
        </div>

        {/* Variants */}
        <div style={{ marginTop: 10, color: "#9ca3af", fontSize: 12 }}>
          Variants:
          <span style={{ marginLeft: 6 }}>
            {generateVariants(selected).complementary} /{" "}
            {generateVariants(selected).triadic.join(", ")}
          </span>
        </div>
      </div>
    </div>
  );
}
