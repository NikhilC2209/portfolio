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
//   decode   true to play the decode effect on the home page heading (src/scripts/decode.js)
//
// Cursor trail (optional; defaults to round particles in the heading colour):
//   shape    'circle' or 'square'
//   colors   colours picked at random for each particle: a role name ('heading') or a
//            hex value. Repeat an entry to make it more common.
//   palettes instead of `colors`, a list of { id, label, colors, glitch } that visitors
//            cycle through by clicking the page. The first is the default. `glitch` is
//            the colour pair for the hover-glitch split on titles.

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
    decode: true,
    // Square "data fragments". Clicking the page cycles between the palettes; the
    // hover glitch on titles follows whichever one is active.
    trail: {
      shape: 'square',
      palettes: [
        {
          id: 'night-city',
          label: 'Night City',
          colors: ['heading', 'heading', 'heading', 'accent', 'accent', 'code'],
          glitch: ['code', 'accent'],
        },
        {
          id: 'arasaka',
          label: 'Arasaka',
          colors: ['#FF003C', '#FF003C', '#FF003C', '#C4001F', '#C4001F', '#F2F2F2'],
          glitch: ['#FF003C', '#F2F2F2'],
        },
        {
          id: 'neon-pink',
          label: 'Neon Pink',
          colors: ['#FF3CAC', '#FF3CAC', '#FF3CAC', '#F2F2F2'],
          glitch: ['#FF3CAC', '#F2F2F2'],
        },
      ],
    },
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
export const trailStorageKey = 'site-trail';
export const defaultTrail = { colors: ['heading'], shape: 'circle' };

// The theme's trail as { shape, palettes }, even for themes with a single colour list.
export function trailFor(themeId) {
  const theme = themes.find((t) => t.id === themeId) ?? themes.find((t) => t.id === defaultTheme);
  const trail = { ...defaultTrail, ...theme?.trail };
  return {
    shape: trail.shape,
    palettes: trail.palettes ?? [{ id: 'default', label: 'Default', colors: trail.colors }],
  };
}

// Palette ids per theme, for validating the saved choice before first paint.
export const trailPaletteIds = Object.fromEntries(
  themes.map((t) => [t.id, (t.trail?.palettes ?? []).map((p) => p.id)]),
);

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

// Glitch colour pairs as `--glitch-a` / `--glitch-b`. The first palette is the theme's
// default; the others apply when <html data-trail="…"> selects them.
const channelsOf = (color) => (color.startsWith('#') ? channels(color) : `var(--c-${color})`);

function glitchBlocks(theme) {
  return (theme.trail?.palettes ?? [])
    .filter((palette) => palette.glitch)
    .map((palette, index) => {
      const selector =
        index === 0
          ? `[data-theme="${theme.id}"]`
          : `[data-theme="${theme.id}"][data-trail="${palette.id}"]`;
      const [a, b] = palette.glitch.map(channelsOf);
      return `${selector}{--glitch-a:${a};--glitch-b:${b}}`;
    });
}

const fallback = themes.find((t) => t.id === defaultTheme) ?? themes[0];

// `:root` keeps the site readable if the theme attribute is ever missing.
export const themeCss = [
  block(':root', fallback),
  ...themes.map((t) => block(`[data-theme="${t.id}"]`, t)),
  ...themes.flatMap(glitchBlocks),
].join('');
