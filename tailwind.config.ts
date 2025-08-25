import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',

	theme: {
		extend: {
			colors: {
				primary: '#5865F2',
				discord: '#f8b23a'
			},
			fontFamily: {
				sans: ['Archivo', 'system-ui', 'sans-serif']
			},
			screens: {
				'xs': '470px'
			}
		}
	},

	plugins: [require('@tailwindcss/aspect-ratio'), require('@tailwindcss/typography')]
} satisfies Config;
