import content from '$lib/data/content.json';
import heading from '$lib/data/heading.json';
import sponsorsData from '$lib/data/sponsors.json';
import mentions from '$lib/data/mentions.json';
import type { PageServerLoad } from './$types';
import { getLatestEvent } from '$lib/server/kv';
import { toEventGraphicSpec, normalizeSponsors } from '$lib/utils/event-graphic-spec';

export const load: PageServerLoad = async () => {
	const eventDataForGraphic = await getLatestEvent();

	const eventSpec = eventDataForGraphic
		? toEventGraphicSpec(eventDataForGraphic, undefined, sponsorsData.sponsors)
		: null;

	return {
		content,
		heading,
		sponsorsData: {
			sponsors: sponsorsData.sponsors,
			nextEvent: sponsorsData.nextEvent
		},
		eventDataForGraphic,
		eventSpec,
		mentions
	};
};
