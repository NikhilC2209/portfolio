import typography from '@tailwindcss/typography';

// Colour tokens resolve to CSS variables so a theme swap is a single attribute
// change on <html>. Palettes live in src/data/themes.js.
const themed = (role) => `rgb(var(--c-${role}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				display: 'var(--font-display)',
				heading: 'var(--font-heading)',
			},
			colors: {
				// Light-mode tokens. The site runs permanently in `dark`, so these are
				// only reachable if a light theme is ever added.
				'primary': '#FFF',
				'secondary': '#1D4CC4',
				'accent': '#0D2563',

				'text': themed('text'),
				'dk-primary': themed('bg'),
				'dk-secondary': themed('heading'),
				'dk-accent': themed('accent'),
				'dk-text': themed('muted'),
				'surface': themed('surface'),
				'code': themed('code'),

				// Kept for backwards compatibility with older markup.
				'bg-dark-main': themed('bg'),
				'neon-green-secondary': themed('heading'),
			},
		},
	},
	darkMode: 'class',
	plugins: [
		typography,
	],
}
