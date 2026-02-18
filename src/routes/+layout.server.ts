import { getLatestEvent } from '$lib/server/kv';
import type { LayoutServerLoad } from './$types';
import sponsorsData from '$lib/data/sponsors.json';
import { toEventGraphicSpec } from '$lib/utils/event-graphic-spec';

export const load: LayoutServerLoad = async () => {
	const eventData = await getLatestEvent();
	const eventSpec = toEventGraphicSpec(eventData);
	return {
		eventData,
		eventSpec,
		sponsors: sponsorsData.sponsors
	};
};
