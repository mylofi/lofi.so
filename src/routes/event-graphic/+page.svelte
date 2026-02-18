<script lang="ts">
	import { domToPng } from 'modern-screenshot';
	import { onMount } from 'svelte';
	import EventGraphic from '$lib/components/EventGraphic.svelte';
	import SpeakerCard from '$lib/components/SpeakerCard.svelte';
	import SponsorCard from '$lib/components/SponsorCard.svelte';
	import { buildStartTimeISO, tzOffsetMap } from '$lib/utils/date';
	import fixturesData from '$lib/data/event-graphic-fixtures.json';
	import type {
		EventGraphicExportTarget,
		EventGraphicExportTargetId,
		EventGraphicSpec,
		EventGraphicSponsor,
		ExportArtifactEntry,
		LegacyEventData,
		SponsorTier
	} from '$lib/types/event-graphic';
	import {
		buildAgendaAltText,
		buildCaptionsMarkdown,
		buildManifest,
		buildSponsorAltText,
		buildSpeakerAltText,
		DEFAULT_EXPORT_TARGETS,
		getExtensionForFormat,
		getImageContrastStatus,
		normalizeSponsors,
		slugify,
		toEventGraphicSpec
	} from '$lib/utils/event-graphic-spec';

	type SocialPlatform = 'twitter' | 'bluesky' | 'linkedin';
	type ProfileImagePlatform = 'twitter' | 'bluesky' | 'custom';

	interface SpeakerFormData {
		name: string;
		socialPlatform: SocialPlatform;
		socialHandle: string;
		twitterHandle: string;
		profileImagePlatform: ProfileImagePlatform;
		profileImageHandle: string;
		customImageUrl: string;
		talk: string;
		bio: string;
		talkPoints: string[];
		image: string;
		error: string;
	}

	interface SponsorFormData {
		name: string;
		tier: SponsorTier;
		url: string;
		logoLight: string;
		logoDark: string;
		priority: number;
	}

	interface EventGraphicFixture {
		id: string;
		label: string;
		description: string;
		event: {
			title: string;
			eventNumber: number;
			date: string;
			time: string;
			timezone: string;
			registrationUrl: string;
			discordUrl: string;
			calendarUrl: string;
			logoUrl: string;
		};
		speakers: Array<{
			name: string;
			socialPlatform: SocialPlatform;
			socialHandle: string;
			talk: string;
			bio: string;
			talkPoints: string[];
		}>;
	}

	const fixtures = (fixturesData.fixtures || []) as EventGraphicFixture[];

	const toInputDate = (date: Date): string => {
		const year = date.getFullYear();
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const day = `${date.getDate()}`.padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const getLastTuesdayOfMonth = (): string => {
		const today = new Date();
		const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		while (lastDayOfMonth.getDay() !== 2) {
			lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);
		}
		return toInputDate(lastDayOfMonth);
	};

	const createSpeaker = (): SpeakerFormData => ({
		name: '',
		socialPlatform: 'twitter',
		socialHandle: '@',
		twitterHandle: '@',
		profileImagePlatform: 'twitter',
		profileImageHandle: '',
		customImageUrl: '',
		talk: '',
		bio: '',
		talkPoints: ['', '', ''],
		image: '',
		error: ''
	});

	const toFormSponsor = (sponsor: EventGraphicSponsor): SponsorFormData => ({
		name: sponsor.name,
		tier: sponsor.tier,
		url: sponsor.url,
		logoLight: sponsor.logoLight,
		logoDark: sponsor.logoDark || sponsor.logoLight,
		priority: sponsor.priority
	});

	const createSponsor = (): SponsorFormData => ({
		name: '',
		tier: 'Gold',
		url: '',
		logoLight: '',
		logoDark: '',
		priority: 999
	});

	const defaultSponsors = normalizeSponsors(undefined).map(toFormSponsor);

	let formData: {
		title: string;
		eventNumber: number;
		date: string;
		time: string;
		timezone: string;
		speakers: SpeakerFormData[];
		sponsors: SponsorFormData[];
		registrationUrl: string;
		discordUrl: string;
		calendarUrl: string;
		logoUrl: string;
		includeLegacyTargets: boolean;
	} = {
		title: 'Watch Party',
		eventNumber: 1,
		date: getLastTuesdayOfMonth(),
		time: '08:00',
		timezone: 'PST',
		speakers: [createSpeaker()],
		sponsors: defaultSponsors,
		registrationUrl: 'https://lofi.so',
		discordUrl: 'https://discord.gg/ZRrwZxn4rW',
		calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
		logoUrl: '/images/logo.png',
		includeLegacyTargets: true
	};

	let isExporting = false;
	let exportError = '';
	let exportSuccess = '';
	let runManifest: ReturnType<typeof buildManifest> | null = null;
	let runArtifacts: ExportArtifactEntry[] = [];
	let previewEventTargetId: EventGraphicExportTargetId = 'x_feed';
	let previewSponsorTargetId: EventGraphicExportTargetId = 'sponsor_x_feed';
	let previewSpeakerTargetId: EventGraphicExportTargetId = 'speaker_x_feed';
	let selectedFixtureId = '';

	$: startTimeISO =
		formData.date && formData.time
			? new Date(buildStartTimeISO(formData.date, formData.time, formData.timezone)).toISOString()
			: '';

	$: basePayload = {
		title: formData.title,
		eventNumber: formData.eventNumber,
		date: formData.date,
		time: formData.time,
		timezone: formData.timezone,
		startTimeISO,
		speakers: formData.speakers.map((speaker) => ({
			name: speaker.name,
			socialPlatform: speaker.socialPlatform,
			socialHandle: speaker.socialHandle,
			twitterHandle: speaker.twitterHandle,
			talk: speaker.talk,
			bio: speaker.bio,
			talkPoints: speaker.talkPoints,
			image: speaker.image
		})),
		sponsors: formData.sponsors.map((sponsor) => ({
			name: sponsor.name,
			tier: sponsor.tier,
			url: sponsor.url,
			logoLight: sponsor.logoLight,
			logoDark: sponsor.logoDark || sponsor.logoLight,
			priority: sponsor.priority
		})),
		registrationUrl: formData.registrationUrl,
		discordUrl: formData.discordUrl,
		calendarUrl: formData.calendarUrl,
		logoUrl: formData.logoUrl
	} satisfies Partial<LegacyEventData>;

	$: eventSpec = toEventGraphicSpec(basePayload);
	$: allTargets = eventSpec?.exports || DEFAULT_EXPORT_TARGETS;
	$: selectedTargets = allTargets.filter(
		(target) => formData.includeLegacyTargets || !target.id.startsWith('legacy')
	);
	$: eventTargets = selectedTargets.filter((target) => target.scope === 'event');
	$: sponsorTargets = selectedTargets.filter((target) => target.scope === 'sponsor');
	$: speakerTargets = selectedTargets.filter((target) => target.scope === 'speaker');
	$: previewEventTarget =
		eventTargets.find((target) => target.id === previewEventTargetId) ||
		eventTargets[0] ||
		DEFAULT_EXPORT_TARGETS[0];
	$: previewSponsorTarget =
		sponsorTargets.find((target) => target.id === previewSponsorTargetId) ||
		sponsorTargets[0] ||
		DEFAULT_EXPORT_TARGETS.find((target) => target.id === 'sponsor_x_feed') ||
		DEFAULT_EXPORT_TARGETS[0];
	$: previewSpeakerTarget =
		speakerTargets.find((target) => target.id === previewSpeakerTargetId) ||
		speakerTargets[0] ||
		DEFAULT_EXPORT_TARGETS.find((target) => target.id === 'speaker_x_feed') ||
		DEFAULT_EXPORT_TARGETS[0];

	$: if (!eventTargets.find((target) => target.id === previewEventTargetId) && eventTargets[0]) {
		previewEventTargetId = eventTargets[0].id;
	}

	$: if (
		!sponsorTargets.find((target) => target.id === previewSponsorTargetId) &&
		sponsorTargets[0]
	) {
		previewSponsorTargetId = sponsorTargets[0].id;
	}

	$: if (
		!speakerTargets.find((target) => target.id === previewSpeakerTargetId) &&
		speakerTargets[0]
	) {
		previewSpeakerTargetId = speakerTargets[0].id;
	}

	const parseISOToDateTime = (iso: string): { date: string; time: string } => {
		const parsed = new Date(iso);
		if (Number.isNaN(parsed.getTime())) {
			return { date: getLastTuesdayOfMonth(), time: '08:00' };
		}
		return {
			date: toInputDate(parsed),
			time: `${parsed.getHours().toString().padStart(2, '0')}:${parsed
				.getMinutes()
				.toString()
				.padStart(2, '0')}`
		};
	};

	const updateToLastTuesday = () => {
		formData.date = getLastTuesdayOfMonth();
		formData = { ...formData };
	};

	function resetForm() {
		formData = {
			title: 'Watch Party',
			eventNumber: 1,
			date: getLastTuesdayOfMonth(),
			time: '08:00',
			timezone: 'PST',
			speakers: [createSpeaker()],
			sponsors: defaultSponsors,
			registrationUrl: 'https://lofi.so',
			discordUrl: 'https://discord.gg/ZRrwZxn4rW',
			calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
			logoUrl: '/images/logo.png',
			includeLegacyTargets: true
		};
		runArtifacts = [];
		runManifest = null;
		exportError = '';
		exportSuccess = '';
	}

	function addSpeaker() {
		formData.speakers = [...formData.speakers, createSpeaker()];
		formData = { ...formData };
	}

	function removeSpeaker(index: number) {
		formData.speakers = formData.speakers.filter((_, currentIndex) => currentIndex !== index);
		formData = { ...formData };
	}

	function addSponsor() {
		formData.sponsors = [...formData.sponsors, createSponsor()];
		formData = { ...formData };
	}

	function removeSponsor(index: number) {
		formData.sponsors = formData.sponsors.filter((_, currentIndex) => currentIndex !== index);
		formData = { ...formData };
	}

	function sortSponsorsByTierAndPriority() {
		const sorted = normalizeSponsors(
			formData.sponsors.map((sponsor) => ({
				name: sponsor.name,
				tier: sponsor.tier,
				url: sponsor.url,
				logoLight: sponsor.logoLight,
				logoDark: sponsor.logoDark || sponsor.logoLight,
				priority: sponsor.priority
			}))
		);
		formData.sponsors = sorted.map(toFormSponsor);
		formData = { ...formData };
	}

	function handleSocialHandleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const platform = formData.speakers[index].socialPlatform;
		let value = input.value;

		if (platform === 'twitter' && value && !value.startsWith('@')) {
			value = `@${value}`;
		}

		formData.speakers[index].socialHandle = value;
		if (platform === 'twitter') {
			formData.speakers[index].twitterHandle = value;
		}
		formData = { ...formData };
		handleSocialHandleChange(index);
	}

	function handleSocialPlatformChange(index: number) {
		const speaker = formData.speakers[index];
		if (
			speaker.socialPlatform === 'twitter' &&
			speaker.socialHandle &&
			!speaker.socialHandle.startsWith('@')
		) {
			speaker.socialHandle = `@${speaker.socialHandle}`;
		}

		if (speaker.socialPlatform === 'twitter' || speaker.socialPlatform === 'bluesky') {
			speaker.profileImagePlatform = speaker.socialPlatform;
		}

		formData = { ...formData };
		handleSocialHandleChange(index);
	}

	async function fetchTwitterProfile(handle: string): Promise<string | null> {
		if (!handle) return null;
		const response = await fetch(
			`/api/profile-image?platform=twitter&username=${encodeURIComponent(handle)}`
		);
		if (!response.ok) {
			throw new Error('Failed to fetch X profile image');
		}
		const data = await response.json();
		return data.profile_image_url || null;
	}

	async function fetchBlueskyProfile(handle: string): Promise<string | null> {
		if (!handle) return null;
		const response = await fetch(
			`/api/profile-image?platform=bluesky&username=${encodeURIComponent(handle)}`
		);
		if (!response.ok) {
			throw new Error('Failed to fetch Bluesky profile image');
		}
		const data = await response.json();
		if (!data.profile_image_url) return null;
		return `/api/proxy-bsky-image?url=${encodeURIComponent(data.profile_image_url)}`;
	}

	async function handleSocialHandleChange(index: number) {
		const speaker = formData.speakers[index];
		speaker.error = '';

		if (speaker.profileImagePlatform === 'custom') {
			if (!speaker.customImageUrl) {
				speaker.image = '';
				formData = { ...formData };
				return;
			}

			try {
				const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(speaker.customImageUrl)}`;
				const response = await fetch(proxyUrl);
				if (!response.ok) {
					throw new Error('Unable to fetch custom image');
				}
				speaker.image = proxyUrl;
			} catch (error) {
				speaker.image = '';
				speaker.error = error instanceof Error ? error.message : 'Unable to fetch custom image';
			}

			formData = { ...formData };
			return;
		}

		const preferredHandle =
			speaker.profileImagePlatform === 'bluesky'
				? speaker.profileImageHandle || speaker.socialHandle
				: speaker.twitterHandle || speaker.socialHandle;

		if (!preferredHandle || preferredHandle === '@') {
			speaker.image = '';
			formData = { ...formData };
			return;
		}

		try {
			if (speaker.profileImagePlatform === 'twitter') {
				speaker.image = (await fetchTwitterProfile(preferredHandle)) || '';
			} else {
				speaker.image = (await fetchBlueskyProfile(preferredHandle)) || '';
			}
		} catch (error) {
			speaker.image = '';
			speaker.error = error instanceof Error ? error.message : 'Unable to fetch profile image';
		}

		formData = { ...formData };
	}

	function applyFixture(fixtureId: string) {
		const fixture = fixtures.find((item) => item.id === fixtureId);
		if (!fixture) return;

		formData = {
			title: fixture.event.title,
			eventNumber: fixture.event.eventNumber,
			date: fixture.event.date,
			time: fixture.event.time,
			timezone: fixture.event.timezone,
			speakers: fixture.speakers.map((speaker) => ({
				...createSpeaker(),
				name: speaker.name,
				socialPlatform: speaker.socialPlatform,
				socialHandle: speaker.socialHandle,
				twitterHandle: speaker.socialPlatform === 'twitter' ? speaker.socialHandle : '@',
				talk: speaker.talk,
				bio: speaker.bio,
				talkPoints: [...speaker.talkPoints]
			})),
			sponsors: defaultSponsors,
			registrationUrl: fixture.event.registrationUrl,
			discordUrl: fixture.event.discordUrl,
			calendarUrl: fixture.event.calendarUrl,
			logoUrl: fixture.event.logoUrl,
			includeLegacyTargets: true
		};
	}

	function applyLatestEventPayload(payload: Partial<LegacyEventData>) {
		const spec = toEventGraphicSpec(payload);
		if (!spec) return;

		const fallbackDateTime = parseISOToDateTime(spec.event.startTimeISO);
		const date = payload.date || fallbackDateTime.date;
		const time = payload.time || fallbackDateTime.time;

		formData = {
			title: spec.event.title,
			eventNumber: spec.event.number,
			date,
			time,
			timezone: payload.timezone || 'UTC',
			speakers: spec.speakers.map((speaker) => ({
				...createSpeaker(),
				name: speaker.name,
				socialPlatform:
					speaker.primarySocialPlatform === 'bluesky'
						? 'bluesky'
						: speaker.primarySocialPlatform === 'linkedin'
							? 'linkedin'
							: 'twitter',
				socialHandle:
					speaker.socials[speaker.primarySocialPlatform] ||
					speaker.socials.x ||
					speaker.socials.bluesky ||
					'',
				twitterHandle: speaker.socials.x || '@',
				profileImagePlatform: speaker.socials.bluesky ? 'bluesky' : 'twitter',
				profileImageHandle: speaker.socials.bluesky || '',
				talk: speaker.talkTitle,
				bio: speaker.bio,
				talkPoints: speaker.bullets.length > 0 ? speaker.bullets : ['', '', ''],
				image: speaker.avatarUrl
			})),
			sponsors: spec.sponsors.map(toFormSponsor),
			registrationUrl: spec.event.links.registrationUrl,
			discordUrl: spec.event.links.discordUrl,
			calendarUrl: spec.event.links.calendarUrl,
			logoUrl: spec.event.links.logoUrl || '/images/logo.png',
			includeLegacyTargets: true
		};
	}

	onMount(async () => {
		updateToLastTuesday();
		try {
			const response = await fetch('/api/latest-event');
			if (!response.ok) return;
			const latestPayload = (await response.json()) as Partial<LegacyEventData>;
			if (latestPayload?.eventNumber || latestPayload?.spec?.event?.number) {
				applyLatestEventPayload(latestPayload);
			}
		} catch (error) {
			console.error('Unable to load latest event payload:', error);
		}
	});

	const getSpeakerNodeId = (index: number): string => `speaker-card-${index}`;

	const buildAgendaFilename = (target: EventGraphicExportTarget): string => {
		switch (target.id) {
			case 'x_feed':
				return 'event-agenda.x.png';
			case 'bsky_feed':
				return 'event-agenda.bsky.jpg';
			case 'discord_feed':
				return 'event-agenda.discord.png';
			case 'legacy_event':
				return 'event-agenda.legacy-1120x630.png';
			default:
				return `event-agenda.${target.id}.${getExtensionForFormat(target.format)}`;
		}
	};

	const buildSponsorFilename = (target: EventGraphicExportTarget): string => {
		if (target.id === 'sponsor_x_feed') {
			return 'event-sponsor.x.png';
		}
		return `event-sponsor.${target.id}.${getExtensionForFormat(target.format)}`;
	};

	const buildSpeakerFilename = (target: EventGraphicExportTarget, speakerName: string): string => {
		const safeName = slugify(speakerName || 'speaker');
		switch (target.id) {
			case 'speaker_x_feed':
				return `speaker-${safeName}.x.png`;
			case 'legacy_speaker':
				return `speaker-${safeName}.legacy-800x450.png`;
			default:
				return `speaker-${safeName}.${target.id}.${getExtensionForFormat(target.format)}`;
		}
	};

	const toBlob = async (dataUrl: string): Promise<Blob> => {
		const response = await fetch(dataUrl);
		return response.blob();
	};

	const toImage = (src: string): Promise<HTMLImageElement> => {
		return new Promise((resolve, reject) => {
			const image = new Image();
			image.onload = () => resolve(image);
			image.onerror = () => reject(new Error('Unable to decode image.'));
			image.src = src;
		});
	};

	const canvasToBlob = (
		canvas: HTMLCanvasElement,
		type: string,
		quality?: number
	): Promise<Blob> => {
		return new Promise((resolve, reject) => {
			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Failed to create image blob.'));
						return;
					}
					resolve(blob);
				},
				type,
				quality
			);
		});
	};

	const convertToTargetBlob = async (
		dataUrl: string,
		target: EventGraphicExportTarget,
		fallbackBlob: Blob
	): Promise<Blob> => {
		const desiredType =
			target.format === 'jpg'
				? 'image/jpeg'
				: target.format === 'webp'
					? 'image/webp'
					: 'image/png';

		if (target.format === 'png' && (!target.maxBytes || fallbackBlob.size <= target.maxBytes)) {
			return fallbackBlob;
		}

		const image = await toImage(dataUrl);
		const canvas = document.createElement('canvas');
		canvas.width = target.width;
		canvas.height = target.height;
		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('Unable to initialize export canvas context.');
		}
		context.drawImage(image, 0, 0, target.width, target.height);

		if (desiredType === 'image/png') {
			return canvasToBlob(canvas, desiredType, 1);
		}

		const qualities = [0.92, 0.86, 0.8, 0.74, 0.68, 0.62, 0.56, 0.5, 0.45];
		let smallestBlob: Blob | null = null;

		for (const quality of qualities) {
			const candidate = await canvasToBlob(canvas, desiredType, quality);
			if (!smallestBlob || candidate.size < smallestBlob.size) {
				smallestBlob = candidate;
			}
			if (!target.maxBytes || candidate.size <= target.maxBytes) {
				return candidate;
			}
		}

		return smallestBlob || fallbackBlob;
	};

	const getImageDimensions = async (blob: Blob): Promise<{ width: number; height: number }> => {
		const objectUrl = URL.createObjectURL(blob);
		try {
			const image = await toImage(objectUrl);
			return { width: image.naturalWidth, height: image.naturalHeight };
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	};

	const getContrastWarning = async (blob: Blob): Promise<string | undefined> => {
		const objectUrl = URL.createObjectURL(blob);
		try {
			const image = await toImage(objectUrl);
			const canvas = document.createElement('canvas');
			canvas.width = Math.max(40, Math.round(image.naturalWidth / 8));
			canvas.height = Math.max(40, Math.round(image.naturalHeight / 8));
			const context = canvas.getContext('2d');
			if (!context) return 'Unable to sample image contrast.';
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			const sampledData = context.getImageData(0, 0, canvas.width, canvas.height);
			const contrast = getImageContrastStatus(sampledData.data);
			return contrast.warning;
		} finally {
			URL.revokeObjectURL(objectUrl);
		}
	};

	const checksumSha256 = async (blob: Blob): Promise<string> => {
		const buffer = await blob.arrayBuffer();
		const digest = await crypto.subtle.digest('SHA-256', buffer);
		const bytes = new Uint8Array(digest);
		return Array.from(bytes)
			.map((value) => value.toString(16).padStart(2, '0'))
			.join('');
	};

	const downloadBlob = (filename: string, blob: Blob) => {
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(() => URL.revokeObjectURL(url), 0);
	};

	const downloadText = (filename: string, content: string, contentType: string) => {
		const blob = new Blob([content], { type: contentType });
		downloadBlob(filename, blob);
	};

	const renderArtifact = async (
		element: Element,
		target: EventGraphicExportTarget,
		filename: string,
		altText: string
	): Promise<{ entry: ExportArtifactEntry; blob: Blob }> => {
		const dataUrl = await domToPng(element, {
			scale: 2,
			quality: 1,
			width: target.width,
			height: target.height
		});

		const rawBlob = await toBlob(dataUrl);
		const convertedBlob = await convertToTargetBlob(dataUrl, target, rawBlob);
		const dimensions = await getImageDimensions(convertedBlob);
		const warnings: string[] = [];

		if (dimensions.width !== target.width || dimensions.height !== target.height) {
			warnings.push(
				`Expected ${target.width}x${target.height}, got ${dimensions.width}x${dimensions.height}.`
			);
		}

		if (target.maxBytes && convertedBlob.size > target.maxBytes) {
			warnings.push(
				`Exceeded byte budget for ${target.id}: ${convertedBlob.size} > ${target.maxBytes}.`
			);
		}

		const contrastWarning = await getContrastWarning(convertedBlob);
		if (contrastWarning) {
			warnings.push(contrastWarning);
		}

		const checksum = await checksumSha256(convertedBlob);
		const isOverBudget = Boolean(target.maxBytes && convertedBlob.size > target.maxBytes);

		return {
			entry: {
				path: `exports/${filename}`,
				bytes: convertedBlob.size,
				checksumSha256: checksum,
				dimensions,
				format: target.format,
				targetId: target.id,
				template: target.template,
				scope: target.scope,
				status: isOverBudget ? 'error' : warnings.length > 0 ? 'warning' : 'ok',
				warnings,
				altText
			},
			blob: convertedBlob
		};
	};

	const buildErrorEntry = (
		target: EventGraphicExportTarget,
		filename: string,
		message: string,
		altText: string
	): ExportArtifactEntry => ({
		path: `exports/${filename}`,
		bytes: 0,
		checksumSha256: '',
		dimensions: {
			width: target.width,
			height: target.height
		},
		format: target.format,
		targetId: target.id,
		template: target.template,
		scope: target.scope,
		status: 'error',
		warnings: [message],
		altText
	});

	async function saveEventPayload(spec: EventGraphicSpec) {
		const payload = {
			...basePayload,
			spec
		} satisfies Partial<LegacyEventData>;

		const response = await fetch('/api/save-event', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			throw new Error('Failed to persist event payload.');
		}
	}

	async function handleGenerateBundle() {
		runArtifacts = [];
		runManifest = null;
		exportError = '';
		exportSuccess = '';

		if (!eventSpec) {
			exportError = 'Event spec is incomplete. Fill required fields before exporting.';
			return;
		}

		const agendaNode = document.querySelector('#agenda-preview-node');
		if (!agendaNode) {
			exportError = 'Agenda preview node is missing.';
			return;
		}
		const sponsorNode = document.querySelector('#sponsor-preview-node');

		isExporting = true;
		const artifacts: ExportArtifactEntry[] = [];

		try {
			await saveEventPayload(eventSpec);

			for (const target of eventTargets) {
				const filename = buildAgendaFilename(target);
				try {
					const rendered = await renderArtifact(
						agendaNode,
						target,
						filename,
						buildAgendaAltText(eventSpec)
					);
					artifacts.push(rendered.entry);
					downloadBlob(filename, rendered.blob);
				} catch (error) {
					artifacts.push(
						buildErrorEntry(
							target,
							filename,
							error instanceof Error ? error.message : 'Agenda export failed.',
							buildAgendaAltText(eventSpec)
						)
					);
				}
			}

			for (const target of sponsorTargets) {
				const filename = buildSponsorFilename(target);
				if (!sponsorNode) {
					artifacts.push(
						buildErrorEntry(
							target,
							filename,
							'Sponsor preview node is missing.',
							buildSponsorAltText(eventSpec)
						)
					);
					continue;
				}

				try {
					const rendered = await renderArtifact(
						sponsorNode,
						target,
						filename,
						buildSponsorAltText(eventSpec)
					);
					artifacts.push(rendered.entry);
					downloadBlob(filename, rendered.blob);
				} catch (error) {
					artifacts.push(
						buildErrorEntry(
							target,
							filename,
							error instanceof Error ? error.message : 'Sponsor export failed.',
							buildSponsorAltText(eventSpec)
						)
					);
				}
			}

			for (const [index, speaker] of eventSpec.speakers.entries()) {
				const speakerNode = document.querySelector(`#${getSpeakerNodeId(index)}`);
				if (!speakerNode) {
					for (const target of speakerTargets) {
						const missingFilename = buildSpeakerFilename(target, speaker.name);
						artifacts.push(
							buildErrorEntry(
								target,
								missingFilename,
								'Speaker preview node is missing.',
								buildSpeakerAltText(eventSpec, speaker)
							)
						);
					}
					continue;
				}

				for (const target of speakerTargets) {
					const filename = buildSpeakerFilename(target, speaker.name);
					try {
						const rendered = await renderArtifact(
							speakerNode,
							target,
							filename,
							buildSpeakerAltText(eventSpec, speaker)
						);
						artifacts.push(rendered.entry);
						downloadBlob(filename, rendered.blob);
					} catch (error) {
						artifacts.push(
							buildErrorEntry(
								target,
								filename,
								error instanceof Error ? error.message : 'Speaker export failed.',
								buildSpeakerAltText(eventSpec, speaker)
							)
						);
					}
				}
			}

			runArtifacts = artifacts;
			runManifest = buildManifest(eventSpec, artifacts);
			downloadText('manifest.json', JSON.stringify(runManifest, null, 2), 'application/json');
			downloadText('captions.md', buildCaptionsMarkdown(eventSpec), 'text/markdown');

			const warningCount = artifacts.filter((entry) => entry.status === 'warning').length;
			const errorCount = artifacts.filter((entry) => entry.status === 'error').length;
			exportSuccess = `Exported ${artifacts.length} artifacts (${warningCount} warnings, ${errorCount} errors).`;
		} catch (error) {
			exportError = error instanceof Error ? error.message : 'Failed to generate bundle.';
		} finally {
			isExporting = false;
		}
	}
</script>

<div class="container mx-auto px-4 pb-20 pt-12 text-white">
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold">Event Graphic Generator</h1>
			<p class="mt-2 text-sm text-slate-300">
				Spec-driven bundle export for X, Bluesky, Discord, and homepage sync.
			</p>
		</div>
		<div class="flex flex-wrap items-center gap-3 text-black">
			<select
				bind:value={selectedFixtureId}
				on:change={(event) => {
					const selected = (event.target as HTMLSelectElement).value;
					if (selected) applyFixture(selected);
				}}
				class="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
			>
				<option value="">Load fixture</option>
				{#each fixtures as fixture}
					<option value={fixture.id}>{fixture.label}</option>
				{/each}
			</select>
			<button
				type="button"
				on:click={resetForm}
				class="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
			>
				Reset
			</button>
		</div>
	</div>

	<form class="space-y-6 text-black" on:submit|preventDefault={handleGenerateBundle}>
		<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
			<div class="space-y-4 rounded-lg bg-white p-6 shadow-md xl:col-span-1">
				<h2 class="text-lg font-semibold">Event Details</h2>

				<div>
					<label for="event-title" class="block text-sm font-medium text-gray-700"
						>Event Title</label
					>
					<input
						id="event-title"
						type="text"
						bind:value={formData.title}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					/>
				</div>

				<div>
					<label for="event-number" class="block text-sm font-medium text-gray-700"
						>Event Number</label
					>
					<input
						id="event-number"
						type="number"
						bind:value={formData.eventNumber}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					/>
				</div>

				<div class="grid grid-cols-2 gap-3">
					<div>
						<label for="event-date" class="block text-sm font-medium text-gray-700">Date</label>
						<input
							id="event-date"
							type="date"
							bind:value={formData.date}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
						/>
					</div>
					<div>
						<label for="event-time" class="block text-sm font-medium text-gray-700">Time</label>
						<input
							id="event-time"
							type="time"
							bind:value={formData.time}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
						/>
					</div>
				</div>

				<div>
					<label for="event-timezone" class="block text-sm font-medium text-gray-700"
						>Timezone</label
					>
					<select
						id="event-timezone"
						bind:value={formData.timezone}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					>
						{#each Object.keys(tzOffsetMap) as timezone}
							<option value={timezone}>{timezone}</option>
						{/each}
					</select>
				</div>

				<p class="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
					Start ISO: <span class="font-mono">{startTimeISO || 'n/a'}</span>
				</p>
			</div>

			<div class="space-y-4 rounded-lg bg-white p-6 shadow-md xl:col-span-1">
				<h2 class="text-lg font-semibold">Links and Export Rules</h2>

				<div>
					<label for="event-join-url" class="block text-sm font-medium text-gray-700"
						>Join URL</label
					>
					<input
						id="event-join-url"
						type="url"
						bind:value={formData.registrationUrl}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					/>
				</div>

				<div>
					<label for="event-discord-url" class="block text-sm font-medium text-gray-700"
						>Discord URL</label
					>
					<input
						id="event-discord-url"
						type="url"
						bind:value={formData.discordUrl}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					/>
				</div>

				<div>
					<label for="event-calendar-url" class="block text-sm font-medium text-gray-700"
						>Calendar URL</label
					>
					<input
						id="event-calendar-url"
						type="url"
						bind:value={formData.calendarUrl}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					/>
				</div>

				<div>
					<label for="event-logo-url" class="block text-sm font-medium text-gray-700"
						>Logo URL</label
					>
					<input
						id="event-logo-url"
						type="text"
						bind:value={formData.logoUrl}
						required
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
					/>
				</div>

				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={formData.includeLegacyTargets} class="h-4 w-4" />
					Include legacy exports (1120x630 and 800x450)
				</label>

				<div class="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
					<p class="font-semibold text-gray-700">Active targets</p>
					<ul class="mt-2 space-y-1">
						{#each selectedTargets as target}
							<li>
								<span class="font-mono">{target.id}</span> - {target.width}x{target.height}
								{target.format.toUpperCase()}
								{#if target.maxBytes}
									(max {target.maxBytes.toLocaleString()} bytes)
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			</div>

			<div class="space-y-4 rounded-lg bg-white p-6 shadow-md xl:col-span-1">
				<div class="flex items-center justify-between">
					<h2 class="text-lg font-semibold">Sponsors</h2>
					<div class="flex items-center gap-2">
						<button
							type="button"
							on:click={sortSponsorsByTierAndPriority}
							class="rounded-md bg-gray-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800"
						>
							Sort
						</button>
						<button
							type="button"
							on:click={addSponsor}
							class="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90"
						>
							Add
						</button>
					</div>
				</div>

				<div class="max-h-[420px] space-y-3 overflow-y-auto pr-1">
					{#each formData.sponsors as sponsor, sponsorIndex}
						<div class="rounded-md border border-gray-200 p-3">
							<div class="mb-2 flex items-center justify-between">
								<p class="text-xs font-semibold uppercase tracking-wide text-gray-600">
									Sponsor {sponsorIndex + 1}
								</p>
								<button
									type="button"
									on:click={() => removeSponsor(sponsorIndex)}
									class="text-xs font-semibold text-red-600 hover:text-red-700">Remove</button
								>
							</div>

							<div class="space-y-2">
								<input
									type="text"
									bind:value={sponsor.name}
									placeholder="Name"
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								/>
								<div class="grid grid-cols-2 gap-2">
									<select
										bind:value={sponsor.tier}
										class="rounded-md border border-gray-300 px-3 py-2 text-sm"
									>
										<option value="Partner">Partner</option>
										<option value="Platinum">Platinum</option>
										<option value="Gold">Gold</option>
									</select>
									<input
										type="number"
										bind:value={sponsor.priority}
										placeholder="Priority"
										class="rounded-md border border-gray-300 px-3 py-2 text-sm"
									/>
								</div>
								<input
									type="url"
									bind:value={sponsor.url}
									placeholder="Sponsor URL"
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								/>
								<input
									type="text"
									bind:value={sponsor.logoLight}
									placeholder="Logo (light)"
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								/>
								<input
									type="text"
									bind:value={sponsor.logoDark}
									placeholder="Logo (dark, optional)"
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								/>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-md">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Speakers</h2>
				<button
					type="button"
					on:click={addSpeaker}
					class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
				>
					Add Speaker
				</button>
			</div>

			<div class="space-y-4">
				{#each formData.speakers as speaker, index}
					<div class="rounded-lg border border-gray-200 p-4">
						<div class="mb-3 flex items-center justify-between">
							<p class="text-sm font-semibold text-gray-700">Speaker {index + 1}</p>
							{#if formData.speakers.length > 1}
								<button
									type="button"
									on:click={() => removeSpeaker(index)}
									class="text-xs font-semibold text-red-600 hover:text-red-700">Remove</button
								>
							{/if}
						</div>

						<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
							<div class="space-y-3">
								<input
									type="text"
									bind:value={speaker.name}
									placeholder="Name"
									required
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								/>

								<div class="grid grid-cols-2 gap-2">
									<select
										bind:value={speaker.socialPlatform}
										on:change={() => handleSocialPlatformChange(index)}
										class="rounded-md border border-gray-300 px-3 py-2 text-sm"
									>
										<option value="twitter">X</option>
										<option value="bluesky">Bluesky</option>
										<option value="linkedin">LinkedIn</option>
									</select>
									<input
										type="text"
										bind:value={speaker.socialHandle}
										on:change={(event) => handleSocialHandleInput(event, index)}
										placeholder={speaker.socialPlatform === 'twitter'
											? '@username'
											: speaker.socialPlatform === 'bluesky'
												? 'handle.bsky.social'
												: 'profile'}
										class="rounded-md border border-gray-300 px-3 py-2 text-sm"
									/>
								</div>

								<div class="grid grid-cols-2 gap-2">
									<select
										bind:value={speaker.profileImagePlatform}
										on:change={() => handleSocialHandleChange(index)}
										class="rounded-md border border-gray-300 px-3 py-2 text-sm"
									>
										<option value="twitter">Image from X</option>
										<option value="bluesky">Image from Bluesky</option>
										<option value="custom">Custom URL</option>
									</select>
									{#if speaker.profileImagePlatform === 'custom'}
										<input
											type="url"
											bind:value={speaker.customImageUrl}
											on:change={() => handleSocialHandleChange(index)}
											placeholder="https://..."
											class="rounded-md border border-gray-300 px-3 py-2 text-sm"
										/>
									{:else if speaker.profileImagePlatform === 'bluesky'}
										<input
											type="text"
											bind:value={speaker.profileImageHandle}
											on:change={() => handleSocialHandleChange(index)}
											placeholder="Bluesky handle"
											class="rounded-md border border-gray-300 px-3 py-2 text-sm"
										/>
									{:else}
										<input
											type="text"
											bind:value={speaker.twitterHandle}
											on:change={() => handleSocialHandleChange(index)}
											placeholder="@username"
											class="rounded-md border border-gray-300 px-3 py-2 text-sm"
										/>
									{/if}
								</div>

								{#if speaker.error}
									<p class="text-xs text-red-600">{speaker.error}</p>
								{/if}
							</div>

							<div class="space-y-3">
								<input
									type="text"
									bind:value={speaker.talk}
									placeholder="Talk title"
									required
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								/>
								<textarea
									bind:value={speaker.bio}
									rows="3"
									placeholder="Speaker bio"
									class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
								></textarea>
								{#each speaker.talkPoints as _, pointIndex}
									<input
										type="text"
										bind:value={speaker.talkPoints[pointIndex]}
										placeholder={`Talk point ${pointIndex + 1}`}
										class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
									/>
								{/each}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<button
				type="submit"
				disabled={isExporting}
				class="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isExporting ? 'Generating bundle...' : 'Generate Full Bundle'}
			</button>
			<span class="text-sm text-slate-300">
				Exports agenda + sponsor + speaker assets + manifest + captions in one run.
			</span>
		</div>
	</form>

	{#if exportError}
		<div
			class="mt-4 rounded-md border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200"
		>
			{exportError}
		</div>
	{/if}

	{#if exportSuccess}
		<div
			class="mt-4 rounded-md border border-green-500/50 bg-green-500/10 px-4 py-3 text-sm text-green-200"
		>
			{exportSuccess}
		</div>
	{/if}

	<div class="mt-10 space-y-10">
		<div>
			<div class="mb-3 flex items-center justify-between gap-2">
				<h2 class="text-xl font-semibold">Agenda Preview</h2>
				<div class="flex flex-wrap gap-2">
					{#each eventTargets as target}
						<button
							type="button"
							on:click={() => (previewEventTargetId = target.id)}
							class={`rounded-md px-3 py-1.5 text-xs font-semibold ${previewEventTargetId === target.id ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
						>
							{target.id}
						</button>
					{/each}
				</div>
			</div>

			<div class="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/70 p-5">
				<div
					id="agenda-preview-node"
					class="origin-top-left"
					style={`width: ${previewEventTarget.width}px; min-width: ${previewEventTarget.width}px; height: ${previewEventTarget.height}px; min-height: ${previewEventTarget.height}px;`}
				>
					<EventGraphic {eventSpec} renderTarget={previewEventTarget.id} />
				</div>
			</div>
		</div>

		<div>
			<div class="mb-3 flex items-center justify-between gap-2">
				<h2 class="text-xl font-semibold">Sponsor Companion Preview</h2>
				<div class="flex flex-wrap gap-2">
					{#each sponsorTargets as target}
						<button
							type="button"
							on:click={() => (previewSponsorTargetId = target.id)}
							class={`rounded-md px-3 py-1.5 text-xs font-semibold ${previewSponsorTargetId === target.id ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
						>
							{target.id}
						</button>
					{/each}
				</div>
			</div>

			<div class="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/70 p-5">
				<div
					id="sponsor-preview-node"
					class="origin-top-left"
					style={`width: ${previewSponsorTarget.width}px; min-width: ${previewSponsorTarget.width}px; height: ${previewSponsorTarget.height}px; min-height: ${previewSponsorTarget.height}px;`}
				>
					<SponsorCard {eventSpec} />
				</div>
			</div>
		</div>

		<div>
			<div class="mb-3 flex items-center justify-between gap-2">
				<h2 class="text-xl font-semibold">Speaker Spotlight Preview</h2>
				<div class="flex flex-wrap gap-2">
					{#each speakerTargets as target}
						<button
							type="button"
							on:click={() => (previewSpeakerTargetId = target.id)}
							class={`rounded-md px-3 py-1.5 text-xs font-semibold ${previewSpeakerTargetId === target.id ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
						>
							{target.id}
						</button>
					{/each}
				</div>
			</div>

			<div class="space-y-6">
				{#if eventSpec}
					{#each eventSpec.speakers as speaker, index}
						<div class="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/70 p-5">
							<p class="mb-3 text-sm font-semibold text-slate-200">
								{speaker.name || `Speaker ${index + 1}`}
							</p>
							<div
								id={getSpeakerNodeId(index)}
								class="origin-top-left"
								style={`width: ${previewSpeakerTarget.width}px; min-width: ${previewSpeakerTarget.width}px; height: ${previewSpeakerTarget.height}px; min-height: ${previewSpeakerTarget.height}px;`}
							>
								<SpeakerCard {eventSpec} {speaker} />
							</div>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	{#if runArtifacts.length > 0}
		<div class="mt-10 rounded-lg border border-slate-700 bg-slate-900/60 p-5">
			<h2 class="mb-3 text-lg font-semibold">Last Run Summary</h2>
			<div class="overflow-x-auto">
				<table class="min-w-full text-left text-xs">
					<thead class="border-b border-slate-700 text-slate-300">
						<tr>
							<th class="px-2 py-2">Path</th>
							<th class="px-2 py-2">Status</th>
							<th class="px-2 py-2">Bytes</th>
							<th class="px-2 py-2">Target</th>
							<th class="px-2 py-2">Warnings</th>
						</tr>
					</thead>
					<tbody>
						{#each runArtifacts as artifact}
							<tr class="border-b border-slate-800 align-top">
								<td class="px-2 py-2 font-mono text-slate-200">{artifact.path}</td>
								<td class="px-2 py-2">
									<span
										class={`rounded px-2 py-1 text-[10px] font-semibold uppercase ${artifact.status === 'ok' ? 'bg-green-500/20 text-green-300' : artifact.status === 'warning' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-red-500/20 text-red-300'}`}
										>{artifact.status}</span
									>
								</td>
								<td class="px-2 py-2 text-slate-200">{artifact.bytes.toLocaleString()}</td>
								<td class="px-2 py-2 text-slate-300">{artifact.targetId}</td>
								<td class="px-2 py-2 text-slate-300">
									{#if artifact.warnings.length > 0}
										{artifact.warnings.join(' | ')}
									{:else}
										-
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if runManifest}
				<p class="mt-3 text-xs text-slate-400">
					Manifest generated at {runManifest.generatedAtISO}
				</p>
			{/if}
		</div>
	{/if}
</div>
