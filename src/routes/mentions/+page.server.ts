import mentions from '$lib/data/mentions.json';
import sponsorsData from '$lib/data/sponsors.json';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		mentions,
		sponsorsData: {
			sponsors: sponsorsData.sponsors,
			nextEvent: sponsorsData.nextEvent
		}
	};
}; 