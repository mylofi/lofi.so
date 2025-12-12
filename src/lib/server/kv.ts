import { createClient } from '@vercel/kv';
import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private';

// Patch the global fetch to fix Cloudflare compatibility issues
const originalFetch = global.fetch;
global.fetch = async function patchedFetch(input, init) {
    // Remove cache property which causes issues in Cloudflare
    if (init && 'cache' in init) {
        const { cache, ...safeInit } = init;
        return originalFetch(input, safeInit);
    }
    return originalFetch(input, init);
};

// Create the KV client
const isValidKV = KV_REST_API_URL && KV_REST_API_URL.startsWith('https');
const kv = isValidKV ? createClient({
    url: KV_REST_API_URL,
    token: KV_REST_API_TOKEN
}) : null;

export interface EventData {
    eventNumber: number;
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
    if (!kv) {
        console.warn('KV not configured, skipping save');
        return event;
    }
    console.log('Saving event to KV:', event);
    await kv.set('current_event', event);
    return event;
}

export async function getLatestEvent(): Promise<EventData | null> {
    if (!kv) {
        console.warn('KV not configured, returning null for event');
        return null;
    }
    try {
        const event = await kv.get<EventData>('current_event');
        return event;
    } catch (error) {
        console.error('Error getting event:', error);
        return null;
    }
}