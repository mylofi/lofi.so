export type SocialPlatform = 'x' | 'bluesky' | 'linkedin' | 'discord' | 'website' | 'other';

export type EventGraphicVariant = 'agenda' | 'spotlight' | 'sponsor';

export type EventGraphicExportTargetId =
	| 'announcement_regular'
	| 'announcement_discord'
	| 'agenda_regular'
	| 'x_feed'
	| 'bsky_feed'
	| 'discord_feed'
	| 'sponsor_x_feed'
	| 'speaker_x_feed'
	| 'speaker_discord_cover'
	| 'legacy_event'
	| 'legacy_speaker';

export type EventGraphicImageFormat = 'png' | 'jpg' | 'webp';

export type EventGraphicExportScope = 'announcement' | 'agenda' | 'event' | 'speaker' | 'sponsor';

export interface EventGraphicLinks {
	registrationUrl: string;
	discordUrl: string;
	calendarUrl: string;
	logoUrl?: string;
}

export interface EventGraphicSpeaker {
	name: string;
	socials: Partial<Record<SocialPlatform, string>>;
	primarySocialPlatform: SocialPlatform;
	talkTitle: string;
	bio: string;
	bullets: string[];
	avatarUrl: string;
}

export interface EventGraphicSponsor {
	name: string;
	url: string;
	logoLight: string;
	logoDark?: string;
	order: number;
}

export interface EventGraphicThemeTokens {
	backgroundFrom: string;
	backgroundTo: string;
	surface: string;
	surfaceSecondary: string;
	textPrimary: string;
	textSecondary: string;
	accent: string;
}

export interface EventGraphicTheme {
	variant: EventGraphicVariant;
	tokens: EventGraphicThemeTokens;
}

export interface EventGraphicExportTarget {
	id: EventGraphicExportTargetId;
	template: EventGraphicVariant;
	scope: EventGraphicExportScope;
	width: number;
	height: number;
	format: EventGraphicImageFormat;
	maxBytes?: number;
	recommendedBytes?: number;
}

export interface EventGraphicSpec {
	event: {
		title: string;
		number: number;
		startTimeISO: string;
		displayDateTime: string;
		links: EventGraphicLinks;
	};
	speakers: EventGraphicSpeaker[];
	sponsors: EventGraphicSponsor[];
	theme: EventGraphicTheme;
	exports: EventGraphicExportTarget[];
}

export interface LegacySpeakerInput {
	name: string;
	twitterHandle?: string;
	blueskyHandle?: string;
	socialPlatform?: string;
	socialHandle?: string;
	talk: string;
	bio?: string;
	talkPoints?: string[];
	image: string;
}

export interface LegacyEventData {
	eventNumber: number;
	title: string;
	startTimeISO?: string;
	date: string;
	time: string;
	timezone: string;
	speakers: LegacySpeakerInput[];
	registrationUrl: string;
	discordUrl: string;
	calendarUrl: string;
	logoUrl: string;
	sponsors?: EventGraphicSponsor[];
	spec?: EventGraphicSpec;
}

export interface ExportArtifactEntry {
	path: string;
	bytes: number;
	checksumSha256: string;
	dimensions: {
		width: number;
		height: number;
	};
	format: EventGraphicImageFormat;
	targetId: EventGraphicExportTargetId;
	template: EventGraphicVariant;
	scope: EventGraphicExportScope;
	status: 'ok' | 'warning' | 'error';
	warnings: string[];
	altText: string;
}

export interface EventGraphicManifest {
	generatedAtISO: string;
	eventNumber: number;
	title: string;
	artifacts: ExportArtifactEntry[];
}
