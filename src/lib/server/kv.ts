import { getKVBinding } from '$lib/server/context';

export interface EventData {
	eventNumber: number;
    title: string;
	startTimeISO?: string;
	date: string;
	time: string;
	timezone: string;
	speakers: Array<{
		name: string;
		twitterHandle: string;
		talk: string;
		image: string;
	}>;
	registrationUrl: string;
	discordUrl: string;
	calendarUrl: string;
	logoUrl: string;
}

export async function saveEvent(event: EventData) {
	const kv = getKVBinding();
	if (!kv) {
		console.warn('KV binding (eventData) not found. Ensure it is bound in Cloudflare Dashboard and wrangler.toml.');
		return null;
	}

	console.log('Saving event to KV:', event);
	// Cloudflare KV stores strings, so we stringify the object
	await kv.put('current_event', JSON.stringify(event));
	return event;
}

export async function getLatestEvent(): Promise<EventData | null> {
	const kv = getKVBinding();
	if (!kv) {
		console.error('KV not configured, returning null for event');
		return null;
	}

	try {
		const data = await kv.get('current_event');
		if (!data) return null;
		return JSON.parse(data) as EventData;
	} catch (error) {
		console.error('Error getting event:', error);
		return null;
	}
}