import { platformStorage } from '$lib/server/context';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// In dev, platform might be undefined, so we fallback to empty object to avoid crashes,
	// though KV won't work without it unless using wrangler dev
	const platform = event.platform || {} as App.Platform;

	return platformStorage.run(platform, () => {
		return resolve(event);
	});
};
