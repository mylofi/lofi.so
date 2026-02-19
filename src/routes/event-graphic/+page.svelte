<script lang="ts">
	import { domToPng } from 'modern-screenshot';
	import EventGraphic from '$lib/components/EventGraphic.svelte';
	import SpeakerCard from '$lib/components/SpeakerCard.svelte';
	import SponsorCard from '$lib/components/SponsorCard.svelte';
	import { buildStartTimeISO, tzOffsetMap } from '$lib/utils/date';
	import { toEventGraphicSpec, getExportPresets, getLegacyExportPresets } from '$lib/utils/event-graphic-spec';
	import {
		captureTarget,
		validateExport,
		generateFilename,
		buildManifest,
		buildCaptions,
		bundleExports
	} from '$lib/utils/event-graphic-export';
	import type { EventGraphicSpec, EventGraphicExportTarget, ExportTargetId } from '$lib/types/event-graphic';
	import type { ExportResult } from '$lib/utils/event-graphic-export';
	import sponsorsData from '$lib/data/sponsors.json';
	import fixtureData from '$lib/data/event-graphic-fixtures.json';
	import { onMount } from 'svelte';

	function getLastTuesdayOfMonth() {
		const today = new Date();
		const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

		while (lastDayOfMonth.getDay() !== 2) {
			lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);
		}

		return lastDayOfMonth.toISOString().split('T')[0];
	}

	const lastTuesday = getLastTuesdayOfMonth();

	let formData = {
		title: 'Watch Party',
		eventNumber: 1,
		date: lastTuesday,
		time: '08:00',
		timezone: 'PST',
		speakers: [
			{
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
			}
		],
		registrationUrl: 'https://lofi.so',
		discordUrl: 'https://discord.gg/ZRrwZxn4rW',
		calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
		logoUrl: '/images/logo.png'
	};

	$: startTimeISO = formData.date && formData.time
		? new Date(buildStartTimeISO(formData.date, formData.time, formData.timezone)).toISOString()
		: '';

	// Derive EventGraphicSpec reactively from form data
	$: spec = toEventGraphicSpec(
		{
			eventNumber: formData.eventNumber,
			title: formData.title,
			startTimeISO,
			date: formData.date,
			time: formData.time,
			timezone: formData.timezone,
			speakers: formData.speakers.map((s) => ({
				name: s.name,
				twitterHandle: s.socialPlatform === 'twitter' ? s.socialHandle : s.twitterHandle,
				talk: s.talk,
				image: s.image
			})),
			registrationUrl: formData.registrationUrl,
			discordUrl: formData.discordUrl,
			calendarUrl: formData.calendarUrl,
			logoUrl: formData.logoUrl
		},
		formData.speakers as any,
		sponsorsData.sponsors
	) as EventGraphicSpec;

	// Export state
	let exportTargets = getExportPresets();
	let enabledTargets: Record<ExportTargetId, boolean> = {
		announcement_regular: true,
		announcement_discord: true,
		agenda_regular: true
	};
	let isExporting = false;
	let exportResults: ExportResult[] = [];
	let exportError = '';

	// Preview target selector
	let activePreviewTarget: ExportTargetId = 'announcement_regular';
	$: previewTarget = exportTargets.find((t) => t.id === activePreviewTarget) || exportTargets[0];

	// Update the date when the month changes
	function updateToLastTuesday() {
		formData.date = getLastTuesdayOfMonth();
		formData = { ...formData };
	}

	function handleTwitterHandleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		let value = input.value;

		if (!value.startsWith('@')) {
			value = '@' + value;
		}

		formData.speakers[index].twitterHandle = value;
		formData = { ...formData };

		handleSocialHandleChange(index);
	}

	function handleSocialHandleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		let value = input.value;
		const platform = formData.speakers[index].socialPlatform;

		if (platform === 'twitter' && !value.startsWith('@')) {
			value = '@' + value;
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
		const platform = speaker.socialPlatform;

		if (platform === 'twitter' || platform === 'bluesky') {
			speaker.profileImagePlatform = platform;
		} else if (platform === 'linkedin') {
			speaker.profileImagePlatform = 'twitter';
		}

		if (platform === 'twitter' && !speaker.socialHandle.startsWith('@')) {
			speaker.socialHandle = '@' + speaker.socialHandle;
		}

		formData = { ...formData };

		handleSocialHandleChange(index);
	}

	onMount(async () => {
		updateToLastTuesday();

		try {
			const response = await fetch('/api/latest-event');
			if (response.ok) {
				const eventData = await response.json();
				if (eventData && eventData.eventNumber) {
					formData = {
						title: eventData.title || 'Watch Party',
						eventNumber: eventData.eventNumber || 1,
						date: eventData.date || formData.date,
						time: eventData.time || '08:00',
						timezone: eventData.timezone || 'PST',
						speakers: eventData.speakers?.map((s: any) => ({
							name: s.name || '',
							socialPlatform: 'twitter',
							socialHandle: s.twitterHandle || '@',
							twitterHandle: s.twitterHandle || '@',
							profileImagePlatform: 'twitter',
							profileImageHandle: '',
							customImageUrl: '',
							talk: s.talk || '',
							bio: s.bio || '',
							talkPoints: s.talkPoints || ['', '', ''],
							image: s.image || '',
							error: ''
						})) || formData.speakers,
						registrationUrl: eventData.registrationUrl || 'https://lofi.so',
						discordUrl: eventData.discordUrl || 'https://discord.gg/ZRrwZxn4rW',
						calendarUrl: eventData.calendarUrl || 'https://calendar.google.com/calendar/event?action=TEMPLATE',
						logoUrl: eventData.logoUrl || '/images/logo.png'
					};
				}
			}
		} catch (error) {
			console.error('Error loading latest event:', error);
		}
	});

	async function fetchTwitterProfile(handle: string): Promise<string | null> {
		if (!handle) return null;

		try {
			const response = await fetch(`/api/profile-image?platform=twitter&username=${encodeURIComponent(handle)}`);
			if (!response.ok) {
				const errorData = await response.json();
				if (response.status === 429) {
					throw new Error('Twitter API rate limit exceeded. Please try again later.');
				}
				throw new Error(errorData.message || 'Failed to fetch Twitter profile');
			}
			const data = await response.json();
			return data.profile_image_url;
		} catch (error) {
			console.error('Error fetching Twitter profile:', error);
			throw error;
		}
	}

	async function fetchBlueskyProfile(handle: string): Promise<string | null> {
		if (!handle) return null;

		try {
			const response = await fetch(`/api/profile-image?platform=bluesky&username=${encodeURIComponent(handle)}`);
			if (!response.ok) {
				console.error('Failed to fetch Bluesky profile');
				return null;
			}
			const data = await response.json();
			return data.profile_image_url ? `/api/proxy-bsky-image?url=${encodeURIComponent(data.profile_image_url)}` : null;
		} catch (error) {
			console.error('Error fetching Bluesky profile:', error);
			return null;
		}
	}

	async function handleSocialHandleChange(index: number) {
		const speaker = formData.speakers[index];
		let profileImageUrl = null;

		formData.speakers[index].error = '';

		if (speaker.profileImagePlatform === 'custom') {
			if (speaker.customImageUrl) {
				try {
					const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(speaker.customImageUrl)}`;
					const response = await fetch(proxyUrl);
					if (!response.ok) {
						throw new Error('Failed to load image');
					}
					formData.speakers[index].image = proxyUrl;
					formData.speakers[index].error = '';
				} catch (error) {
					formData.speakers[index].image = '';
					formData.speakers[index].error = error instanceof Error ?
						error.message : 'Failed to load custom image';
				}
			} else {
				formData.speakers[index].image = '';
			}
			formData = { ...formData };
			return;
		}

		if (!speaker.profileImageHandle && !speaker.twitterHandle) {
			formData.speakers[index].image = '';
			formData = { ...formData };
			return;
		}

		const handleToUse = speaker.profileImagePlatform === 'bluesky' ?
			speaker.profileImageHandle || speaker.twitterHandle :
			speaker.twitterHandle;

		if (!handleToUse) {
			formData.speakers[index].image = '';
			formData = { ...formData };
			return;
		}

		try {
			if (speaker.profileImagePlatform === 'twitter') {
				profileImageUrl = await fetchTwitterProfile(handleToUse);
			} else if (speaker.profileImagePlatform === 'bluesky') {
				profileImageUrl = await fetchBlueskyProfile(handleToUse);
			}

			if (profileImageUrl) {
				formData.speakers[index].image = profileImageUrl;
				formData.speakers[index].error = '';
			} else {
				formData.speakers[index].image = '';
				formData.speakers[index].error = 'Could not fetch profile image';
			}
		} catch (error) {
			formData.speakers[index].image = '';
			formData.speakers[index].error = error instanceof Error ? error.message : 'An unexpected error occurred';
		}

		formData = { ...formData };
	}

	function addSpeaker() {
		formData.speakers = [
			...formData.speakers,
			{
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
			}
		];
	}

	function removeSpeaker(index: number) {
		formData.speakers = formData.speakers.filter((_, i) => i !== index);
	}

	function resetForm() {
		formData = {
			title: 'Watch Party',
			eventNumber: 1,
			date: getLastTuesdayOfMonth(),
			time: '08:00',
			timezone: 'PST',
			speakers: [
				{
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
				}
			],
			registrationUrl: 'https://lofi.so',
			discordUrl: 'https://discord.gg/ZRrwZxn4rW',
			calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
			logoUrl: '/images/logo.png'
		};
		exportResults = [];
		exportError = '';
	}

	function loadFixture() {
		const fixture = fixtureData.lofi33;
		formData = {
			title: fixture.event.title,
			eventNumber: fixture.event.number,
			date: fixture.event.startTimeISO.split('T')[0],
			time: '08:00',
			timezone: 'PST',
			speakers: fixture.speakers.map((s) => {
				const social = s.social as Record<string, string | undefined>;
				return {
				name: s.name,
				socialPlatform: (social.twitter ? 'twitter' : social.bluesky ? 'bluesky' : 'linkedin') as string,
				socialHandle: social.twitter || social.bluesky || '',
				twitterHandle: social.twitter || '',
				profileImagePlatform: 'twitter',
				profileImageHandle: '',
				customImageUrl: '',
				talk: s.talk,
				bio: s.bio,
				talkPoints: [...s.bullets, ...Array(Math.max(0, 3 - s.bullets.length)).fill('')].slice(0, 3),
				image: s.avatar,
				error: ''
			}; }),
			registrationUrl: fixture.event.links.registration,
			discordUrl: fixture.event.links.discord,
			calendarUrl: fixture.event.links.calendar,
			logoUrl: fixture.event.links.logo
		};
		exportResults = [];
		exportError = '';
	}

	// Legacy export: save + single event graphic PNG
	async function handleSubmit() {
		try {
			const payload = { ...formData, startTimeISO };
			const response = await fetch('/api/save-event', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) throw new Error('Failed to save event data');

			const graphic = document.querySelector('#graphic');
			if (!graphic) throw new Error('Graphic element not found');

			const dataUrl = await domToPng(graphic, {
				scale: 2,
				quality: 1,
				width: 1120,
				height: 630
			});

			const link = document.createElement('a');
			link.download = `${formData.title.toLowerCase().replace(/\s+/g, '-')}${formData.eventNumber}.png`;
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error('Error:', error);
			alert('Failed to generate event graphic');
		}
	}

	// Legacy export: speaker cards
	async function handleGenerateSpeakerCards() {
		try {
			const payload = { ...formData, startTimeISO };
			const response = await fetch('/api/save-event', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (!response.ok) throw new Error('Failed to save event data');

			for (let i = 0; i < formData.speakers.length; i++) {
				const speaker = formData.speakers[i];
				const speakerCardElement = document.querySelector(`#speaker-card-${i}`);

				if (!speakerCardElement) continue;

				const dataUrl = await domToPng(speakerCardElement, {
					scale: 2,
					quality: 1,
					width: 800,
					height: 450
				});

				const link = document.createElement('a');
				link.download = `speaker-${formData.eventNumber}-${speaker.name.toLowerCase().replace(/\s+/g, '-')}.png`;
				link.href = dataUrl;
				link.click();
			}
		} catch (error) {
			console.error('Error:', error);
			alert('Failed to generate speaker cards');
		}
	}

	// New: Multi-platform bundle export
	async function handleGenerateBundle() {
		isExporting = true;
		exportResults = [];
		exportError = '';

		try {
			// Save event data first
			const payload = { ...formData, startTimeISO };
			const saveResponse = await fetch('/api/save-event', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});
			if (!saveResponse.ok) throw new Error('Failed to save event data');

			const results: ExportResult[] = [];
			const activeTargets = exportTargets.filter((t) => enabledTargets[t.id]);

			// Capture event graphic for each enabled target
			for (const target of activeTargets) {
				const el = document.querySelector('#graphic') as HTMLElement;
				if (!el) continue;

				const blob = await captureTarget(el, target);
				const filename = generateFilename(spec, target);
				const validation = validateExport(blob, target);

				results.push({ target, blob, filename, validation });
			}

			// Capture speaker cards at agenda_regular target
			const speakerTarget = activeTargets.find((t) => t.id === 'agenda_regular') || activeTargets[0];
			if (speakerTarget) {
				for (let i = 0; i < formData.speakers.length; i++) {
					const el = document.querySelector(`#speaker-card-${i}`) as HTMLElement;
					if (!el) continue;

					const blob = await captureTarget(el, speakerTarget);
					const filename = generateFilename(spec, speakerTarget, formData.speakers[i].name);
					const validation = validateExport(blob, speakerTarget);

					results.push({
						target: speakerTarget,
						blob,
						filename,
						validation,
						speakerName: formData.speakers[i].name
					});
				}
			}

			// Capture sponsor card
			const sponsorTarget = activeTargets.find((t) => t.id === 'announcement_regular') || activeTargets[0];
			if (sponsorTarget) {
				const el = document.querySelector('#sponsor-card') as HTMLElement;
				if (el) {
					const blob = await captureTarget(el, sponsorTarget);
					const filename = `lofi-${spec.event.number}-sponsors-${sponsorTarget.id}.${sponsorTarget.format}`;
					const validation = validateExport(blob, sponsorTarget);
					results.push({ target: sponsorTarget, blob, filename, validation });
				}
			}

			exportResults = results;

			// Build manifest and captions
			const manifest = await buildManifest(results, spec);
			const captions = buildCaptions(spec);

			// Bundle into zip
			const zipBlob = await bundleExports(results, manifest, captions);

			// Download
			const link = document.createElement('a');
			link.download = `lofi-${spec.event.number}-export-bundle.zip`;
			link.href = URL.createObjectURL(zipBlob);
			link.click();
			URL.revokeObjectURL(link.href);
		} catch (error) {
			console.error('Export error:', error);
			exportError = error instanceof Error ? error.message : 'Export failed';
		} finally {
			isExporting = false;
		}
	}

	function formatBytes(bytes: number): string {
		if (bytes < 1024) return `${bytes}B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
	}
</script>

<div class="container mx-auto p-20 text-white">
	<h1 class="mb-8 text-3xl font-bold">Generate Event Graphic</h1>

	<form on:submit|preventDefault={handleSubmit} class="mb-8 space-y-6 text-black">
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
			<!-- Basic Event Details -->
			<div class="space-y-4 rounded-lg bg-white p-6 shadow-md">
				<h2 class="text-xl font-semibold">Event Details</h2>

				<div>
					<label class="block text-sm font-medium text-gray-700">Event Title</label>
					<input
						type="text"
						bind:value={formData.title}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						placeholder="Watchparty, Meetup, etc."
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Event Number</label>
					<input
						type="number"
						bind:value={formData.eventNumber}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Date</label>
					<input
						type="date"
						bind:value={formData.date}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Time</label>
					<input
						type="time"
						bind:value={formData.time}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Timezone</label>
					<select
						bind:value={formData.timezone}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
					>
						<option value="PST">PST</option>
						<option value="EST">EST</option>
						<option value="GMT">GMT</option>
						<option value="UTC">UTC</option>
					</select>
				</div>
			</div>

			<!-- URLs -->
			<div class="space-y-4 rounded-lg bg-white p-6 shadow-md">
				<h2 class="text-xl font-semibold">URLs</h2>

				<div>
					<label class="block text-sm font-medium text-gray-700">Event Join URL</label>
					<input
						type="url"
						bind:value={formData.registrationUrl}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Discord URL</label>
					<input
						type="url"
						bind:value={formData.discordUrl}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Calendar URL</label>
					<input
						type="url"
						bind:value={formData.calendarUrl}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700">Logo URL</label>
					<input
						type=""
						bind:value={formData.logoUrl}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
						required
					/>
				</div>
			</div>
		</div>

		<!-- Speakers -->
		<div class="rounded-lg bg-white p-6 shadow-md">
			<div class="mb-4 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Speakers</h2>
				<button
					type="button"
					on:click={addSpeaker}
					class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white transition hover:bg-primary/90"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="h-5 w-5"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
					</svg>
					Add Speaker
				</button>
			</div>

			{#each formData.speakers as speaker, i}
				<div class="relative mb-6 rounded-lg border border-gray-200 p-4 last:mb-0">
					{#if formData.speakers.length > 1}
						<button
							type="button"
							on:click={() => removeSpeaker(i)}
							class="absolute right-2 top-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke-width="1.5"
								stroke="currentColor"
								class="h-5 w-5"
							>
								<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-gray-700">Name</label>
								<input
									type="text"
									bind:value={speaker.name}
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									required
								/>
							</div>

							<div class="space-y-4">
								<div>
									<label class="block text-sm font-medium text-gray-700">Social Platform</label>
									<select
										bind:value={speaker.socialPlatform}
										on:change={() => handleSocialPlatformChange(i)}
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									>
										<option value="twitter">Twitter</option>
										<option value="bluesky">Bluesky</option>
										<option value="linkedin">LinkedIn</option>
									</select>
								</div>

								<div>
									<label class="block text-sm font-medium text-gray-700">Social Handle</label>
									<input
										type="text"
										bind:value={speaker.socialHandle}
										placeholder={speaker.socialPlatform === 'twitter' ? '@username' : speaker.socialPlatform === 'bluesky' ? 'handle.bsky.social' : 'username'}
										on:change={(event) => handleSocialHandleInput(event, i)}
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										required
									/>
									{#if speaker.error}
										<p class="mt-1 text-sm text-red-600">{speaker.error}</p>
									{/if}
								</div>

								<div class="space-y-4">
									<div>
										<label class="block text-sm font-medium text-gray-700">Profile Image Source</label>
										<select
											bind:value={speaker.profileImagePlatform}
											on:change={() => handleSocialHandleChange(i)}
											class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										>
											<option value="twitter">Use Twitter</option>
											<option value="bluesky">Use Bluesky</option>
											<option value="custom">Use Custom Image URL</option>
										</select>
									</div>

									{#if speaker.profileImagePlatform === 'bluesky'}
										<div>
											<label class="block text-sm font-medium text-gray-700">
												Bluesky Handle (Optional)
											</label>
											<input
												type="text"
												bind:value={speaker.profileImageHandle}
												placeholder="handle.bsky.social"
												on:change={() => handleSocialHandleChange(i)}
												class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											/>
											<p class="mt-1 text-xs text-gray-500">Leave empty to use Twitter handle</p>
										</div>
									{/if}

									{#if speaker.profileImagePlatform === 'custom'}
										<div>
											<label class="block text-sm font-medium text-gray-700">
												Custom Image URL
											</label>
											<input
												type="url"
												bind:value={speaker.customImageUrl}
												placeholder="https://example.com/image.jpg"
												on:change={() => handleSocialHandleChange(i)}
												class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
											/>
										</div>
									{/if}
								</div>
							</div>
						</div>

						<div class="space-y-4">
							<div>
								<label class="block text-sm font-medium text-gray-700">Talk Title</label>
								<input
									type="text"
									bind:value={speaker.talk}
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									required
								/>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700">Speaker Bio</label>
								<textarea
									bind:value={speaker.bio}
									rows="3"
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									required
								/>
							</div>

							<div class="space-y-2">
								<label class="block text-sm font-medium text-gray-700">Talk Points</label>
								{#each speaker.talkPoints as _, pointIndex}
									<input
										type="text"
										bind:value={speaker.talkPoints[pointIndex]}
										placeholder={`Point ${pointIndex + 1}`}
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
									/>
								{/each}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- Export Targets -->
		<div class="rounded-lg bg-white p-6 shadow-md">
			<h2 class="mb-4 text-xl font-semibold">Export Targets</h2>
			<div class="space-y-2">
				{#each exportTargets as target}
					<label class="flex items-center gap-3">
						<input
							type="checkbox"
							bind:checked={enabledTargets[target.id]}
							class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
						/>
						<span class="text-sm">
							{target.label}
							<span class="text-xs text-gray-500">({target.width}x{target.height} {target.format.toUpperCase()}{target.maxBytes ? `, max ${formatBytes(target.maxBytes)}` : ''})</span>
						</span>
					</label>
				{/each}
			</div>
		</div>

		<!-- Action Buttons -->
		<div class="flex flex-wrap gap-4">
			<button
				type="button"
				on:click={handleGenerateBundle}
				disabled={isExporting}
				class="flex-1 rounded-md bg-green-600 px-4 py-3 text-lg font-semibold text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
			>
				{isExporting ? 'Generating...' : 'Generate Bundle'}
			</button>
			<button
				type="submit"
				class="rounded-md bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
			>
				Legacy: Event Graphic
			</button>
			<button
				type="button"
				on:click={handleGenerateSpeakerCards}
				class="rounded-md bg-discord px-4 py-2 text-white shadow-sm hover:bg-discord/90 focus:outline-none focus:ring-2 focus:ring-discord focus:ring-offset-2"
			>
				Legacy: Speaker Cards
			</button>
			<button
				type="button"
				on:click={loadFixture}
				class="rounded-md bg-gray-600 px-4 py-2 text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
			>
				Load Fixture (LoFi/33)
			</button>
			<button
				type="button"
				on:click={resetForm}
				class="rounded-md bg-gray-500 px-4 py-2 text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
			>
				Reset
			</button>
		</div>
	</form>

	<!-- Export Summary -->
	{#if exportResults.length > 0 || exportError}
		<div class="mb-8 rounded-lg bg-white p-6 text-black shadow-md">
			<h2 class="mb-4 text-xl font-semibold">Export Summary</h2>
			{#if exportError}
				<p class="text-red-600">{exportError}</p>
			{/if}
			{#if exportResults.length > 0}
				<table class="w-full text-sm">
					<thead>
						<tr class="border-b border-gray-200 text-left">
							<th class="py-2 pr-4">Filename</th>
							<th class="py-2 pr-4">Dimensions</th>
							<th class="py-2 pr-4">Size</th>
							<th class="py-2">Status</th>
						</tr>
					</thead>
					<tbody>
						{#each exportResults as result}
							<tr class="border-b border-gray-100">
								<td class="py-2 pr-4 font-mono text-xs">{result.filename}</td>
								<td class="py-2 pr-4">{result.target.width}x{result.target.height}</td>
								<td class="py-2 pr-4" class:text-green-600={result.validation.valid} class:text-red-600={!result.validation.valid}>
									{formatBytes(result.validation.sizeBytes)}
								</td>
								<td class="py-2">
									{#if result.validation.valid}
										<span class="text-green-600">Pass</span>
									{:else}
										<span class="text-red-600">Fail</span>
									{/if}
									{#each result.validation.warnings as warning}
										<span class="ml-1 text-xs text-yellow-600">({warning})</span>
									{/each}
									{#each result.validation.errors as error}
										<span class="ml-1 text-xs text-red-600">({error})</span>
									{/each}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</div>
	{/if}

	<!-- Preview Section -->
	<div class="mt-8 space-y-8">
		<!-- Preview Target Selector -->
		<div class="flex items-center gap-4">
			<span class="text-sm font-medium">Preview as:</span>
			{#each exportTargets as target}
				<button
					type="button"
					on:click={() => (activePreviewTarget = target.id)}
					class="rounded-md px-3 py-1 text-sm transition {activePreviewTarget === target.id ? 'bg-primary text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
				>
					{target.label.split('(')[0].trim()}
				</button>
			{/each}
		</div>

		<div>
			<h2 class="mb-4 text-xl font-semibold">Event Graphic Preview <span class="text-sm font-normal text-gray-400">({previewTarget.width}x{previewTarget.height})</span></h2>
			<div class="flex items-center justify-center overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-8 shadow-md dark:border-gray-700 dark:bg-gray-900" style="min-height: 600px;">
				<div id="graphic" class="origin-center" style="width: {previewTarget.width}px; min-width: {previewTarget.width}px; height: {previewTarget.height}px; min-height: {previewTarget.height}px;">
					<EventGraphic {spec} />
				</div>
			</div>
		</div>

		<div>
			<h2 class="mb-4 text-xl font-semibold">Speaker Cards Preview</h2>
			<div class="space-y-8">
				{#each formData.speakers as speaker, i}
					<div class="flex items-center justify-center overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-8 shadow-md dark:border-gray-700 dark:bg-gray-900">
						<h3 class="absolute left-4 top-4 mb-2 text-lg font-medium">{speaker.name || 'Speaker ' + (i + 1)}</h3>
						<div id="speaker-card-{i}" class="origin-center">
							<SpeakerCard
								{spec}
								speakerIndex={i}
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div>
			<h2 class="mb-4 text-xl font-semibold">Sponsor Card Preview</h2>
			<div class="flex items-center justify-center overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-8 shadow-md dark:border-gray-700 dark:bg-gray-900">
				<div id="sponsor-card" class="origin-center">
					<SponsorCard
						sponsors={spec.sponsors}
						eventNumber={spec.event.number}
						displayDateTime={spec.event.displayDateTime}
					/>
				</div>
			</div>
		</div>
	</div>
</div>
