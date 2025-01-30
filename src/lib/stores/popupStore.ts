import { writable } from 'svelte/store';
import { browser } from '$app/environment';

function createPopupStore() {
	const { subscribe, set } = writable(false);

	const shouldShowPopup = () => {
		if (!browser) return false;

		const lastDismissed = localStorage.getItem('popupLastDismissed');
		if (!lastDismissed) return true;

		const thirtyMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		return new Date(lastDismissed) < thirtyMinutesAgo;
	};

	return {
		subscribe,
		dismiss: () => {
			if (browser) {
				localStorage.setItem('popupLastDismissed', new Date().toISOString());
			}
			set(false);
		},
		initialize: () => {
			if (shouldShowPopup()) {
				setTimeout(() => set(true), 2000);
			}
		}
	};
}

export const popupStore = createPopupStore();
