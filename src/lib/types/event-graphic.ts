// Social platform union
export type SocialPlatform = 'twitter' | 'bluesky' | 'linkedin';

// Platform-keyed social handles
export interface SocialHandles {
	twitter?: string;
	bluesky?: string;
	linkedin?: string;
}

export interface EventGraphicSpeaker {
	name: string;
	social: SocialHandles;
	talk: string;
	bio: string;
	bullets: string[];
	avatar: string;
}

export interface EventGraphicSponsor {
	name: string;
	order: number;
	url: string;
	logoLight: string;
	logoDark?: string;
}

// Export target identifiers — three canonical formats
export type ExportTargetId = 'announcement_regular' | 'announcement_discord' | 'agenda_regular';

export interface EventGraphicExportTarget {
	id: ExportTargetId;
	width: number;
	height: number;
	format: 'png' | 'jpg' | 'webp';
	maxBytes?: number;
	label: string;
}

export type ThemeVariant = 'agenda' | 'spotlight' | 'sponsor';

export interface EventGraphicTheme {
	variant: ThemeVariant;
	tokens: Record<string, string>;
}

// The canonical spec — single source of truth for all event rendering
export interface EventGraphicSpec {
	event: {
		title: string;
		number: number;
		startTimeISO: string;
		displayDateTime: string;
		links: {
			registration: string;
			discord: string;
			calendar: string;
			logo: string;
		};
	};
	speakers: EventGraphicSpeaker[];
	sponsors: EventGraphicSponsor[];
	theme: EventGraphicTheme;
	exports: EventGraphicExportTarget[];
}

// Legacy form speaker shape (used by the authoring UI)
export interface FormSpeaker {
	name: string;
	socialPlatform: SocialPlatform;
	socialHandle: string;
	twitterHandle: string;
	profileImagePlatform: string;
	profileImageHandle?: string;
	customImageUrl?: string;
	talk: string;
	bio: string;
	talkPoints: string[];
	image: string;
	error: string;
}

// Raw sponsor shape from sponsors.json
export interface RawSponsor {
	name: string;
	image: string;
	url: string;
	order?: number;
}
