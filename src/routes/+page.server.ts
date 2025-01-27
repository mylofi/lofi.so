import { json } from '@sveltejs/kit';
import content from '$lib/data/content.json';
import heading from '$lib/data/heading.json';
import sponsorsData from '$lib/data/sponsors.json';
import mentions from '$lib/data/mentions.json';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		content,
		heading,
		sponsorsData,
		mentions
	};
};
