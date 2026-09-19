import { useEffect, useRef, useState } from "react";
import { themes, defaultTheme, themeIds, storageKey } from "../data/themes.js";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(defaultTheme);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // The inline script in BaseLayout has already applied the stored theme before
  // paint, so read it back off the element rather than touching localStorage again.
  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    if (applied && themeIds.includes(applied)) setTheme(applied);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectTheme = (id) => {
    document.documentElement.dataset.theme = id;
    window.dispatchEvent(new Event("themechange"));
    setTheme(id);
    setOpen(false);
    try {
      window.localStorage.setItem(storageKey, id);
    } catch {
      // Private browsing or blocked storage — the theme still applies for this visit.
    }
  };

  const active = themes.find((t) => t.id === theme) ?? themes[0];

  return (
    <div className="relative self-center" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="hud-cut-border relative flex items-center gap-2 rounded border-2 border-secondary dark:border-dk-secondary px-2 py-1 text-secondary dark:text-dk-secondary hover:text-accent dark:hover:text-dk-accent hover:border-accent dark:hover:border-dk-accent transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Change colour theme, currently ${active.label}`}
        title={`Theme: ${active.label}`}
      >
        <Swatch colors={active.colors} />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          className={`h-4 w-4 fill-current transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M5.5 7.5 10 12l4.5-4.5z" />
        </svg>
      </button>

      {open && (
        <ul
          role="menu"
          className="hud-cut-border absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded border-2 border-secondary dark:border-dk-secondary bg-primary dark:bg-dk-primary shadow-lg"
        >
          {themes.map((t) => {
            const isActive = t.id === theme;
            return (
              <li key={t.id} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onClick={() => selectTheme(t.id)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-dk-secondary/10 ${
                    isActive ? "bg-dk-secondary/10" : ""
                  }`}
                >
                  <Swatch colors={t.colors} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base leading-tight text-secondary dark:text-dk-secondary">
                      {t.label}
                    </span>
                    <span className="block truncate text-xs leading-tight text-dk-text/70">
                      {t.blurb}
                    </span>
                  </span>
                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      className="h-4 w-4 shrink-0 fill-current text-secondary dark:text-dk-secondary"
                      aria-hidden="true"
                    >
                      <path d="M7.7 14.3 3.4 10l1.4-1.4 2.9 2.9 7.5-7.5L16.6 5z" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// Three dots showing the palette. Colours come straight from the theme data, since
// a non-active theme's CSS variables aren't readable from here.
function Swatch({ colors }) {
  return (
    <span className="flex shrink-0 items-center -space-x-1" aria-hidden="true">
      {[colors.heading, colors.accent, colors.text].map((color, i) => (
        <span
          key={i}
          className="h-3.5 w-3.5 rounded-full border border-black/40"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  );
}
