import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				primary: '#f8b23a',
				discord: '#5865F2'
			},
			fontFamily: {
				sans: ['Archivo', 'system-ui', 'sans-serif']
			}
		}
	},

	plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/typography')]
} satisfies Config;
