<script lang="ts">
	import { domToPng } from 'modern-screenshot';
	import EventGraphic from '$lib/components/EventGraphic.svelte';
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
		eventNumber: 1,
		date: lastTuesday,
		time: '08:00',
		timezone: 'PST',
		speakers: [
			{
				name: '',
				twitterHandle: '',
				profileImagePlatform: 'twitter',
				profileImageHandle: '',
				talk: '',
				image: ''
			}
		],
		registrationUrl: 'https://localfirstweb.dev',
		discordUrl: 'https://discord.gg/ZRrwZxn4rW',
		calendarUrl: 'https://calendar.google.com/calendar/event?action=TEMPLATE',
		logoUrl: '/images/logo.png'
	};

	// Update the date when the month changes
	function updateToLastTuesday() {
		formData.date = getLastTuesdayOfMonth();
		formData = { ...formData }; // Trigger reactivity
	}

	onMount(() => {
		updateToLastTuesday();
	});

	async function fetchTwitterProfile(handle: string): Promise<string | null> {
		if (!handle) return null;

		try {
			const response = await fetch(`/api/twitter-profile?username=${encodeURIComponent(handle)}`);
			if (!response.ok) {
				console.error('Failed to fetch Twitter profile:', await response.text());
				return null;
			}
			const data = await response.json();
			return data.profile_image_url;
		} catch (error) {
			console.error('Error fetching Twitter profile:', error);
			return null;
		}
	}

	async function fetchBlueskyProfile(handle: string): Promise<string | null> {
		if (!handle) return null;

		try {
			const response = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(handle)}`);
			if (!response.ok) {
				console.error('Failed to fetch Bluesky profile:', await response.text());
				return null;
			}
			const data = await response.json();
			return data.avatar;
		} catch (error) {
			console.error('Error fetching Bluesky profile:', error);
			return null;
		}
	}

	async function handleSocialHandleChange(index: number) {
		const speaker = formData.speakers[index];
		let profileImageUrl = null;
		
		const handleToUse = speaker.profileImageHandle || speaker.twitterHandle;
		if (speaker.profileImagePlatform === 'twitter') {
			profileImageUrl = await fetchTwitterProfile(handleToUse);
		} else if (speaker.profileImagePlatform === 'bluesky') {
			profileImageUrl = await fetchBlueskyProfile(handleToUse);
		}

		if (profileImageUrl) {
			formData.speakers[index].image = profileImageUrl;
			formData = { ...formData };
		}
	}

	function addSpeaker() {
		formData.speakers = [
			...formData.speakers,
			{
				name: '',
				twitterHandle: '',
				profileImagePlatform: 'twitter',
				profileImageHandle: '',
				talk: '',
				image: ''
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

			const dataUrl = await domToPng(graphic);
			const link = document.createElement('a');
			link.download = `meetup${formData.eventNumber}.png`;
			link.href = dataUrl;
			link.click();
		} catch (error) {
			console.error('Error:', error);
			alert('Failed to generate event graphic');
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
									<label class="block text-sm font-medium text-gray-700">Twitter Handle (Required)</label>
									<input
										type="text"
										bind:value={speaker.twitterHandle}
										placeholder="@username"
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										required
									/>
								</div>

								<div class="space-y-4">
									<div>
										<label class="block text-sm font-medium text-gray-700">Profile Image Source</label>
										<select
											bind:value={speaker.profileImagePlatform}
											on:change={() => handleSocialHandleChange(i)}
											class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
										>
											<option value="twitter">Use Twitter Profile Image</option>
											<option value="bluesky">Use Bluesky Profile Image</option>
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
						</div>
					</div>
				</div>
			{/each}
		</div>

		<button
			type="submit"
			class="w-full rounded-md bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
		>
			Generate Event Graphic
		</button>
	</form>

	<!-- Preview Section -->
	<div class="mt-8">
		<h2 class="mb-4 text-xl font-semibold">Preview</h2>
		<div class="overflow-auto">
			<div id="graphic">
				<EventGraphic eventData={{
					...formData,
					speakers: formData.speakers.map(s => ({
						name: s.name,
						handle: s.twitterHandle,
						talk: s.talk,
						image: s.image
					}))
				}} />
			</div>
		</div>
	</div>
</div>
