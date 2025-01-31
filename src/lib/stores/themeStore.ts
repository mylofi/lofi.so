import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
	if (browser) {
		const savedTheme = localStorage.getItem('theme') as Theme;
		if (savedTheme === 'light' || savedTheme === 'dark') {
			return savedTheme;
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'dark';
};

export const theme = writable<Theme>(getInitialTheme());

if (browser) {
	theme.subscribe((value) => {
		localStorage.setItem('theme', value);
		if (value === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	});
}

export const toggleTheme = () => {
	theme.update((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
};
