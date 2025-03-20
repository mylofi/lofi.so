import { json } from '@sveltejs/kit';
import content from '$lib/data/content.json';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const learnContent = content.find(section => section.title === 'Learn');
	
	const readContent = learnContent?.sections.find(s => s.title === 'Things to read')?.items || [];
	const watchContent = learnContent?.sections.find(s => s.title === 'Things to watch')?.items || [];
	
	return {
		readContent,
		watchContent
	};
}; 