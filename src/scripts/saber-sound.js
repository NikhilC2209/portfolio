import { soundStorageKey, soundFor } from "../data/themes.js";

// The ignition sound a theme plays when the visitor clicks to cycle the trail palette.
// It stays off until they turn it on, and browsers only allow playback after a gesture
// anyway — turning it on is that gesture.

let audio = null;
let loaded = null;

export function soundEnabled() {
  try {
    return window.localStorage.getItem(soundStorageKey) === "on";
  } catch {
    // Storage blocked — treat sound as off.
    return false;
  }
}

export function setSoundEnabled(enabled) {
  try {
    window.localStorage.setItem(soundStorageKey, enabled ? "on" : "off");
  } catch {
    // Storage blocked — the choice still applies for this page.
  }
}

// Restarts rather than layering, so a run of quick clicks can't stack into a drone.
export function playIgnite() {
  const src = soundFor(document.documentElement.dataset.theme);
  if (!src || !soundEnabled()) return;

  if (loaded !== src) {
    audio = new Audio(src);
    audio.volume = 0.35;
    loaded = src;
  }

  audio.currentTime = 0;
  // Rejects if the browser hasn't seen a gesture yet; nothing to recover, so ignore.
  audio.play().catch(() => {});
}
