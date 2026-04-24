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
import { EVENT_TZ } from '$lib/utils/time';

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
			id: 'homepage_tablet',
			width: 768,
			height: 432,
			format: 'png',
			maxBytes: 5_000_000,
			label: 'Homepage Tablet (768x432 PNG)'
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

/** Format a speaker's primary social handle for visual display.
 *  Convention: Twitter → @handle, Bluesky → $handle, LinkedIn → [in]/handle */
export function getDisplayHandle(speaker: EventGraphicSpeaker): string {
	const primary = getPrimarySocial(speaker);
	if (!primary) return '';
	const clean = primary.handle.replace(/^@/, '');
	switch (primary.platform) {
		case 'twitter':
			return `@/${clean}`;
		case 'bluesky':
			return `$/${clean}`;
		case 'linkedin':
			return `[in]/${clean}`;
		default:
			return primary.handle;
	}
}

// ---------------------------------------------------------------------------
// Display date/time builder
// ---------------------------------------------------------------------------

function buildDisplayDateTime(startTime: number): string {
	if (!startTime) return '';
	const d = new Date(startTime * 1000);
	const datePart = d.toLocaleDateString('en-US', {
		timeZone: EVENT_TZ,
		weekday: 'long',
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	});
	const timePart = d.toLocaleTimeString('en-US', {
		timeZone: EVENT_TZ,
		hour: 'numeric',
		minute: '2-digit',
		timeZoneName: 'short'
	});
	return `${datePart} · ${timePart}`;
}

// ---------------------------------------------------------------------------
// Legacy → Spec conversion
// ---------------------------------------------------------------------------

export function toEventGraphicSpec(
	legacy: EventData,
	formSpeakers?: FormSpeaker[],
	rawSponsors?: RawSponsor[]
): EventGraphicSpec {
	const displayDateTime = buildDisplayDateTime(legacy.startTime);

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
				social: {
					twitter: ls.twitterHandle || undefined,
					bluesky: ls.blueskyHandle || undefined
				},
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
			startTime: legacy.startTime,
			displayDateTime,
			links: {
				registration: legacy.registrationUrl,
				discord: legacy.discordUrl,
				calendar: legacy.calendarUrl,
				logo: legacy.logoUrl,
				youtube: legacy.youtubeUrl
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
	return {
		eventNumber: spec.event.number,
		title: spec.event.title,
		startTime: spec.event.startTime,
		speakers: spec.speakers.map((s) => ({
			name: s.name,
			twitterHandle: s.social.twitter ?? '',
			blueskyHandle: s.social.bluesky ?? '',
			talk: s.talk,
			image: s.avatar
		})),
		registrationUrl: spec.event.links.registration,
		discordUrl: spec.event.links.discord,
		calendarUrl: spec.event.links.calendar,
		logoUrl: spec.event.links.logo,
		youtubeUrl: spec.event.links.youtube
	};
}
