import { writable } from 'svelte/store';

export const isBannerVisible = writable(true);

export const dismissBanner = () => {
	isBannerVisible.set(false);
};
