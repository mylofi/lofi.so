import { json } from '@sveltejs/kit';
import content from '$lib/data/content.json';
import heading from '$lib/data/heading.json';
import sponsorsData from '$lib/data/sponsors.json';
import mentions from '$lib/data/mentions.json';
import type { PageServerLoad } from './$types';
import { getLatestEvent } from '$lib/server/kv';
import { toEventGraphicSpec } from '$lib/utils/event-graphic-spec';

export const load: PageServerLoad = async () => {
	console.log('Loading page data...');
	const eventDataForGraphic = await getLatestEvent();
	const eventSpecForGraphic = toEventGraphicSpec(eventDataForGraphic);
	console.log('Page load eventData:', eventDataForGraphic);

	return {
		content,
		heading,
		sponsorsData: {
			sponsors: sponsorsData.sponsors,
			nextEvent: sponsorsData.nextEvent
		},
		eventDataForGraphic,
		eventSpecForGraphic,
		mentions
	};
};
