// Theme palettes. Add a theme here and it shows up in the switcher automatically —
// the CSS variables below are generated from this list at build time.
//
// Roles:
//   bg      page background
//   heading headings, links, the primary accent colour
//   accent  hover states, secondary accent
//   text    body copy
//   muted   softer text (captions, dates, sidebars)
//   surface raised panels — blockquotes, inline code
//   code    inline code text
//
// Fonts:
//   display  big set-piece text — logo, page and post titles, the typing animation
//   heading  every other heading: nav links, card titles, section headings in articles
//   tracking letter-spacing applied to display text and headings
//   preload  font files worth fetching before first paint when this theme is active

export const themes = [
  {
    id: 'matrix',
    label: 'Matrix',
    blurb: 'Neon green on black',
    colors: {
      bg: '#000000',
      heading: '#0FFF50',
      accent: '#55C2C3',
      text: '#FFFFFF',
      muted: '#C8DCF5',
      surface: '#102030',
      code: '#FF6666',
    },
    fonts: {
      display: '"Orbitron", sans-serif',
      heading: '"Orbitron", sans-serif',
    },
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk 2077',
    blurb: 'Night City yellow and cyan',
    colors: {
      bg: '#08080C',
      heading: '#FCEE0A',
      accent: '#00F0FF',
      text: '#EDEDED',
      muted: '#9DE8F0',
      surface: '#14141F',
      code: '#FF003C',
    },
    // Rajdhani (the game's own UI typeface) only shows while Interceptor Slim loads.
    fonts: {
      display: '"Interceptor Slim", "Rajdhani", sans-serif',
      heading: '"Interceptor Slim", "Rajdhani", sans-serif',
    },
    tracking: '0.02em',
    preload: ['/fonts/interceptor/InterceptorSlim.woff2'],
  },
  {
    id: 'amber',
    label: 'Amber CRT',
    blurb: 'Warm phosphor terminal',
    colors: {
      bg: '#0B0A08',
      heading: '#FFB000',
      accent: '#FF7A18',
      text: '#F2E5CE',
      muted: '#C9B48A',
      surface: '#1A150D',
      code: '#FF5F5F',
    },
    fonts: {
      display: '"Orbitron", sans-serif',
      heading: '"Orbitron", sans-serif',
    },
  },
];

export const defaultTheme = 'matrix';
export const themeIds = themes.map((t) => t.id);
export const storageKey = 'site-theme';
export const themePreloads = Object.fromEntries(themes.map((t) => [t.id, t.preload ?? []]));

// Tailwind consumes these as `rgb(var(--c-heading) / <alpha-value>)`, which needs the
// channels space-separated rather than a hex string.
function channels(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(full, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

function block(selector, { colors, fonts, tracking = 'normal' }) {
  const vars = [
    ...Object.entries(colors).map(([role, hex]) => `--c-${role}:${channels(hex)}`),
    ...Object.entries(fonts).map(([role, stack]) => `--font-${role}:${stack}`),
    `--font-tracking:${tracking}`,
  ].join(';');
  return `${selector}{${vars}}`;
}

const fallback = themes.find((t) => t.id === defaultTheme) ?? themes[0];

// `:root` keeps the site readable if the theme attribute is ever missing.
export const themeCss = [
  block(':root', fallback),
  ...themes.map((t) => block(`[data-theme="${t.id}"]`, t)),
].join('');
