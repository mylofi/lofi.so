import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['Archivo', 'system-ui', 'sans-serif']
			}
		}
	},

	plugins: [require('@tailwindcss/aspect-ratio')]
} satisfies Config;
