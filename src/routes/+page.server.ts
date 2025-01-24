import content from '$lib/data/content.json';
import heading from '$lib/data/heading.json';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		content,
		heading
	};
};
