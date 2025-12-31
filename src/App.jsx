import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DropzoneUpload from "./components/DropzoneUpload";
import SidebarControls from "./components/SidebarControls";
import WebsitePreview from "./previews/WebsitePreview";
import MaterialPreview from "./previews/MaterialPreview";
import DashboardPreview from "./previews/DashboardPreview";
import MinimalPreview from "./previews/MinimalPreview";
import ColorThief from "colorthief";
import { rgbToHex } from "./utils/colorUtils";

// random palette generator
const generateRandomPalette = () =>
  Array.from({ length: 5 }, () =>
    "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")
  );

export default function App() {
  const ctRef = useRef(null);

  // Generate random palette on load
  const [palette, setPalette] = useState(generateRandomPalette());
  const [selected, setSelected] = useState(palette[0]);
  const [mode, setMode] = useState("website"); // website|material|dashboard|minimal
  const [toast, setToast] = useState(null); // { id, message }
  const [theme, setTheme] = useState("dark"); // light | dark

  useEffect(() => {
    ctRef.current = new ColorThief();

    // Initialize theme from system preference
    try {
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    } catch {
      // ignore if matchMedia not available
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const showToast = (message) => {
    const id = Date.now();
    setToast({ id, message });
    setTimeout(() => {
      setToast((current) => (current && current.id === id ? null : current));
    }, 2200);
  };
 
  const extractPalette = (url) => {
    if (!url || !ctRef.current) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;

    img.onload = () => {
      try {
        const pal = ctRef.current.getPalette(img, 6);
        const hexes = pal.map((rgb) => rgbToHex(rgb)).slice(0, 5);

        while (hexes.length < 5) hexes.push("#e5e7eb");

        setPalette(hexes);
        setSelected(hexes[0]);
      } catch (e) {
        console.error("extract failed", e);
      }
    };

    img.onerror = (err) => {
      console.error("image load error", err);
    };
  };

  const handleUploadFile = (url) => {
    extractPalette(url);
  };

  const randomPalette = () => {
    const fresh = generateRandomPalette();
    setPalette(fresh);
    setSelected(fresh[0]);
  };

  const copyCss = () => {
    const vars = palette.map((p, i) => `  --p${i + 1}: ${p};`).join("\n");
    const css = `:root {\n${vars}\n}`;
    navigator.clipboard.writeText(css).then(() => {
      showToast("CSS variables copied");
    });
  };
 
  const copyTailwind = () => {
    const snippet = palette
      .map((p, i) => `    "p${i + 1}": "${p}",`)
      .join("\n");
    const tail = `module.exports = {\n  theme: { extend: { colors: {\n${snippet}\n  } } }\n}`;
    navigator.clipboard.writeText(tail).then(() => {
      showToast("Tailwind snippet copied");
    });
  };

  const renderPreview = () => {
    const props = { palette, selected };

    switch (mode) {
      case "website":
        return <WebsitePreview {...props} />;
      case "material":
        return <MaterialPreview {...props} />;
      case "dashboard":
        return <DashboardPreview {...props} />;
      default:
        return <MinimalPreview {...props} />;
    }
  };

  return (
    <div className="app-container" style={{ "--accent": selected }}>
      {/* Minimal Navigation */}
      <nav className="minimal-nav">
        <div className="nav-content">
          <div className="logo">
            <div className="logo-blob" style={{ background: selected }} />
            <span>ColorPalette</span>
          </div>

          <button
            type="button"
            className="soft-btn soft-btn--outline theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "Light" : "Dark"} mode
          </button>
        </div>
      </nav>

      {/* Main App Interface */}
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="brand hover-lift click-bounce">
            <div className="logo-blob" style={{ background: selected }} />
            <div>
              <div style={{ fontWeight: 800 }}>Color Storyboard</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Frosted theme</div>
            </div>
          </div>

          <nav className="mode-tabs">
            {['website', 'material', 'dashboard', 'minimal'].map((tab) => (
              <button
                key={tab}
                className={`mode ${mode === tab ? 'active' : ''} click-ripple`}
                onClick={() => setMode(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="controls-section">
            <DropzoneUpload onFile={handleUploadFile} extractOnDrop={extractPalette} />
            <SidebarControls
              palette={palette}
              selected={selected}
              setSelected={setSelected}
              setPalette={setPalette}
              randomPalette={randomPalette}
              copyCss={copyCss}
              copyTailwind={copyTailwind}
            />
          </div>

          <div className="palette-preview animate-fade-in">
            <h3>Color Palette</h3>
            <div className="palette-grid">
              {palette.map((color, index) => {
                const isActive = color === selected;
                return (
                  <motion.div
                    key={index}
                    className={`palette-color hover-lift click-bounce ${isActive ? "palette-color--active" : ""}`}
                    style={{ background: color }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setSelected(color);
                      navigator.clipboard.writeText(color).then(() => {
                        showToast(`Copied ${color}`);
                      });
                    }}
                  >
                    <div className="color-info">
                      <span>{color}</span>
                      {isActive && <span className="color-badge">Selected</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              className="preview-canvas hover-glow"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.97 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
            >
              <div className="canvas-inner">{renderPreview()}</div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Simple Footer */}
      <footer className="simple-footer">
        <p>© {new Date().getFullYear()} ColorPalette - Free to use</p>
      </footer>

      {/* Toast region */}
      <div className="app-toast-region" aria-live="polite" aria-atomic="true">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              className="app-toast"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="app-toast-dot" style={{ background: selected }} />
              <span className="app-toast-message">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
