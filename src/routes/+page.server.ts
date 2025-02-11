import { json } from '@sveltejs/kit';
import content from '$lib/data/content.json';
import heading from '$lib/data/heading.json';
import sponsorsData from '$lib/data/sponsors.json';
import mentions from '$lib/data/mentions.json';
import type { PageServerLoad } from './$types';
import { getLatestEvent } from '$lib/server/kv';

export const load: PageServerLoad = async () => {
	console.log('Loading page data...');
	const eventDataForGraphic = await getLatestEvent();
	console.log('Page load eventData:', eventDataForGraphic);
	
	return {
		content,
		heading,
		sponsorsData: {
			sponsors: sponsorsData.sponsors,
			nextEvent: sponsorsData.nextEvent
		},
		eventDataForGraphic,
		mentions
	};
};
