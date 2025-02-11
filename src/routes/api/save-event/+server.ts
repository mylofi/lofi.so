import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveEvent } from '$lib/server/kv';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const eventData = await request.json();
		await saveEvent(eventData);
		return json({ success: true });
	} catch (error) {
		console.error('Error saving event data:', error);
		return json({ error: 'Failed to save event data' }, { status: 500 });
	}
};
