import { getLatestEvent } from '$lib/server/kv';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	const eventData = await getLatestEvent();
	return {
		eventData
	};
}; 