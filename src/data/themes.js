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
//   textScroll true to print [data-dialog] boxes letter by letter, like in-game text
//            (src/scripts/text-scroll.js)
//   battleIntro true to play a battle-start transition on the first page of a visit and
//            whenever the visitor switches into the theme (src/scripts/battle-intro.js)
//   starfield true to draw the animated starfield behind the page (src/components/StarField.jsx)
//   sound    audio played when the visitor clicks to cycle the trail palette. Off until
//            the visitor turns it on with the toggle in the nav (src/components/SoundToggle.jsx)
//
// Cursor trail (optional; defaults to round particles in the heading colour):
//   shape    'circle', 'square', 'blade' for a lightsaber stroke, or 'pokeball' for
//            tumbling pixel Poké Balls with sparkles in `colors`
//   colors   colours picked at random for each particle: a role name ('heading') or a
//            hex value. Repeat an entry to make it more common.
//   palettes instead of `colors`, a list of { id, label, colors, glitch } that visitors
//            cycle through by clicking the page. The first is the default. `glitch` is
//            the colour pair for the theme's hover effect on titles (exposed as
//            --glitch-a / --glitch-b): Cyberpunk's glitch split, Star Wars' saber glow,
//            Pokémon's drop shadow and text colour. Pokéball palettes also name their
//            `ball` sprite (src/scripts/pokeball-sprites.js).

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
    id: 'starwars',
    label: 'Star Wars',
    blurb: 'Opening crawl and lightsabers',
    colors: {
      bg: '#02030A',
      heading: '#FFE81F',
      accent: '#4BD5EE',
      text: '#E8E6DA',
      muted: '#9FC3D6',
      surface: '#0D1424',
      code: '#FF5A4E',
    },
    // Star Jedi mimics the logo lettering; News Cycle, an open-source revival of
    // News Gothic (the opening crawl's typeface), shows while it loads and sets
    // every other heading.
    fonts: {
      display: '"Star Jedi", "News Cycle", sans-serif',
      heading: '"News Cycle", sans-serif',
    },
    tracking: '0.04em',
    preload: ['/fonts/starjedi/Starjedi.ttf'],
    starfield: true,
    sound: '/sounds/saber-ignite.mp3',
    // Lightsaber colours; clicking the page cycles between them. `glitch` here is the
    // saber's glow and white core, used by the hover glow on titles and cards.
    trail: {
      shape: 'blade',
      palettes: [
        {
          id: 'jedi',
          label: 'Jedi Blue',
          colors: ['#3FA9FF', '#3FA9FF', '#3FA9FF', '#4BD5EE', '#FFFFFF'],
          glitch: ['#3FA9FF', '#F2FAFF'],
        },
        {
          id: 'sith',
          label: 'Sith Red',
          colors: ['#FF2A2A', '#FF2A2A', '#FF2A2A', '#C80000', '#FFFFFF'],
          glitch: ['#FF2A2A', '#FFF2F2'],
        },
        {
          id: 'windu',
          label: 'Mace Windu Purple',
          colors: ['#B455FF', '#B455FF', '#B455FF', '#8A2BE2', '#FFFFFF'],
          glitch: ['#B455FF', '#FAF2FF'],
        },
        {
          id: 'yoda',
          label: 'Yoda Green',
          colors: ['#4CFF4C', '#4CFF4C', '#4CFF4C', '#1FBF3A', '#FFFFFF'],
          glitch: ['#4CFF4C', '#F2FFF2'],
        },
      ],
    },
  },
  {
    id: 'pokemon',
    label: 'Pokémon',
    blurb: 'Retro handheld adventure',
    colors: {
      bg: '#0E1321',
      heading: '#FF6150',
      accent: '#FFD23F',
      text: '#F8F8F0',
      muted: '#AFC6E9',
      surface: '#18203A',
      code: '#6CC45A',
    },
    // Press Start 2P is a monospaced 8×8 pixel face in the spirit of the handheld
    // games; it's wide, so it only sets the big display text. Pixelify Sans is the
    // readable pixel face for every other heading.
    fonts: {
      display: '"Press Start 2P", monospace',
      heading: '"Pixelify Sans", sans-serif',
    },
    textScroll: true,
    battleIntro: true,
    sound: '/sounds/menu-select.mp3',
    // Clicking the page cycles through the Poké Balls. `glitch` is the hover effect on
    // titles: a hard drop shadow in the ball's colour under text in the second colour.
    trail: {
      shape: 'pokeball',
      palettes: [
        {
          id: 'poke',
          label: 'Poké Ball',
          ball: 'poke',
          colors: ['#FFFFFF', '#FFFFFF', '#FF6150'],
          glitch: ['#E3350D', '#FFFFFF'],
        },
        {
          id: 'great',
          label: 'Great Ball',
          ball: 'great',
          colors: ['#FFFFFF', '#6FA3F7', '#FF6150'],
          glitch: ['#3A78D8', '#FFFFFF'],
        },
        {
          id: 'ultra',
          label: 'Ultra Ball',
          ball: 'ultra',
          colors: ['#FFFFFF', '#FFD23F', '#FFD23F'],
          glitch: ['#5A5A66', '#FFD23F'],
        },
        {
          id: 'master',
          label: 'Master Ball',
          ball: 'master',
          colors: ['#FFFFFF', '#C98BFF', '#FF8AD8'],
          glitch: ['#8A3FC8', '#FFD6F4'],
        },
      ],
    },
  },
];

export const defaultTheme = 'matrix';
export const themeIds = themes.map((t) => t.id);
export const storageKey = 'site-theme';
export const themePreloads = Object.fromEntries(themes.map((t) => [t.id, t.preload ?? []]));
export const trailStorageKey = 'site-trail';
export const soundStorageKey = 'site-sound';
// Themes that print dialog text letter by letter, so it can be hidden before first paint.
export const textScrollThemes = themes.filter((t) => t.textScroll).map((t) => t.id);
// Themes with a battle intro, and the session flag that stops it replaying on every page.
export const battleIntroThemes = themes.filter((t) => t.battleIntro).map((t) => t.id);
export const battleIntroSessionKey = 'battle-intro-played';

// The theme's sound effect, or null when it has none.
export function soundFor(themeId) {
  return themes.find((t) => t.id === themeId)?.sound ?? null;
}

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
