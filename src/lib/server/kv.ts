import { createClient } from '@vercel/kv';
import { KV_REST_API_TOKEN, KV_REST_API_URL } from '$env/static/private';

const kv = createClient({
    url: KV_REST_API_URL,
    token: KV_REST_API_TOKEN
});

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
    console.log('Saving event to KV:', event);
    await kv.set('current_event', event);
    return event;
}

export async function getLatestEvent(): Promise<EventData | null> {
    const event = await kv.get<EventData>('current_event');
    console.log('Retrieved event from KV:', event);
    return event;
} 