import { getLatestEvent } from '$lib/server/kv';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ setHeaders }) => {
	setHeaders({
		'cache-control': 'no-store'
	});

	return {
		eventData: await getLatestEvent()
	};
};
