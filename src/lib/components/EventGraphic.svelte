<!-- App.svelte -->
<script lang="ts">
	import { domToPng } from 'modern-screenshot';
	import type { EventData } from '$lib/server/kv';

	interface Speaker {
		name: string;
		twitterHandle: string;
		talk: string;
		image: string;
	}

	export let eventData: EventData | null = null;

	$: formattedDate = eventData?.date ? formatDate(eventData.date) : '';
	$: formattedTime = eventData?.time ? formatTime(eventData.time) : '';
	$: formattedDateTime = eventData ? `${formattedDate} @ ${formattedTime} ${eventData.timezone}` : '';
	$: isEventPassed = eventData?.date ? new Date(eventData.date) < new Date() : false;
	// $: recordingDate = isEventPassed && eventData?.date ? formatRecordingDate(eventData.date) : '';

	function formatDate(dateStr: string): string {
		const date = new Date(dateStr);
		const day = date.getDate();
		const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
		const month = date.toLocaleDateString('en-US', { month: 'long' });
		const year = date.getFullYear();
		return `${weekday}, ${day} ${month} ${year}`;
	}

	function formatTime(timeStr: string): string {
		const [hours, minutes] = timeStr.split(':');
		const hour = parseInt(hours);
		const ampm = hour >= 12 ? 'PM' : 'AM';
		const hour12 = hour % 12 || 12;
		return `${hour12}${ampm}`;
	}
	
	function formatRecordingDate(dateStr: string): string {
		const eventDate = new Date(dateStr);
		// Add one day to simulate when recording became available
		const recordingAvailableDate = new Date(eventDate);
		recordingAvailableDate.setDate(eventDate.getDate() + 1);
		
		return recordingAvailableDate.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
	}
</script>

{#if eventData && eventData.eventNumber}
	<main id="graphic" class="flex items-center justify-center p-4">
		<div
			class="lg:scale-90 relative flex h-fit w-fit origin-top scale-[0.8] flex-col items-end justify-end rounded-3xl bg-gradient-to-t from-primary to-discord text-black shadow-[0_0_30px_-10px_theme(colors.primary)] dark:text-white sm:scale-65 md:scale-75 lg:flex-row"
		>
			<!-- Past Event Ribbon -->
			{#if isEventPassed}
				<div class="absolute -left-2 top-8 z-10 rotate-[-45deg] transform">
					<div class="bg-red-600 px-8 py-0.5 text-center text-xs font-semibold rounded-sm uppercase tracking-wider text-white shadow-lg">
						Past Event
					</div>
				</div>
			{/if}
			
			<!-- Background Pattern -->
			<div class="pointer-events-none absolute inset-0 rounded-3xl opacity-10">
				<svg width="100%" height="100%">
					<defs>
						<pattern
							id="dot-pattern"
							x="0"
							y="0"
							width="30"
							height="30"
							patternUnits="userSpaceOnUse"
						>
							<circle cx="2" cy="2" r="1.2" fill="currentColor" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#dot-pattern)" />
				</svg>
			</div>

			<!-- Main Content Section -->
			<section class="rounded-xl shadow-lg">
				<div class="rounded-xl bg-gray-100 px-6 py-6 shadow-md dark:bg-gray-800">
					<div class="mb-3">
						<!-- Header with Logo -->
						<div class="mb-3 flex items-center gap-2">
							<img
								src={eventData.logoUrl || '/images/logo.png'}
								alt="LoFi"
								class="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12"
							/>
							<h2 class="m-0 text-xl font-bold sm:text-2xl lg:text-3xl">
								LoFi/{eventData.eventNumber} - {isEventPassed ? 'Past Meetup' : 'Join our Monthly Meetup'}
							</h2>
						</div>

						<!-- Event Details -->
						<p class="text-sm sm:text-base">Local First Meetup #{eventData.eventNumber}</p>
						<p class="my-2 text-base font-bold {isEventPassed ? 'text-gray-500' : 'text-discord'} sm:text-lg">
							{#if isEventPassed}
								<span class="line-through">{formattedDateTime}</span> <span class="ml-2 text-sm font-normal">(Event has ended)</span>
							{:else}
								{formattedDateTime}
							{/if}
						</p>
					</div>

					<!-- Speakers Section -->
					<div class="rounded-xl bg-white p-3 shadow-xl dark:bg-gray-900 sm:p-4 {isEventPassed ? 'opacity-90' : ''}">
						{#if isEventPassed}
							<h4 class="m-0 text-xl font-semibold sm:text-2xl">Recorded Talks</h4>
						{:else}
							<h4 class="m-0 text-xl font-semibold sm:text-2xl">Scheduled Talks</h4>
						{/if}
						<div class="mb-4 h-0.5 border-b border-gray-500"></div>
						{#if eventData.speakers && eventData.speakers.length > 0}
							{#each eventData.speakers as speaker}
								<!-- Speaker Card -->
								<div class="group flex items-center gap-2">
									<a
										href={`https://x.com/${speaker.twitterHandle?.substring(1)}`}
										target="_blank"
										rel="noopener noreferrer"
										class="flex w-[230px] min-w-[200px] cursor-pointer items-center gap-2 rounded-full bg-gray-50 p-1 shadow-sm transition hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
									>
										<!-- Speaker Avatar -->
										<div
											class="relative h-[40px] w-[40px] rounded-full bg-gray-200 dark:bg-gray-700 sm:h-[45px] sm:w-[45px] lg:h-[65px] lg:w-[65px]"
										>
											<img
												src={speaker.image || ''}
												alt={speaker.name}
												class="absolute h-full w-full rounded-full object-cover object-center transition-transform duration-300 group-hover:z-50 group-hover:scale-[1.2]"
											/>
										</div>
										<!-- Speaker Info -->
										<div class="pr-2">
											<h3 class="m-0 text-sm font-semibold">{speaker.name}</h3>
											<span class="text-xs text-gray-600 dark:text-gray-400">{speaker.twitterHandle}</span>
										</div>
									</a>
									<!-- Talk Title -->
									<p
										class="text-sm font-semibold italic leading-tight transition group-hover:text-discord"
									>
										{speaker.talk}
									</p>
								</div>
								<div class="my-3 h-0.5 w-full border-b border-gray-100 dark:border-gray-700"></div>
							{/each}
						{:else}
							<p class="text-gray-500 dark:text-gray-400">No speakers scheduled yet</p>
						{/if}
					</div>
				</div>
			</section>

			<!-- Call to Action Section -->
			<section class="relative flex w-full flex-col gap-3 p-2 sm:gap-4 sm:p-3 lg:w-auto">
				<!-- <h3 class="m-0 text-center text-lg font-semibold text-white sm:text-xl lg:text-2xl">
					{#if isEventPassed}
						Watch the Recording
					{:else}
						Join Us!
					{/if}
				</h3> -->
				<!-- QR Code or Thumbnail Section -->
				<div class="hidden flex-col items-center gap-2 lg:flex">
					{#if isEventPassed}
						<div class="relative h-32 w-32 overflow-hidden rounded-lg bg-black">
							<img
								src="https://img.youtube.com/vi/placeholder/0.jpg"
								alt="Event Recording Thumbnail"
								class="h-full w-full object-cover"
							/>
							<div class="absolute inset-0 flex items-center justify-center bg-black/30">
								<div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-600">
									<svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
										<path d="M8 5v14l11-7z"/>
									</svg>
								</div>
							</div>
						</div>
					{:else}
						<div class="h-24 w-24 rounded-lg bg-white p-2 sm:h-28 sm:w-28 lg:h-32 lg:w-32">
							<img
								src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${eventData.registrationUrl}`}
								alt="Event QR Code"
								class="h-full w-full"
							/>
						</div>
						<span class="text-sm text-white/90">Scan for details</span>
					{/if}
				</div>
				<!-- Action Buttons -->
				<div class="flex w-full flex-col items-center gap-3">
					{#if isEventPassed}
						<a
							href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-white transition hover:bg-red-700"
						>
							<svg class="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
							</svg>
							Watch Recording
						</a>
						<a
							href={eventData.discordUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-6 py-3 text-white backdrop-blur-sm transition hover:bg-white/30"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
								><path
									d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
								/></svg
							>
							Join for Updates
						</a>
					{:else}
						<a
							href={eventData.registrationUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-6 py-3 text-white backdrop-blur-sm transition hover:bg-white/30"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="currentColor"
								><path
									d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
								/></svg
							>
							Join on Discord
						</a>
						<a
							href={eventData.calendarUrl}
							target="_blank"
							rel="noopener noreferrer"
							class="flex w-full items-center justify-center gap-2 rounded-lg bg-white/20 px-6 py-3 text-white backdrop-blur-sm transition hover:bg-white/30"
						>
							<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"
								><path
									d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
								/></svg
							>
							Add to Calendar
						</a>
					{/if}
				</div>
			</section>
		</div>
	</main>
{:else}
	<div class="flex h-screen items-center justify-center">
		<div
			class="flex min-h-[300px] w-1/2 items-center justify-center rounded-xl bg-gray-100 p-8 text-center dark:bg-gray-800"
		>
			<div class="max-w-md">
				<img src="/images/logo.png" alt="LoFi" class="mx-auto mb-4 h-16 w-16 opacity-50" />
				<h2 class="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-200">No Upcoming Event</h2>
				<p class="text-gray-600 dark:text-gray-400">
					Stay tuned! Our next Local First event is being planned. Check back soon for updates or
					join our Discord community.
				</p>
				<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<a
						href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
						</svg>
						Catch Up on Past Events
					</a>
					<a
						href="https://discord.gg/lofi-so"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 rounded-lg bg-discord px-4 py-2 text-white transition hover:bg-discord/90"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
							/>
						</svg>
						Join Discord Community
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
