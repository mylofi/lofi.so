import sponsorsData from '$lib/data/sponsors.json';
import { buildStartTimeISO, formatHHMM12, formatYMDLong } from '$lib/utils/date';
import type {
	EventGraphicExportTarget,
	EventGraphicImageFormat,
	EventGraphicManifest,
	EventGraphicSpec,
	EventGraphicSpeaker,
	EventGraphicSponsor,
	EventGraphicTheme,
	ExportArtifactEntry,
	LegacyEventData,
	LegacySpeakerInput,
	SocialPlatform
} from '$lib/types/event-graphic';

const DEFAULT_THEME: EventGraphicTheme = {
	variant: 'agenda',
	tokens: {
		backgroundFrom: '#f59e0b',
		backgroundTo: '#4f46e5',
		surface: '#f8fafc',
		surfaceSecondary: '#ffffff',
		textPrimary: '#111827',
		textSecondary: '#4b5563',
		accent: '#4f46e5'
	}
};

export const DEFAULT_EXPORT_TARGETS: EventGraphicExportTarget[] = [
	{
		id: 'x_feed',
		template: 'agenda',
		scope: 'event',
		width: 1200,
		height: 675,
		format: 'jpg',
		maxBytes: 1_000_000,
		recommendedBytes: 950_000
	},
	{
		id: 'discord_feed',
		template: 'agenda',
		scope: 'event',
		width: 1280,
		height: 720,
		format: 'png',
		maxBytes: 10_000_000,
		recommendedBytes: 9_000_000
	},
	{
		id: 'sponsor_x_feed',
		template: 'sponsor',
		scope: 'sponsor',
		width: 1200,
		height: 675,
		format: 'png',
		maxBytes: 5_000_000,
		recommendedBytes: 4_500_000
	},
	{
		id: 'speaker_x_feed',
		template: 'spotlight',
		scope: 'speaker',
		width: 1200,
		height: 675,
		format: 'png',
		maxBytes: 5_000_000,
		recommendedBytes: 4_500_000
	},
	{
		id: 'legacy_event',
		template: 'agenda',
		scope: 'event',
		width: 1120,
		height: 630,
		format: 'png',
		maxBytes: 5_000_000,
		recommendedBytes: 4_500_000
	},
	{
		id: 'legacy_speaker',
		template: 'spotlight',
		scope: 'speaker',
		width: 800,
		height: 450,
		format: 'png',
		maxBytes: 5_000_000,
		recommendedBytes: 4_500_000
	}
];

const normalizeHandleValue = (rawValue: string, platform: SocialPlatform): string => {
	const value = rawValue.trim();
	if (!value) return '';

	if (platform === 'x') {
		const stripped = value.replace(/^https?:\/\/(www\.)?x\.com\//i, '').replace(/^@+/, '');
		return stripped ? `@${stripped}` : '';
	}

	if (platform === 'bluesky') {
		return value.replace(/^https?:\/\/(www\.)?bsky\.app\/profile\//i, '');
	}

	return value;
};

const mapSocialPlatform = (platform?: string): SocialPlatform => {
	switch ((platform || '').toLowerCase()) {
		case 'twitter':
		case 'x':
			return 'x';
		case 'bluesky':
			return 'bluesky';
		case 'linkedin':
			return 'linkedin';
		case 'discord':
			return 'discord';
		case 'website':
			return 'website';
		default:
			return 'other';
	}
};

const buildSocialRecord = (
	speaker: LegacySpeakerInput
): Partial<Record<SocialPlatform, string>> => {
	const socials: Partial<Record<SocialPlatform, string>> = {};
	const mappedPlatform = mapSocialPlatform(speaker.socialPlatform);
	const socialHandle = normalizeHandleValue(speaker.socialHandle || '', mappedPlatform);

	if (socialHandle) {
		socials[mappedPlatform] = socialHandle;
	}

	const xHandle = normalizeHandleValue(speaker.twitterHandle || '', 'x');
	if (xHandle) {
		socials.x = xHandle;
	}

	return socials;
};

const getPrimarySocialPlatform = (
	socials: Partial<Record<SocialPlatform, string>>
): SocialPlatform => {
	if (socials.x) return 'x';
	if (socials.bluesky) return 'bluesky';
	if (socials.linkedin) return 'linkedin';
	if (socials.discord) return 'discord';
	if (socials.website) return 'website';
	return 'other';
};

const normalizeSpeaker = (speaker: LegacySpeakerInput): EventGraphicSpeaker => {
	const socials = buildSocialRecord(speaker);

	return {
		name: speaker.name?.trim() || 'TBA',
		socials,
		primarySocialPlatform: getPrimarySocialPlatform(socials),
		talkTitle: speaker.talk?.trim() || 'Talk title to be announced',
		bio: speaker.bio?.trim() || '',
		bullets: (speaker.talkPoints || []).map((point) => point.trim()).filter(Boolean),
		avatarUrl: speaker.image || ''
	};
};

const sortSponsors = (sponsors: EventGraphicSponsor[]): EventGraphicSponsor[] => {
	return [...sponsors].sort((a, b) => {
		return a.order - b.order;
	});
};

const normalizeExportTargets = (
	targets: EventGraphicExportTarget[] | undefined
): EventGraphicExportTarget[] => {
	if (!targets || targets.length === 0) {
		return DEFAULT_EXPORT_TARGETS;
	}

	const normalized: EventGraphicExportTarget[] = [];
	const seen = new Set<string>();

	for (const target of targets) {
		if (target.id === 'bsky_feed') {
			continue;
		}

		if (target.id === 'x_feed') {
			if (seen.has('x_feed')) continue;
			normalized.push({
				...target,
				width: 1200,
				height: 675,
				format: 'jpg',
				maxBytes: 1_000_000,
				recommendedBytes: 950_000
			});
			seen.add('x_feed');
			continue;
		}

		if (seen.has(target.id)) continue;
		normalized.push(target);
		seen.add(target.id);
	}

	if (!seen.has('x_feed')) {
		const sharedEventTarget = DEFAULT_EXPORT_TARGETS.find((target) => target.id === 'x_feed');
		if (sharedEventTarget) {
			normalized.unshift(sharedEventTarget);
		}
	}

	return normalized;
};

export const getDefaultSponsors = (): EventGraphicSponsor[] => {
	const list = sponsorsData.sponsors.map((sponsor, index) => ({
		name: sponsor.name,
		url: sponsor.url,
		logoLight: sponsor.image,
		logoDark: sponsor.image,
		order: Number.isFinite(sponsor.order) ? sponsor.order : index + 1
	}));
	return sortSponsors(list);
};

export const normalizeSponsors = (
	sponsors: EventGraphicSponsor[] | undefined
): EventGraphicSponsor[] => {
	if (!sponsors || sponsors.length === 0) {
		return getDefaultSponsors();
	}

	const normalized = sponsors.map((sponsor, index) => ({
		name: sponsor.name?.trim() || `Sponsor ${index + 1}`,
		url: sponsor.url?.trim() || '',
		logoLight: sponsor.logoLight?.trim() || sponsor.logoDark?.trim() || '',
		logoDark: sponsor.logoDark?.trim() || sponsor.logoLight?.trim() || '',
		order: Number.isFinite(sponsor.order) ? sponsor.order : index + 1
	}));

	return sortSponsors(normalized);
};

const buildDisplayDateTime = (
	date: string,
	time: string,
	timezone: string,
	startTimeISO?: string
): string => {
	if (startTimeISO) {
		const parsed = new Date(startTimeISO);
		if (!Number.isNaN(parsed.getTime())) {
			const datePart = parsed.toLocaleDateString('en-US', {
				weekday: 'long',
				month: 'long',
				day: 'numeric',
				year: 'numeric'
			});
			const timePart = parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
			return `${datePart} @ ${timePart} ${timezone}`;
		}
	}

	const formattedDate = date ? formatYMDLong(date) : '';
	const formattedTime = time ? formatHHMM12(time) : '';
	if (formattedDate && formattedTime) {
		return `${formattedDate} @ ${formattedTime} ${timezone}`;
	}
	return formattedDate || formattedTime;
};

export const toEventGraphicSpec = (
	input: Partial<LegacyEventData> | null | undefined
): EventGraphicSpec | null => {
	if (!input) return null;

	if (input.spec) {
		const spec = input.spec;
		return {
			event: {
				title: spec.event.title,
				number: spec.event.number,
				startTimeISO: spec.event.startTimeISO,
				displayDateTime: spec.event.displayDateTime,
				links: {
					registrationUrl: spec.event.links.registrationUrl,
					discordUrl: spec.event.links.discordUrl,
					calendarUrl: spec.event.links.calendarUrl,
					logoUrl: spec.event.links.logoUrl || '/images/logo.png'
				}
			},
			speakers: (spec.speakers || []).map((speaker) => ({
				name: speaker.name,
				socials: speaker.socials || {},
				primarySocialPlatform:
					speaker.primarySocialPlatform || getPrimarySocialPlatform(speaker.socials || {}),
				talkTitle: speaker.talkTitle,
				bio: speaker.bio || '',
				bullets: (speaker.bullets || []).filter(Boolean),
				avatarUrl: speaker.avatarUrl || ''
			})),
			sponsors: normalizeSponsors(spec.sponsors),
			theme: spec.theme || DEFAULT_THEME,
			exports: normalizeExportTargets(spec.exports)
		};
	}

	if (!input.title || !input.eventNumber) {
		return null;
	}

	const startTimeISO = input.startTimeISO
		? input.startTimeISO
		: input.date && input.time
			? buildStartTimeISO(input.date, input.time, input.timezone)
			: '';

	return {
		event: {
			title: input.title,
			number: input.eventNumber,
			startTimeISO,
			displayDateTime: buildDisplayDateTime(
				input.date || '',
				input.time || '',
				input.timezone || 'UTC',
				startTimeISO
			),
			links: {
				registrationUrl: input.registrationUrl || 'https://lofi.so',
				discordUrl: input.discordUrl || 'https://discord.gg/lofi-so',
				calendarUrl:
					input.calendarUrl || 'https://calendar.google.com/calendar/event?action=TEMPLATE',
				logoUrl: input.logoUrl || '/images/logo.png'
			}
		},
		speakers: (input.speakers || []).map(normalizeSpeaker),
		sponsors: normalizeSponsors(input.sponsors),
		theme: DEFAULT_THEME,
		exports: DEFAULT_EXPORT_TARGETS
	};
};

const primaryHandleFromSpeaker = (speaker: EventGraphicSpeaker): string => {
	const platform = speaker.primarySocialPlatform;
	if (speaker.socials[platform]) return speaker.socials[platform] || '';
	if (speaker.socials.x) return speaker.socials.x || '';
	if (speaker.socials.bluesky) return speaker.socials.bluesky || '';
	const firstValue = Object.values(speaker.socials).find(Boolean);
	return firstValue || '';
};

export const fromEventGraphicSpec = (spec: EventGraphicSpec): LegacyEventData => {
	const parsedStart = new Date(spec.event.startTimeISO);
	const hasValidStart = !Number.isNaN(parsedStart.getTime());
	const date = hasValidStart ? parsedStart.toISOString().slice(0, 10) : '';
	const time = hasValidStart
		? `${parsedStart.getHours().toString().padStart(2, '0')}:${parsedStart
				.getMinutes()
				.toString()
				.padStart(2, '0')}`
		: '08:00';

	return {
		eventNumber: spec.event.number,
		title: spec.event.title,
		startTimeISO: spec.event.startTimeISO,
		date,
		time,
		timezone: 'UTC',
		speakers: spec.speakers.map((speaker) => ({
			name: speaker.name,
			twitterHandle: speaker.socials.x || '',
			socialPlatform: speaker.primarySocialPlatform,
			socialHandle: primaryHandleFromSpeaker(speaker),
			talk: speaker.talkTitle,
			bio: speaker.bio,
			talkPoints: speaker.bullets,
			image: speaker.avatarUrl
		})),
		registrationUrl: spec.event.links.registrationUrl,
		discordUrl: spec.event.links.discordUrl,
		calendarUrl: spec.event.links.calendarUrl,
		logoUrl: spec.event.links.logoUrl || '/images/logo.png',
		sponsors: normalizeSponsors(spec.sponsors),
		spec
	};
};

export const slugify = (input: string): string => {
	return input
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
};

export const buildAgendaAltText = (spec: EventGraphicSpec): string => {
	const speakerNames = spec.speakers
		.map((speaker) => speaker.name)
		.filter(Boolean)
		.join(', ');
	return `LoFi/${spec.event.number} ${spec.event.title}. ${spec.event.displayDateTime}. Talks by ${speakerNames}. Sponsors: ${spec.sponsors.map((sponsor) => sponsor.name).join(', ')}.`;
};

export const buildSpeakerAltText = (
	spec: EventGraphicSpec,
	speaker: EventGraphicSpeaker
): string => {
	return `LoFi/${spec.event.number} speaker spotlight: ${speaker.name} presenting ${speaker.talkTitle}. ${spec.event.displayDateTime}.`;
};

export const buildSponsorAltText = (spec: EventGraphicSpec): string => {
	return `LoFi/${spec.event.number} sponsor spotlight highlighting ${spec.sponsors.map((sponsor) => sponsor.name).join(', ')}. ${spec.event.displayDateTime}.`;
};

export const buildCaptionsMarkdown = (spec: EventGraphicSpec): string => {
	const talkLines = spec.speakers
		.map((speaker) => `- ${speaker.name}: ${speaker.talkTitle}`)
		.join('\n');
	const base = `LoFi/${spec.event.number} ${spec.event.title}\\n${spec.event.displayDateTime}\\n\\n${talkLines}`;

	return [
		'# Captions',
		'',
		'## X',
		`${base}\n\nJoin Discord: ${spec.event.links.discordUrl}\nAdd to Calendar: ${spec.event.links.calendarUrl}`,
		'',
		'## X Sponsor Reply',
		`Thanks to our sponsors: ${spec.sponsors.map((sponsor) => sponsor.name).join(', ')}.`,
		'',
		'## Bluesky',
		`${base}\n\nJoin: ${spec.event.links.discordUrl}`,
		'',
		'## Discord',
		`${base}\n\nRegistration: ${spec.event.links.registrationUrl}`
	].join('\n');
};

const hasEnoughContrast = (luminanceRange: number): boolean => luminanceRange >= 30;

export const getImageContrastStatus = (
	rgba: Uint8ClampedArray
): {
	status: 'ok' | 'warning';
	warning?: string;
} => {
	if (rgba.length < 4) {
		return { status: 'warning', warning: 'Unable to sample image for contrast validation.' };
	}

	let minLuma = Number.POSITIVE_INFINITY;
	let maxLuma = Number.NEGATIVE_INFINITY;

	for (let index = 0; index < rgba.length; index += 16) {
		const r = rgba[index] ?? 0;
		const g = rgba[index + 1] ?? 0;
		const b = rgba[index + 2] ?? 0;
		const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
		if (luma < minLuma) minLuma = luma;
		if (luma > maxLuma) maxLuma = luma;
	}

	const range = maxLuma - minLuma;
	if (hasEnoughContrast(range)) {
		return { status: 'ok' };
	}

	return {
		status: 'warning',
		warning: `Low luminance range (${Math.round(range)}) detected; verify sponsor/logo contrast manually.`
	};
};

export const getExtensionForFormat = (format: EventGraphicImageFormat): string => {
	switch (format) {
		case 'jpg':
			return 'jpg';
		case 'webp':
			return 'webp';
		default:
			return 'png';
	}
};

export const buildManifest = (
	spec: EventGraphicSpec,
	artifacts: ExportArtifactEntry[]
): EventGraphicManifest => {
	return {
		generatedAtISO: new Date().toISOString(),
		eventNumber: spec.event.number,
		title: spec.event.title,
		artifacts
	};
};
