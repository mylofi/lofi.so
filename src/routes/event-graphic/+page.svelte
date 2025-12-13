<script lang="ts">
	import { domToPng } from 'modern-screenshot';
	import EventGraphic from '$lib/components/EventGraphic.svelte';
	import SpeakerCard from '$lib/components/SpeakerCard.svelte';
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

	// Update the date when the month changes
	function updateToLastTuesday() {
		formData.date = getLastTuesdayOfMonth();
		formData = { ...formData }; // Trigger reactivity
	}

	function handleTwitterHandleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		let value = input.value;

		if (!value.startsWith('@')) {
			value = '@' + value;
		}

		formData.speakers[index].twitterHandle = value;
		formData = { ...formData }; // Trigger reactivity

		handleSocialHandleChange(index);
	}

	function handleSocialHandleInput(event: Event, index: number) {
		const input = event.target as HTMLInputElement;
		let value = input.value;
		const platform = formData.speakers[index].socialPlatform;

		// Add @ prefix for Twitter handles
		if (platform === 'twitter' && !value.startsWith('@')) {
			value = '@' + value;
		}

		formData.speakers[index].socialHandle = value;
		// Also update twitterHandle for backward compatibility
		if (platform === 'twitter') {
			formData.speakers[index].twitterHandle = value;
		}

		formData = { ...formData }; // Trigger reactivity

		handleSocialHandleChange(index);
	}

	function handleSocialPlatformChange(index: number) {
		const speaker = formData.speakers[index];
		const platform = speaker.socialPlatform;

		// Update profileImagePlatform based on social platform
		if (platform === 'twitter' || platform === 'bluesky') {
			speaker.profileImagePlatform = platform;
		} else if (platform === 'linkedin') {
			// For LinkedIn, we might want to use custom image or Twitter as fallback
			speaker.profileImagePlatform = 'twitter';
		}

		// Update placeholder and handle format
		if (platform === 'twitter' && !speaker.socialHandle.startsWith('@')) {
			speaker.socialHandle = '@' + speaker.socialHandle;
		}

		formData = { ...formData }; // Trigger reactivity

		handleSocialHandleChange(index);
	}

	onMount(() => {
		updateToLastTuesday();
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
			// Proxy the avatar URL through our endpoint
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

		// Handle custom image URL
		if (speaker.profileImagePlatform === 'custom') {
			if (speaker.customImageUrl) {
				try {
					// Proxy the custom image URL through our endpoint
					const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(speaker.customImageUrl)}`;

					// Verify the image is accessible
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

		// Clear the image when switching platforms or clearing handles
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
				formData.speakers[index].error = ''; // Clear any previous errors
			} else {
				formData.speakers[index].image = '';
				formData.speakers[index].error = 'Could not fetch profile image';
			}
		} catch (error) {
			formData.speakers[index].image = '';
			// Use the exact error message from the API
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

	async function handleSubmit() {
		try {
			// save the JSON data
			const response = await fetch('/api/save-event', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) throw new Error('Failed to save event data');

			// generate the image
			const graphic = document.querySelector('#graphic');
			if (!graphic) throw new Error('Graphic element not found');

			const rect = graphic.getBoundingClientRect();
			const dataUrl = await domToPng(graphic, {
				scale: 2,
				quality: 1,
				width: rect.width,
				height: rect.height,
				style: {
					transform: 'scale(1)',
					transformOrigin: 'top left'
				}
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

	async function handleGenerateSpeakerCards() {
		try {
			// save the JSON data first
			const response = await fetch('/api/save-event', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (!response.ok) throw new Error('Failed to save event data');

			// generate images for each speaker
			for (let i = 0; i < formData.speakers.length; i++) {
				const speaker = formData.speakers[i];
				const speakerCardElement = document.querySelector(`#speaker-card-${i}`);

				if (!speakerCardElement) continue;

				const rect = speakerCardElement.getBoundingClientRect();
				const dataUrl = await domToPng(speakerCardElement, {
					scale: 2,
					quality: 1,
					width: rect.width,
					height: rect.height,
					style: {
						transform: 'scale(1)',
						transformOrigin: 'top left'
					}
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
					<label class="block text-sm font-medium text-gray-700">Registration URL</label>
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

		<div class="flex gap-4">
			<button
				type="submit"
				class="flex-1 rounded-md bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
			>
				Generate Event Graphic
			</button>
			<button
				type="button"
				on:click={handleGenerateSpeakerCards}
				class="flex-1 rounded-md bg-discord px-4 py-2 text-white shadow-sm hover:bg-discord/90 focus:outline-none focus:ring-2 focus:ring-discord focus:ring-offset-2"
			>
				Generate Speaker Cards
			</button>
		</div>
	</form>

	<!-- Preview Section -->
	<div class="mt-8 space-y-8">
		<div>
			<h2 class="mb-4 text-xl font-semibold">Event Graphic Preview</h2>
			<div class="overflow-auto">
				<div id="graphic">
					<EventGraphic eventData={{
						...formData,
						speakers: formData.speakers.map(s => ({
							name: s.name,
							twitterHandle: s.socialPlatform === 'twitter' ? s.socialHandle : s.twitterHandle,
							talk: s.talk,
							image: s.image
						}))
					}} />
				</div>
			</div>
		</div>

		<div>
			<h2 class="mb-4 text-xl font-semibold">Speaker Cards Preview</h2>
			<div class="space-y-8">
				{#each formData.speakers as speaker, i}
					<div class="overflow-auto rounded-lg border border-gray-200 p-4">
						<h3 class="mb-2 text-lg font-medium">{speaker.name || 'Speaker ' + (i + 1)}</h3>
						<div id="speaker-card-{i}">
							<SpeakerCard
								speakerData={{
									name: speaker.name,
									twitterHandle: speaker.socialPlatform === 'twitter' ? speaker.socialHandle : speaker.twitterHandle,
									talk: speaker.talk,
									bio: speaker.bio,
									talkPoints: speaker.talkPoints,
									image: speaker.image
								}}
								eventNumber={formData.eventNumber}
								date={formData.date}
								time={formData.time}
								timezone={formData.timezone}
							/>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
