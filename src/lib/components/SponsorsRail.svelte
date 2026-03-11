<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import SponsorLockup from '$lib/components/SponsorLockup.svelte';
	import { normalizeSponsors } from '$lib/utils/event-graphic-spec';
	import type { EventGraphicSponsor } from '$lib/types/event-graphic';

	export let sponsors: {
		url: string;
		image: string;
		imageDark?: string;
		name: string;
		order?: number;
	}[];

	// Get the appropriate image based on current theme
	function getSponsorImage(sponsor: typeof sponsors[0]): string {
		if (sponsor.imageDark && $theme === 'dark') {
			return sponsor.imageDark;
		}
		return sponsor.image;
	}
	export let variant: 'sidebar' | 'horizontal' | 'compact' = 'sidebar';
	export let showNextEvent = true;
	export let nextEvent: { url: string; name: string; date: string; time: string } | undefined =
		undefined;
	export let className: string = '';
	export let eventData: {
		date: string;
		time: string;
		timezone: string;
		discordUrl: string;
		registrationUrl: string;
		startTimeISO?: string;
		youtubeUrl?: string;
	} | null = null;

	let isMeetupsOpen = true;
	let isConferencesOpen = true;

	const parseYMDAsLocalDate = (dateStr: string): Date | null => {
		const [year, month, day] = dateStr.split('-').map(Number);
		if (!year || !month || !day) return null;
		const parsed = new Date(year, month - 1, day);
		return Number.isNaN(parsed.getTime()) ? null : parsed;
	};

	onMount(() => {
		const checkHeight = () => {
			if (window.innerHeight < 900) {
				isMeetupsOpen = false;
				isConferencesOpen = false;
			}
		};
		checkHeight();
		window.addEventListener('resize', checkHeight);
		return () => window.removeEventListener('resize', checkHeight);
	});

	$: startTimeDate = eventData?.startTimeISO ? new Date(eventData.startTimeISO) : null;

	$: nextEventFromKV = eventData
		? {
				url: eventData.registrationUrl,
				name: 'Local First Meetup',
				date: (
					startTimeDate ||
					parseYMDAsLocalDate(eventData.date) ||
					new Date(eventData.date + 'T00:00:00')
				).toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				}),
				time: startTimeDate
					? startTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
					: `${eventData.time} ${eventData.timezone}`
			}
		: undefined;

	$: activeNextEvent = nextEventFromKV || nextEvent;

	// Check if the event date has passed
	$: isEventPassed = startTimeDate
		? startTimeDate.getTime() < Date.now()
		: eventData
			? (parseYMDAsLocalDate(eventData.date) || new Date(eventData.date + 'T00:00:00')).getTime() < Date.now()
			: false;

	// Adapt legacy sponsors to EventGraphicSponsor for SponsorLockup
	$: normalizedSponsors = normalizeSponsors(
		sponsors.map((s) => ({
			name: s.name,
			image: s.image,
			url: s.url,
			order: s.order
		}))
	) as EventGraphicSponsor[];
</script>

{#if variant === 'sidebar'}
	<div class="hidden xl:block {className}">
		<div class="absolute top-16 bottom-5 right-0 z-20 w-[19.5rem] pr-4">
			<div class="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
					{#if showNextEvent && activeNextEvent}
						<div
							class="mb-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/90"
						>
							<button
								class="flex w-full items-center justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/80"
								on:click={() => (isMeetupsOpen = !isMeetupsOpen)}
							>
							<div class="flex items-center gap-3">
								<div
									class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20"
								>
									{#if isEventPassed}
										<svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
											<path
												d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
											/>
										</svg>
									{:else}
										<svg
											class="h-5 w-5 text-primary"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
											/>
										</svg>
									{/if}
								</div>
								<span class="text-sm font-medium text-primary">Meetups</span>
							</div>
							<svg
								class="h-5 w-5 text-gray-400 transition-transform duration-200"
								class:rotate-180={isMeetupsOpen}
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fill-rule="evenodd"
									d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
									clip-rule="evenodd"
								/>
							</svg>
						</button>

						{#if isMeetupsOpen}
							<div transition:slide class="px-6 pb-6">
									<a href={activeNextEvent.url} class="group mb-4 block">
										<h3
											class="mb-2 text-lg font-semibold text-slate-900 transition group-hover:text-primary dark:text-white"
										>
											{activeNextEvent.name}
										</h3>
										<p class="text-sm text-slate-500 dark:text-slate-300">
											{activeNextEvent.date} • {activeNextEvent.time}
										</p>
									</a>

									<div class="border-t border-slate-200 pt-4 dark:border-gray-800">
										{#if isEventPassed}
											<div class="flex flex-col gap-2">
												<a
													href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
													class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
													target="_blank"
													rel="noopener noreferrer"
												>
												<svg
													class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<path
														d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
													/>
												</svg>
												Catch up on this event
											<!-- </a>
												<a
													href="https://discord.gg/lofi-so"
													class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
													target="_blank"
													rel="noopener noreferrer"
												>
												<svg
													class="h-4 w-4 text-discord group-hover:text-primary transition-colors"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<path
														d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
													/>
												</svg>
												Join Discord for updates
											</a> -->
										</div>
									{:else}
										{#if eventData?.youtubeUrl}
											<a
												href={eventData.youtubeUrl}
												class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
												target="_blank"
												rel="noopener noreferrer"
											>
												<svg
													class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors"
													viewBox="0 0 24 24"
													fill="currentColor"
												>
													<path
														d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
													/>
												</svg>
												Join on YouTube
											</a>
										{/if}
											<a
												href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
												class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
												target="_blank"
												rel="noopener noreferrer"
											>
											<svg
												class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors"
												viewBox="0 0 24 24"
												fill="currentColor"
											>
												<path
													d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
												/>
											</svg>
											Watch Previous Meetups
										</a>
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<!-- Upcoming Conference Section -->
					<div
						class="mb-4 overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900/90"
					>
						<button
							class="flex w-full items-center justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-gray-800/80"
							on:click={() => (isConferencesOpen = !isConferencesOpen)}
						>
						<div class="flex items-center gap-3">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-1 ring-blue-500/30"
							>
								<svg
									class="h-5 w-5 text-blue-500"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<span class="text-sm font-medium text-blue-500">Conferences</span>
						</div>
						<svg
							class="h-5 w-5 text-gray-400 transition-transform duration-200"
							class:rotate-180={isConferencesOpen}
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fill-rule="evenodd"
								d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
								clip-rule="evenodd"
							/>
						</svg>
					</button>

						{#if isConferencesOpen}
							<div transition:slide class="flex flex-col gap-2 px-6 pb-6">
								<a href="https://www.localfirstconf.com/" class="group block" target="_blank" rel="noopener noreferrer">
									<h3
										class="mb-2 text-lg font-semibold text-slate-900 transition group-hover:text-primary dark:text-white"
									>
										Local-First Conf
									</h3>
									<p class="text-sm text-slate-500 dark:text-slate-300">
										🇩🇪 Berlin • July 12 - 14
									</p>

								</a>
								<a
										href="https://www.localfirstconf.com/?tito=%2Flfc%2Flocal-first-conf-2026%2Fen%2Fregistrations%2Fnew%3Fprefill%3D%257B%257D"
										class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
										target="_blank"
										rel="noopener noreferrer"
									>
										<svg
											class="h-4 w-4 text-blue-500 transition-colors group-hover:text-primary"
											xmlns="http://www.w3.org/2000/svg"
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										>
											<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
											<path d="M13 5v2"/>
											<path d="M13 17v2"/>
											<path d="M13 11v2"/>
										</svg>
										Get Tickets
									</a>

								<div class="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-gray-800">

									<a
										href="https://www.youtube.com/playlist?list=PL4isNRKAwz2NCmk5oQq4qIBXreLLdAAJ_"
										class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
										target="_blank"
										rel="noopener noreferrer"
									>
									<svg
									class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
									/>
								</svg>
								Sync Conf SF Recap
							</a>
								<a
									href="https://www.youtube.com/watch?v=0rndR9DbWTs&list=PL4isNRKAwz2MabH6AMhUz1yS3j1DqGdtT"
									class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
									target="_blank"
									rel="noopener noreferrer"
								>
								<svg
									class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
									/>
								</svg>
								LoFi Berlin 2025
							</a>
							<a
									href="https://www.youtube.com/watch?v=NMq0vncHJvU&list=PL4isNRKAwz2O9FxP97_EbOivIWWwSWt5j"
									class="group flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
									target="_blank"
									rel="noopener noreferrer"
								>
								<svg
									class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"
									/>
								</svg>
								LoFi Berlin 2024
							</a>
							</div>
						</div>
					{/if}
				</div>

					<SponsorLockup sponsors={normalizedSponsors} variant="sidebar" />
			</div>
		</div>
	</div>
	{:else if variant === 'horizontal'}
		<div class="w-full {className}">
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
				{#each sponsors as sponsor}
					<a
						href={sponsor.url}
						class="group flex aspect-video items-center justify-center rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-primary/20 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						<img
							src={getSponsorImage(sponsor)}
							alt={sponsor.name}
							class="max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-[1.03]"
						/>
					</a>
				{/each}
				{#if sponsors.length < 4}
					{#each Array(4 - sponsors.length) as _}
						<div
							class="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-900/70"
						></div>
					{/each}
				{/if}
		</div>
	</div>
	{:else}
		<div class="w-full {className}">
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
				{#each sponsors as sponsor}
					<a
						href={sponsor.url}
						class="group flex aspect-video items-center justify-center rounded-lg border border-slate-200 bg-white p-3 transition-colors hover:border-primary/20 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
					>
						<img
							src={getSponsorImage(sponsor)}
							alt={sponsor.name}
							class="max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-[1.03]"
						/>
					</a>
				{/each}
				{#if sponsors.length < 4}
					{#each Array(4 - sponsors.length) as _}
						<div
							class="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 dark:border-gray-800 dark:bg-gray-900/70"
						></div>
					{/each}
				{/if}
		</div>
	</div>
{/if}

<style>
	.overflow-y-auto {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.overflow-y-auto::-webkit-scrollbar {
		display: none;
	}
</style>
