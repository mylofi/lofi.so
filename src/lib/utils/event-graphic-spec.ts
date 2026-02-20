import type { EventData } from '$lib/server/kv';
import type {
	EventGraphicSpec,
	EventGraphicSpeaker,
	EventGraphicSponsor,
	EventGraphicExportTarget,
	SocialHandles,
	FormSpeaker,
	RawSponsor
} from '$lib/types/event-graphic';
import { formatYMDLong, formatHHMM12 } from '$lib/utils/date';

// ---------------------------------------------------------------------------
// Export presets
// ---------------------------------------------------------------------------

export function getExportPresets(): EventGraphicExportTarget[] {
	return [
		{
			id: 'announcement_regular',
			width: 1200,
			height: 675,
			format: 'jpg',
			maxBytes: 5_000_000,
			label: 'X / Bluesky Feed (1200x675 JPG)'
		},
		{
			id: 'announcement_discord',
			width: 800,
			height: 320,
			format: 'png',
			maxBytes: 10_000_000,
			label: 'Discord Banner (800x320 PNG)'
		},
		{
			id: 'agenda_regular',
			width: 1200,
			height: 675,
			format: 'png',
			maxBytes: 5_000_000,
			label: 'Speaker Spotlight (1200x675 PNG)'
		}
	];
}

export function getLegacyExportPresets() {
	return {
		event: { w: 1120, h: 630 },
		speaker: { w: 800, h: 450 }
	};
}

// ---------------------------------------------------------------------------
// Sponsor normalization
// ---------------------------------------------------------------------------

export function normalizeSponsors(raw: RawSponsor[]): EventGraphicSponsor[] {
	return raw
		.map((s, i) => ({
			name: s.name,
			order: s.order ?? i,
			url: s.url,
			logoLight: s.image,
			logoDark: undefined
		}))
		.sort((a, b) => a.order - b.order);
}



// ---------------------------------------------------------------------------
// Social handle normalization
// ---------------------------------------------------------------------------

export function normalizeSocialHandles(formSpeaker: FormSpeaker): SocialHandles {
	const handles: SocialHandles = {};
	if (formSpeaker.socialPlatform && formSpeaker.socialHandle) {
		handles[formSpeaker.socialPlatform] = formSpeaker.socialHandle;
	}
	// Keep legacy twitterHandle if present and not already set
	if (formSpeaker.twitterHandle && !handles.twitter) {
		handles.twitter = formSpeaker.twitterHandle;
	}
	return handles;
}

/** Pick the best social handle to display */
export function getPrimarySocial(speaker: EventGraphicSpeaker): {
	platform: string;
	handle: string;
} | null {
	if (speaker.social.twitter) return { platform: 'twitter', handle: speaker.social.twitter };
	if (speaker.social.bluesky) return { platform: 'bluesky', handle: speaker.social.bluesky };
	if (speaker.social.linkedin) return { platform: 'linkedin', handle: speaker.social.linkedin };
	return null;
}

/** Build a profile URL for a social handle */
export function getSocialUrl(platform: string, handle: string): string {
	const clean = handle.replace(/^@/, '');
	switch (platform) {
		case 'twitter':
			return `https://x.com/${clean}`;
		case 'bluesky':
			return `https://bsky.app/profile/${clean}`;
		case 'linkedin':
			return `https://linkedin.com/in/${clean}`;
		default:
			return '#';
	}
}

// ---------------------------------------------------------------------------
// Display date/time builder
// ---------------------------------------------------------------------------

function buildDisplayDateTime(
	startTimeISO?: string,
	date?: string,
	time?: string,
	timezone?: string
): string {
	if (date && time) {
		const datePart = formatYMDLong(date);
		const timePart = formatHHMM12(time);
		const tz = timezone ?? '';
		return `${datePart} · ${timePart} ${tz}`.trim();
	}
	if (startTimeISO) {
		const d = new Date(startTimeISO);
		return d.toLocaleDateString('en-US', {
			weekday: 'long',
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		});
	}
	return '';
}

// ---------------------------------------------------------------------------
// Legacy → Spec conversion
// ---------------------------------------------------------------------------

export function toEventGraphicSpec(
	legacy: EventData,
	formSpeakers?: FormSpeaker[],
	rawSponsors?: RawSponsor[]
): EventGraphicSpec {
	const displayDateTime = buildDisplayDateTime(
		legacy.startTimeISO,
		legacy.date,
		legacy.time,
		legacy.timezone
	);

	// Map speakers
	const speakers: EventGraphicSpeaker[] = formSpeakers
		? formSpeakers.map((fs) => ({
				name: fs.name,
				social: normalizeSocialHandles(fs),
				talk: fs.talk,
				bio: fs.bio,
				bullets: fs.talkPoints.filter((p) => p.trim() !== ''),
				avatar: fs.image
			}))
		: legacy.speakers.map((ls) => ({
				name: ls.name,
				social: { twitter: ls.twitterHandle || undefined },
				talk: ls.talk,
				bio: '',
				bullets: [],
				avatar: ls.image
			}));

	// Normalize sponsors
	const sponsors = rawSponsors ? normalizeSponsors(rawSponsors) : [];

	return {
		event: {
			title: legacy.title,
			number: legacy.eventNumber,
			startTimeISO: legacy.startTimeISO ?? '',
			displayDateTime,
			links: {
				registration: legacy.registrationUrl,
				discord: legacy.discordUrl,
				calendar: legacy.calendarUrl,
				logo: legacy.logoUrl
			}
		},
		speakers,
		sponsors,
		theme: {
			variant: 'agenda',
			tokens: {}
		},
		exports: getExportPresets()
	};
}

// ---------------------------------------------------------------------------
// Spec → Legacy conversion (round-trip for KV persistence)
// ---------------------------------------------------------------------------

export function fromEventGraphicSpec(spec: EventGraphicSpec): EventData {
	// Extract date/time/timezone from startTimeISO
	let date = '';
	let time = '';
	let timezone = 'PST';

	if (spec.event.startTimeISO) {
		const d = new Date(spec.event.startTimeISO);
		if (!isNaN(d.getTime())) {
			date = d.toISOString().split('T')[0];
			time = `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
			timezone = 'UTC';
		}
	}

	return {
		eventNumber: spec.event.number,
		title: spec.event.title,
		startTimeISO: spec.event.startTimeISO || undefined,
		date,
		time,
		timezone,
		speakers: spec.speakers.map((s) => ({
			name: s.name,
			twitterHandle: s.social.twitter ?? '',
			talk: s.talk,
			image: s.avatar
		})),
		registrationUrl: spec.event.links.registration,
		discordUrl: spec.event.links.discord,
		calendarUrl: spec.event.links.calendar,
		logoUrl: spec.event.links.logo
	};
}
