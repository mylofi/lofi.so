import { getLatestEvent } from '$lib/server/kv';
import type { LayoutServerLoad } from './$types';
import sponsorsData from '$lib/data/sponsors.json';

export const load: LayoutServerLoad = async () => {
	const eventData = await getLatestEvent();
	return {
		eventData,
		sponsors: sponsorsData.sponsors
	};
}; 