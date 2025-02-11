import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getLatestEvent } from '$lib/server/kv';

export const GET: RequestHandler = async () => {
    try {
        const event = await getLatestEvent();
        return json(event || {});
    } catch (error) {
        console.error('Error fetching latest event:', error);
        return json({ error: 'Failed to fetch event data' }, { status: 500 });
    }
}; 