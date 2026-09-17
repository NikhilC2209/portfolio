import { useState, useEffect } from "react";

// Returns a theme colour role (see src/data/themes.js) as a canvas-friendly
// `rgb(r, g, b)` string, and updates when the theme switcher fires `themechange`.
export function useThemeColor(role = "heading") {
  const [color, setColor] = useState(null);

  useEffect(() => {
    const read = () => {
      const channels = getComputedStyle(document.documentElement)
        .getPropertyValue(`--c-${role}`)
        .trim()
        .split(/\s+/);
      if (channels.length === 3) setColor(`rgb(${channels.join(", ")})`);
    };

    read();
    window.addEventListener("themechange", read);
    return () => window.removeEventListener("themechange", read);
  }, [role]);

  return color;
}
