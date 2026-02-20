import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { saveEvent, saveEventFromSpec } from '$lib/server/kv';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const payload = await request.json();

		// Detect spec shape (has nested event.title) vs legacy (has top-level title)
		if (payload.event?.title) {
			await saveEventFromSpec(payload);
		} else {
			await saveEvent(payload);
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error saving event data:', error);
		return json({ error: 'Failed to save event data' }, { status: 500 });
	}
};
