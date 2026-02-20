import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',

	theme: {
		extend: {
			colors: {
				primary: '#4C62FF',
				discord: '#FFB21D',
				ink: '#101828',
				paper: '#F8FAFC',
				panel: '#EEF2FF'
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
