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
				// Timestamps and small system labels (feed tiles)
				mono: '"JetBrains Mono", monospace',
			},
			colors: {
				// Light-mode tokens, used by themes with scheme: 'light' (the `dark` class
				// is dropped there). They point at the same variables as their dk-
				// counterparts, so markup written as `bg-primary dark:bg-dk-primary`
				// gets the active theme's colour either way.
				'primary': themed('bg'),
				'secondary': themed('heading'),
				'accent': themed('accent'),

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
