import { useEffect, useState } from "react";
import { soundFor } from "../data/themes.js";
import { soundEnabled, setSoundEnabled, playIgnite } from "../scripts/saber-sound.js";

// Turns the current theme's sound effect on or off. Only rendered for themes that have
// one, and off until the visitor asks for it.
export default function SoundToggle() {
  const [available, setAvailable] = useState(false);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setAvailable(Boolean(soundFor(document.documentElement.dataset.theme)));
    sync();
    setOn(soundEnabled());

    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  if (!available) return null;

  const toggle = () => {
    const next = !on;
    setOn(next);
    setSoundEnabled(next);
    // Play it on the way on, so the click both unlocks audio and previews the sound.
    if (next) playIgnite();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center px-1 py-1 text-secondary dark:text-dk-secondary hover:text-accent dark:hover:text-dk-accent transition-colors"
      aria-pressed={on}
      aria-label={on ? "Turn off sound effects" : "Turn on sound effects"}
      title={on ? "Sound on" : "Sound off"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H2v6h4l5 4V5Z" />
        {on ? (
          <>
            <path d="M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M18.5 5.5a9 9 0 0 1 0 13" />
          </>
        ) : (
          <path d="M22 9l-6 6M16 9l6 6" />
        )}
      </svg>
    </button>
  );
}
