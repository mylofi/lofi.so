<script lang="ts">
	import { domToPng } from 'modern-screenshot';
	import { invalidateAll } from '$app/navigation';
	import { onMount, tick } from 'svelte';
	import EventGraphic from '$lib/components/EventGraphic.svelte';
	import SpeakerCard from '$lib/components/SpeakerCard.svelte';
	import { buildStartTimeISO, tzOffsetMap } from '$lib/utils/date';
	import fixturesData from '$lib/data/event-graphic-fixtures.json';
	import type {
		EventGraphicExportTarget,
		EventGraphicExportTargetId,
		EventGraphicSpec,
		ExportArtifactEntry,
		LegacyEventData
	} from '$lib/types/event-graphic';
	import {
		buildAgendaAltText,
		buildCaptionsMarkdown,
		buildManifest,
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
	type PreviewScope = 'all' | 'announcement' | 'agenda';
	const previewScopeOptions: PreviewScope[] = ['all', 'announcement', 'agenda'];

	interface SpeakerFormData {
		name: string;
		socialPlatform: SocialPlatform;
		socialHandle: string;
		twitterHandle: string;
		blueskyHandle: string;
		profileImagePlatform: ProfileImagePlatform;
		profileImageHandle: string;
		customImageUrl: string;
		talk: string;
		bio: string;
		talkPoints: string[];
		image: string;
		error: string;
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
		socialHandle: '',
		twitterHandle: '',
		blueskyHandle: '',
		profileImagePlatform: 'twitter',
		profileImageHandle: '',
		customImageUrl: '',
		talk: '',
		bio: '',
		talkPoints: ['', '', ''],
		image: '',
		error: ''
	});

	const defaultSponsors = normalizeSponsors(undefined);

	let formData: {
		title: string;
		eventNumber: number;
		date: string;
		time: string;
		timezone: string;
		speakers: SpeakerFormData[];
		registrationUrl: string;
		discordUrl: string;
		calendarUrl: string;
		logoUrl: string;
	} = {
		title: 'Watch Party',
		eventNumber: 1,
		date: getLastTuesdayOfMonth(),
		time: '08:00',
		timezone: 'PST',
		speakers: [createSpeaker()],
		registrationUrl: 'https://lofi.so',
		discordUrl: 'https://discord.gg/ZRrwZxn4rW',
		calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
		logoUrl: '/images/logo.png'
	};

	let isExporting = false;
	let isExportingSpeakersOnly = false;
	let isSaving = false;
	let exportError = '';
	let exportSuccess = '';
	let runManifest: ReturnType<typeof buildManifest> | null = null;
	let runArtifacts: ExportArtifactEntry[] = [];
	let selectedTargetIds: EventGraphicExportTargetId[] = [];
	let hasInitializedTargetSelection = false;
	let previewScope: PreviewScope = 'all';
	let previewAnnouncementTargetId: EventGraphicExportTargetId = 'announcement_regular';
	let previewAgendaTargetId: EventGraphicExportTargetId = 'agenda_regular';
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
			blueskyHandle: speaker.blueskyHandle,
			talk: speaker.talk,
			bio: speaker.bio,
			talkPoints: speaker.talkPoints,
			image: speaker.image
		})),
		sponsors: defaultSponsors,
		registrationUrl: formData.registrationUrl,
		discordUrl: formData.discordUrl,
		calendarUrl: formData.calendarUrl,
		logoUrl: formData.logoUrl
	} satisfies Partial<LegacyEventData>;

	$: eventSpec = toEventGraphicSpec(basePayload);
	$: allTargets = eventSpec?.exports || DEFAULT_EXPORT_TARGETS;
	$: availableTargets = allTargets;
	$: if (!hasInitializedTargetSelection && availableTargets.length > 0) {
		selectedTargetIds = availableTargets.map((target) => target.id);
		hasInitializedTargetSelection = true;
	}
	$: if (hasInitializedTargetSelection) {
		const validSelection = selectedTargetIds.filter((selectedId) =>
			availableTargets.some((target) => target.id === selectedId)
		);
		if (!areTargetIdsEqual(validSelection, selectedTargetIds)) {
			selectedTargetIds = validSelection;
		}
	}
	$: selectedTargets = availableTargets.filter((target) => selectedTargetIds.includes(target.id));
	$: announcementTargets = selectedTargets.filter(
		(target) => target.scope === 'announcement' || target.scope === 'event'
	);
	$: agendaTargets = selectedTargets.filter(
		(target) => target.scope === 'agenda' || target.scope === 'speaker'
	);
	$: showAnnouncementPreview = previewScope === 'all' || previewScope === 'announcement';
	$: showAgendaPreview = previewScope === 'all' || previewScope === 'agenda';
	$: previewAnnouncementTarget =
		announcementTargets.find((target) => target.id === previewAnnouncementTargetId) ||
		announcementTargets[0] ||
		DEFAULT_EXPORT_TARGETS[0];
	$: previewAgendaTarget =
		agendaTargets.find((target) => target.id === previewAgendaTargetId) ||
		agendaTargets[0] ||
		DEFAULT_EXPORT_TARGETS.find((target) => target.id === 'agenda_regular') ||
		DEFAULT_EXPORT_TARGETS[0];

	$: if (
		!announcementTargets.find((target) => target.id === previewAnnouncementTargetId) &&
		announcementTargets[0]
	) {
		previewAnnouncementTargetId = announcementTargets[0].id;
	}

	$: if (!agendaTargets.find((target) => target.id === previewAgendaTargetId) && agendaTargets[0]) {
		previewAgendaTargetId = agendaTargets[0].id;
	}

	const areTargetIdsEqual = (
		left: EventGraphicExportTargetId[],
		right: EventGraphicExportTargetId[]
	): boolean => {
		if (left.length !== right.length) return false;
		return left.every((value, index) => value === right[index]);
	};

	const toggleExportTarget = (targetId: EventGraphicExportTargetId) => {
		if (selectedTargetIds.includes(targetId)) {
			selectedTargetIds = selectedTargetIds.filter((id) => id !== targetId);
			return;
		}
		selectedTargetIds = [...selectedTargetIds, targetId];
	};

	const selectAllExportTargets = () => {
		selectedTargetIds = availableTargets.map((target) => target.id);
	};

	const clearExportTargets = () => {
		selectedTargetIds = [];
	};

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
			registrationUrl: 'https://lofi.so',
			discordUrl: 'https://discord.gg/ZRrwZxn4rW',
			calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
			logoUrl: '/images/logo.png'
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

	const normalizeXHandle = (value: string): string => {
		const stripped = value
			.trim()
			.replace(/^https?:\/\/(www\.)?x\.com\//i, '')
			.replace(/^@+/, '');
		return stripped ? `@${stripped}` : '';
	};

	const normalizeBlueskyHandle = (value: string): string => {
		return value
			.trim()
			.replace(/^https?:\/\/(www\.)?bsky\.app\/profile\//i, '')
			.replace(/^@+/, '');
	};

	function handleSocialHandleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		const platform = formData.speakers[index].socialPlatform;
		let value = input.value.trim();
		if (platform === 'twitter') value = normalizeXHandle(value);
		if (platform === 'bluesky') value = normalizeBlueskyHandle(value);

		formData.speakers[index].socialHandle = value;
		if (platform === 'twitter') {
			formData.speakers[index].twitterHandle = value;
		}
		if (platform === 'bluesky') {
			formData.speakers[index].blueskyHandle = value;
		}
		formData = { ...formData };
		handleSocialHandleChange(index);
	}

	function handleSpeakerNetworkHandleInput(
		index: number,
		platform: 'twitter' | 'bluesky',
		event: Event
	) {
		const input = event.target as HTMLInputElement;
		const speaker = formData.speakers[index];
		const value =
			platform === 'twitter' ? normalizeXHandle(input.value) : normalizeBlueskyHandle(input.value);

		if (platform === 'twitter') {
			speaker.twitterHandle = value;
		} else {
			speaker.blueskyHandle = value;
			if (!speaker.profileImageHandle) {
				speaker.profileImageHandle = value;
			}
		}

		if (speaker.socialPlatform === platform) {
			speaker.socialHandle = value;
		}

		formData = { ...formData };
		handleSocialHandleChange(index);
	}

	function handleSocialPlatformChange(index: number) {
		const speaker = formData.speakers[index];
		if (speaker.socialPlatform === 'twitter') {
			speaker.socialHandle = speaker.twitterHandle || normalizeXHandle(speaker.socialHandle);
			speaker.twitterHandle = speaker.socialHandle;
		} else if (speaker.socialPlatform === 'bluesky') {
			speaker.socialHandle = speaker.blueskyHandle || normalizeBlueskyHandle(speaker.socialHandle);
			speaker.blueskyHandle = speaker.socialHandle;
			if (!speaker.profileImageHandle) {
				speaker.profileImageHandle = speaker.socialHandle;
			}
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
				? speaker.profileImageHandle || speaker.blueskyHandle || speaker.socialHandle
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
				socialHandle:
					speaker.socialPlatform === 'twitter'
						? normalizeXHandle(speaker.socialHandle)
						: speaker.socialPlatform === 'bluesky'
							? normalizeBlueskyHandle(speaker.socialHandle)
							: speaker.socialHandle,
				twitterHandle:
					speaker.socialPlatform === 'twitter' ? normalizeXHandle(speaker.socialHandle) : '',
				blueskyHandle:
					speaker.socialPlatform === 'bluesky' ? normalizeBlueskyHandle(speaker.socialHandle) : '',
				talk: speaker.talk,
				bio: speaker.bio,
				talkPoints: [...speaker.talkPoints]
			})),
			registrationUrl: fixture.event.registrationUrl,
			discordUrl: fixture.event.discordUrl,
			calendarUrl: fixture.event.calendarUrl,
			logoUrl: fixture.event.logoUrl
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
				twitterHandle: speaker.socials.x || '',
				blueskyHandle: speaker.socials.bluesky || '',
				profileImagePlatform: speaker.socials.bluesky ? 'bluesky' : 'twitter',
				profileImageHandle: speaker.socials.bluesky || '',
				talk: speaker.talkTitle,
				bio: speaker.bio,
				talkPoints: speaker.bullets.length > 0 ? speaker.bullets : ['', '', ''],
				image: speaker.avatarUrl
			})),
			registrationUrl: spec.event.links.registrationUrl,
			discordUrl: spec.event.links.discordUrl,
			calendarUrl: spec.event.links.calendarUrl,
			logoUrl: spec.event.links.logoUrl || '/images/logo.png'
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

	const buildAnnouncementFilename = (target: EventGraphicExportTarget): string => {
		switch (target.id) {
			case 'announcement_regular':
				return 'announcement.regular.jpg';
			case 'announcement_discord':
				return 'announcement.discord-800x320.png';
			default:
				return `announcement.${target.id}.${getExtensionForFormat(target.format)}`;
		}
	};

	const buildSpeakerFilename = (target: EventGraphicExportTarget, speakerName: string): string => {
		const safeName = slugify(speakerName || 'speaker');
		switch (target.id) {
			case 'agenda_regular':
				return `agenda-${safeName}.regular.png`;
			default:
				return `agenda-${safeName}.${target.id}.${getExtensionForFormat(target.format)}`;
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

	async function handleDownloadAnnouncementPreview() {
		exportError = '';
		exportSuccess = '';

		if (!eventSpec) {
			exportError = 'Event spec is incomplete. Fill required fields before downloading.';
			return;
		}

		const announcementNode = document.querySelector('#announcement-preview-node');
		if (!announcementNode) {
			exportError = 'Announcement preview node is missing.';
			return;
		}

		try {
			const filename = buildAnnouncementFilename(previewAnnouncementTarget);
			const rendered = await renderArtifact(
				announcementNode,
				previewAnnouncementTarget,
				filename,
				buildAgendaAltText(eventSpec)
			);
			downloadBlob(filename, rendered.blob);
			exportSuccess = `Downloaded ${filename}.`;
		} catch (error) {
			exportError =
				error instanceof Error ? error.message : 'Failed to download selected announcement output.';
		}
	}

	async function handleDownloadAgendaSpeaker(index: number) {
		exportError = '';
		exportSuccess = '';

		if (!eventSpec) {
			exportError = 'Event spec is incomplete. Fill required fields before downloading.';
			return;
		}

		const speaker = eventSpec.speakers[index];
		if (!speaker) {
			exportError = 'Speaker preview is not available.';
			return;
		}

		const speakerNode = document.querySelector(`#${getSpeakerNodeId(index)}`);
		if (!speakerNode) {
			exportError = 'Speaker preview node is missing.';
			return;
		}

		try {
			const filename = buildSpeakerFilename(previewAgendaTarget, speaker.name);
			const rendered = await renderArtifact(
				speakerNode,
				previewAgendaTarget,
				filename,
				buildSpeakerAltText(eventSpec, speaker)
			);
			downloadBlob(filename, rendered.blob);
			exportSuccess = `Downloaded ${filename}.`;
		} catch (error) {
			exportError =
				error instanceof Error ? error.message : 'Failed to download selected agenda output.';
		}
	}

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

	async function handleSaveEvent() {
		exportError = '';
		exportSuccess = '';

		if (!eventSpec) {
			exportError = 'Event spec is incomplete. Fill required fields before saving.';
			return;
		}

		isSaving = true;
		try {
			await saveEventPayload(eventSpec);
			await invalidateAll();
			exportSuccess = 'Saved event to KV. Homepage data has been refreshed.';
		} catch (error) {
			exportError = error instanceof Error ? error.message : 'Failed to save event payload.';
		} finally {
			isSaving = false;
		}
	}

	async function exportSpeakerArtifacts(
		spec: EventGraphicSpec,
		targets: EventGraphicExportTarget[],
		artifacts: ExportArtifactEntry[]
	) {
		for (const [index, speaker] of spec.speakers.entries()) {
			const speakerNode = document.querySelector(`#${getSpeakerNodeId(index)}`);
			if (!speakerNode) {
				for (const target of targets) {
					const missingFilename = buildSpeakerFilename(target, speaker.name);
					artifacts.push(
						buildErrorEntry(
							target,
							missingFilename,
							'Speaker preview node is missing.',
							buildSpeakerAltText(spec, speaker)
						)
					);
				}
				continue;
			}

			for (const target of targets) {
				const filename = buildSpeakerFilename(target, speaker.name);
				try {
					const rendered = await renderArtifact(
						speakerNode,
						target,
						filename,
						buildSpeakerAltText(spec, speaker)
					);
					artifacts.push(rendered.entry);
					downloadBlob(filename, rendered.blob);
				} catch (error) {
					artifacts.push(
						buildErrorEntry(
							target,
							filename,
							error instanceof Error ? error.message : 'Speaker export failed.',
							buildSpeakerAltText(spec, speaker)
						)
					);
				}
			}
		}
	}

	async function handleGenerateSpeakerGraphics() {
		runArtifacts = [];
		runManifest = null;
		exportError = '';
		exportSuccess = '';

		if (!eventSpec) {
			exportError = 'Event spec is incomplete. Fill required fields before exporting.';
			return;
		}

		if (agendaTargets.length === 0) {
			exportError = 'Select at least one agenda export target before generating speaker graphics.';
			return;
		}

		const previousPreviewScope = previewScope;
		previewScope = 'all';
		await tick();

		isExporting = true;
		isExportingSpeakersOnly = true;
		const artifacts: ExportArtifactEntry[] = [];

		try {
			await saveEventPayload(eventSpec);
			await exportSpeakerArtifacts(eventSpec, agendaTargets, artifacts);

			runArtifacts = artifacts;
			runManifest = buildManifest(eventSpec, artifacts);
			downloadText('manifest.json', JSON.stringify(runManifest, null, 2), 'application/json');
			downloadText('captions.md', buildCaptionsMarkdown(eventSpec), 'text/markdown');

			const warningCount = artifacts.filter((entry) => entry.status === 'warning').length;
			const errorCount = artifacts.filter((entry) => entry.status === 'error').length;
			exportSuccess = `Exported ${artifacts.length} agenda speaker artifacts (${warningCount} warnings, ${errorCount} errors).`;
		} catch (error) {
			exportError = error instanceof Error ? error.message : 'Failed to generate speaker graphics.';
		} finally {
			previewScope = previousPreviewScope;
			isExporting = false;
			isExportingSpeakersOnly = false;
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

		if (selectedTargets.length === 0) {
			exportError = 'Select at least one export target before generating a bundle.';
			return;
		}

		const previousPreviewScope = previewScope;
		previewScope = 'all';
		await tick();

		const announcementNode = announcementTargets.length
			? document.querySelector('#announcement-preview-node')
			: null;
		if (announcementTargets.length > 0 && !announcementNode) {
			exportError = 'Announcement preview node is missing.';
			previewScope = previousPreviewScope;
			return;
		}

		isExporting = true;
		const artifacts: ExportArtifactEntry[] = [];

		try {
			await saveEventPayload(eventSpec);

			for (const target of announcementTargets) {
				const filename = buildAnnouncementFilename(target);
				try {
					const rendered = await renderArtifact(
						announcementNode as Element,
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
							error instanceof Error ? error.message : 'Announcement export failed.',
							buildAgendaAltText(eventSpec)
						)
					);
				}
			}

			await exportSpeakerArtifacts(eventSpec, agendaTargets, artifacts);

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
			previewScope = previousPreviewScope;
			isExporting = false;
			isExportingSpeakersOnly = false;
		}
	}
</script>

<div class="container mx-auto px-4 pb-20 pt-12 text-white">
	<div class="mb-8 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold">Event Graphic Generator</h1>
			<p class="mt-2 text-sm text-slate-300">
				Spec-driven bundle export for announcement and agenda outputs with homepage sync.
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
		<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
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
				<h2 class="text-lg font-semibold">Links</h2>

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
									<input
										type="text"
										bind:value={speaker.twitterHandle}
										on:change={(event) => handleSpeakerNetworkHandleInput(index, 'twitter', event)}
										placeholder="X handle (@username)"
										class="rounded-md border border-gray-300 px-3 py-2 text-sm"
									/>
									<input
										type="text"
										bind:value={speaker.blueskyHandle}
										on:change={(event) => handleSpeakerNetworkHandleInput(index, 'bluesky', event)}
										placeholder="Bluesky handle"
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
											on:change={(event) =>
												handleSpeakerNetworkHandleInput(index, 'twitter', event)}
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
				type="button"
				on:click={handleSaveEvent}
				disabled={isSaving || isExporting}
				class="rounded-md bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isSaving ? 'Saving...' : 'Save Event'}
			</button>
			<button
				type="button"
				on:click={handleGenerateSpeakerGraphics}
				disabled={isExporting || isSaving || agendaTargets.length === 0}
				class="rounded-md bg-discord px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-discord/90 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isExportingSpeakersOnly ? 'Generating agenda...' : 'Generate Agenda Graphics'}
			</button>
			<button
				type="submit"
				disabled={isExporting || isSaving || selectedTargets.length === 0}
				class="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isExporting ? 'Generating bundle...' : 'Generate Full Bundle'}
			</button>
			<span class="text-sm text-slate-300">
				Exports announcement + agenda assets + manifest + captions in one run.
			</span>
		</div>

		<div class="rounded-lg border border-slate-700 bg-slate-900/60 p-5 text-slate-100">
			<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
				<h2 class="text-lg font-semibold">Generation Settings</h2>
			</div>

			<p
				class="mb-4 rounded-md border border-slate-600 bg-slate-800/70 px-3 py-2 text-xs text-slate-300"
			>
				Sponsors are loaded from <span class="font-mono">src/lib/data/sponsors.json</span>.
			</p>

			<details
				class="rounded-md border border-slate-600 bg-slate-800/70 p-3 text-xs text-slate-200"
			>
				<summary class="cursor-pointer text-sm font-semibold text-slate-100">
					Choose export formats ({selectedTargetIds.length}/{availableTargets.length} selected)
				</summary>
				<div class="mt-3 space-y-3">
					<div class="flex flex-wrap gap-2">
						<button
							type="button"
							on:click={selectAllExportTargets}
							class="rounded-md border border-slate-500 bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-100 hover:bg-slate-600"
						>
							Select all
						</button>
						<button
							type="button"
							on:click={clearExportTargets}
							class="rounded-md border border-slate-500 bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-slate-100 hover:bg-slate-600"
						>
							Clear
						</button>
					</div>

					<div class="space-y-2">
						{#each availableTargets as target}
							<label
								class="flex cursor-pointer items-start gap-2 rounded border border-slate-600 bg-slate-800 p-2"
							>
								<input
									type="checkbox"
									checked={selectedTargetIds.includes(target.id)}
									on:change={() => toggleExportTarget(target.id)}
									class="mt-0.5 h-3.5 w-3.5"
								/>
								<span class="min-w-0">
									<span class="block font-mono text-[11px] text-slate-100">{target.id}</span>
									<span class="block text-[11px] text-slate-300">
										{target.width}x{target.height}
										{target.format.toUpperCase()}
										{#if target.maxBytes}
											(max {target.maxBytes.toLocaleString()} bytes)
										{/if}
									</span>
								</span>
							</label>
						{/each}
					</div>
				</div>
			</details>

			<div
				class="mt-3 rounded-md border border-slate-600 bg-slate-800/70 p-3 text-xs text-slate-300"
			>
				<p class="font-semibold text-slate-100">Active targets</p>
				<ul class="mt-2 space-y-1">
					{#if selectedTargets.length > 0}
						{#each selectedTargets as target}
							<li>
								<span class="font-mono">{target.id}</span> - {target.width}x{target.height}
								{target.format.toUpperCase()}
								{#if target.maxBytes}
									(max {target.maxBytes.toLocaleString()} bytes)
								{/if}
							</li>
						{/each}
					{:else}
						<li class="text-red-300">No export targets selected.</li>
					{/if}
				</ul>
			</div>
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
		<div class="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
			<div class="mb-2 flex flex-wrap items-center justify-between gap-2">
				<h2 class="text-sm font-semibold uppercase tracking-wide text-slate-200">Preview Scope</h2>
				<span class="text-xs text-slate-400">Default: all outputs</span>
			</div>
			<div class="flex flex-wrap gap-2">
				{#each previewScopeOptions as scope}
					<button
						type="button"
						on:click={() => (previewScope = scope)}
						class={`rounded-md px-3 py-1.5 text-xs font-semibold ${previewScope === scope ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
					>
						{scope === 'all' ? 'all outputs' : `${scope} only`}
					</button>
				{/each}
			</div>
			{#if selectedTargets.length === 0}
				<p class="mt-2 text-xs text-red-300">
					No outputs selected. Choose at least one format to render previews and exports.
				</p>
			{/if}
		</div>

		{#if showAnnouncementPreview && announcementTargets.length > 0}
			<div>
				<div class="mb-3 flex items-center justify-between gap-2">
					<h2 class="text-xl font-semibold">Announcement Preview</h2>
					<div class="flex flex-wrap items-center gap-2">
						{#each announcementTargets as target}
							<button
								type="button"
								on:click={() => (previewAnnouncementTargetId = target.id)}
								class={`rounded-md px-3 py-1.5 text-xs font-semibold ${previewAnnouncementTargetId === target.id ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
							>
								{target.id}
							</button>
						{/each}
						<button
							type="button"
							on:click={handleDownloadAnnouncementPreview}
							class="rounded-md border border-green-400/50 bg-green-500/20 px-3 py-1.5 text-xs font-semibold text-green-200 hover:bg-green-500/30"
						>
							Download selected
						</button>
					</div>
				</div>

				<div class="overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/70 p-5">
					<div
						id="announcement-preview-node"
						class="origin-top-left"
						style={`width: ${previewAnnouncementTarget.width}px; min-width: ${previewAnnouncementTarget.width}px; height: ${previewAnnouncementTarget.height}px; min-height: ${previewAnnouncementTarget.height}px;`}
					>
						<EventGraphic {eventSpec} renderTarget={previewAnnouncementTarget.id} />
					</div>
				</div>
			</div>
		{/if}

		{#if showAgendaPreview && agendaTargets.length > 0}
			<div>
				<div class="mb-3 flex items-center justify-between gap-2">
					<h2 class="text-xl font-semibold">Agenda Preview</h2>
					<div class="flex flex-wrap gap-2">
						{#each agendaTargets as target}
							<button
								type="button"
								on:click={() => (previewAgendaTargetId = target.id)}
								class={`rounded-md px-3 py-1.5 text-xs font-semibold ${previewAgendaTargetId === target.id ? 'bg-primary text-white' : 'bg-white/20 text-white hover:bg-white/30'}`}
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
								<div class="mb-3 flex items-center justify-between gap-3">
									<p class="text-sm font-semibold text-slate-200">
										{speaker.name || `Speaker ${index + 1}`}
									</p>
									<button
										type="button"
										on:click={() => handleDownloadAgendaSpeaker(index)}
										class="rounded-md border border-green-400/50 bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-200 hover:bg-green-500/30"
									>
										Download
									</button>
								</div>
								<div
									id={getSpeakerNodeId(index)}
									class="origin-top-left"
									style={`width: ${previewAgendaTarget.width}px; min-width: ${previewAgendaTarget.width}px; height: ${previewAgendaTarget.height}px; min-height: ${previewAgendaTarget.height}px;`}
								>
									<SpeakerCard {eventSpec} {speaker} />
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		{/if}
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
