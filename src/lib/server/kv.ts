import { getKVBinding } from '$lib/server/context';
import type { LegacyEventData } from '$lib/types/event-graphic';
import { fromEventGraphicSpec, toEventGraphicSpec } from '$lib/utils/event-graphic-spec';

export type EventData = LegacyEventData;

const normalizeEventPayload = (event: Partial<EventData>): EventData => {
	const spec = toEventGraphicSpec(event);
	if (!spec) {
		throw new Error('Event payload is missing required fields.');
	}

	const normalized = fromEventGraphicSpec(spec);
	return {
		...normalized,
		...event,
		sponsors: spec.sponsors,
		spec
	};
};

export async function saveEvent(event: EventData) {
	const kv = getKVBinding();
	if (!kv) {
		console.warn(
			'KV binding (eventData) not found. Ensure it is bound in Cloudflare Dashboard and wrangler.toml.'
		);
		return null;
	}

	const payload = normalizeEventPayload(event);
	console.log('Saving event to KV:', payload);
	// Cloudflare KV stores strings, so we stringify the object
	await kv.put('current_event', JSON.stringify(payload));
	return payload;
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
		const parsed = JSON.parse(data) as Partial<EventData>;
		return normalizeEventPayload(parsed);
	} catch (error) {
		console.error('Error getting event:', error);
		return null;
	}
}
