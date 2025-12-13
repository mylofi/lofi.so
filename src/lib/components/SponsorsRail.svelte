<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';

	export let sponsors: {
		url: string;
		image: string;
		imageDark?: string;
		name: string;
		tier: 'Partner' | 'Platinum' | 'Gold';
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
	} | null = null;

	type TierType = 'Partner' | 'Platinum' | 'Gold';

	let isMeetupsOpen = true;
	let isConferencesOpen = true;

	onMount(() => {
		if (window.innerHeight < 900) {
			isMeetupsOpen = false;
			isConferencesOpen = false;
		}
	});

	$: nextEventFromKV = eventData ? {
		url: eventData.registrationUrl,
		name: 'Local First Meetup',
		date: new Date(eventData.date).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}),
		time: `${eventData.time} ${eventData.timezone}`
	} : undefined;

	$: activeNextEvent = nextEventFromKV || nextEvent;

	// Check if the event date has passed
	$: isEventPassed = eventData ? new Date(eventData.date) < new Date() : false;

	// $: sponsorsByTier = sponsors.reduce(
	// 	(acc, sponsor) => {
	// 		if (!acc[sponsor.tier]) {
	// 			acc[sponsor.tier] = [];
	// 		}
	// 		acc[sponsor.tier].push(sponsor);
	// 		return acc;
	// 	},
	// 	{} as Record<TierType, typeof sponsors>
	// );

	const tierHeights: Record<TierType, number> = {
		Partner: 120,
		Platinum: 100,
		Gold: 80
	};

	// const tierOrder: TierType[] = ['Partner', 'Platinum', 'Gold'];
</script>

{#if variant === 'sidebar'}
	<div class="hidden xl:block {className}">
		<div class="absolute bottom-5 right-[max(0px,calc(50%-45rem))] top-24 z-20 w-[19.5rem] px-8">
			<div class="sticky top-32 h-[calc(100vh-9rem)] overflow-y-auto">
				{#if showNextEvent && activeNextEvent}
					<div
						class="mb-4 overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm border dark:border-white/10 border-gray-200 shadow-lg dark:shadow-xl transition-colors duration-300"
					>
						<button
							class="flex w-full items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
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
										class="mb-2 text-lg font-semibold text-gray-900 dark:text-white transition group-hover:text-primary"
									>
										{activeNextEvent.name}
									</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">
										{activeNextEvent.date} • {activeNextEvent.time}
									</p>
								</a>

								<div class="border-t dark:border-white/10 border-gray-200 pt-4">
									{#if isEventPassed}
										<div class="flex flex-col gap-2">
											<a
												href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
												class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
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
											</a>
											<a
												href="https://discord.gg/lofi-so"
												class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
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
											</a>
										</div>
									{:else}
										<a
											href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
											class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
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
					class="mb-4 overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm border dark:border-white/10 border-gray-200 shadow-lg dark:shadow-xl transition-colors duration-300"
				>
					<button
						class="flex w-full items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
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
							<a
								href="https://www.youtube.com/playlist?list=PL4isNRKAwz2NCmk5oQq4qIBXreLLdAAJ_"
								class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
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
								class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
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
								LoFi Berlin Recap
							</a>
						</div>
					{/if}
				</div>

				<div class="space-y-2 [&_img]:transition-all [&_img]:duration-300">
					{#each sponsors as sponsor, i}
						<div class="space-y-1">
							<a
								href={sponsor.url}
								class="group block overflow-hidden bg-white/5 backdrop-blur-sm border dark:border-white/10 border-gray-200 shadow-lg dark:shadow-xl transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
								class:rounded-t-xl={i === 0}
								class:rounded-b-xl={i === sponsors.length - 1 && sponsors.length >= 4}
								style="height: {tierHeights[sponsor.tier]}px"
							>
								<div class="flex h-full w-full items-center justify-center p-4">
									<img
										src={getSponsorImage(sponsor)}
										alt={sponsor.name}
										class="max-h-full max-w-full object-contain opacity-50 dark:opacity-50 grayscale dark:brightness-0 dark:invert transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0"
									/>
								</div>
							</a>
						</div>
					{/each}
					{#if sponsors.length < 4}
						{#each Array(4 - sponsors.length) as _, i}
							<div class="space-y-1">
								<div
									class="block overflow-hidden bg-white/5 backdrop-blur-sm border dark:border-white/10 border-gray-200/50 transition-colors"
									class:rounded-t-xl={sponsors.length === 0 && i === 0}
									class:rounded-b-xl={i === 3 - sponsors.length}
									style="height: 80px"
								>
									<div class="flex h-full w-full items-center justify-center p-4"></div>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</div>
		</div>
	</div>
{:else if variant === 'horizontal'}
	<div class="w-full {className}">
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
			{#each sponsors as sponsor}
				<a
					href={sponsor.url}
					class="aspect-video group flex items-center justify-center rounded-lg bg-gray-800/50 p-4 transition-colors hover:bg-white"
				>
					<img
						src={getSponsorImage(sponsor)}
						alt={sponsor.name}
						class="max-h-full max-w-full object-contain opacity-50 grayscale invert transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:invert-0"
					/>
				</a>
			{/each}
			{#if sponsors.length < 4}
				{#each Array(4 - sponsors.length) as _}
					<div
						class="aspect-video flex items-center justify-center rounded-lg bg-gray-800/20 dark:bg-gray-600/20 transition-colors hover:bg-gray-700/30 dark:hover:bg-gray-500/30 p-4"
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
					class="aspect-video group flex items-center justify-center rounded-lg bg-gray-800/50 p-3 transition-colors hover:bg-white"
				>
					<img
						src={getSponsorImage(sponsor)}
						alt={sponsor.name}
						class="max-h-full max-w-full object-contain opacity-50 grayscale invert transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:invert-0"
					/>
				</a>
			{/each}
			{#if sponsors.length < 4}
				{#each Array(4 - sponsors.length) as _}
					<div
						class="aspect-video flex items-center justify-center rounded-lg bg-gray-800/20 dark:bg-gray-600/20 transition-colors hover:bg-gray-700/30 dark:hover:bg-gray-500/30 p-3"
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
