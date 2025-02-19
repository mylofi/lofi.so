<script lang="ts">
	export let sponsors: {
		url: string;
		image: string;
		name: string;
		tier: 'Partner' | 'Platinum' | 'Gold';
	}[];
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

	$: nextEventFromKV = eventData ? {
		url: eventData.discordUrl || eventData.registrationUrl,
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

	$: sponsorsByTier = sponsors.reduce(
		(acc, sponsor) => {
			if (!acc[sponsor.tier]) {
				acc[sponsor.tier] = [];
			}
			acc[sponsor.tier].push(sponsor);
			return acc;
		},
		{} as Record<TierType, typeof sponsors>
	);

	const tierHeights: Record<TierType, number> = {
		Partner: 120,
		Platinum: 100,
		Gold: 80
	};

	const tierOrder: TierType[] = ['Partner', 'Platinum', 'Gold'];
</script>

{#if variant === 'sidebar'}
	<div class="hidden xl:block {className}">
		<div class="absolute bottom-5 right-[max(0px,calc(50%-45rem))] top-24 z-20 w-[19.5rem] px-8">
			<div class="sticky top-32 h-[calc(100vh-9rem)] overflow-y-auto">
				{#if showNextEvent && activeNextEvent}
					<div
						class="mb-4 overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm border dark:border-white/10 border-gray-200 shadow-lg dark:shadow-xl p-6 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors duration-300"
					>
						<div class="mb-4 flex items-center gap-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
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
							</div>
							<span class="text-sm font-medium text-primary">Next Event</span>
						</div>
						
						<a href={activeNextEvent.url} class="group mb-4 block">
							<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white transition group-hover:text-primary">
								{activeNextEvent.name}
							</h3>
							<p class="text-sm text-gray-500 dark:text-gray-400">
								{activeNextEvent.date} • {activeNextEvent.time}
							</p>
						</a>

						<div class="border-t dark:border-white/10 border-gray-200 pt-4">
							<a
								href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
								class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors group"
								target="_blank"
								rel="noopener noreferrer"
							>
								<svg class="h-4 w-4 text-red-500 group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
								</svg>
								Watch Previous Meetups
							</a>
						</div>
					</div>
				{/if}

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
										src={sponsor.image}
										alt={sponsor.name}
										class="max-h-full max-w-full object-contain opacity-75 dark:opacity-50 grayscale dark:brightness-0 dark:invert transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0"
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
									<div class="flex h-full w-full items-center justify-center p-4" />
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
						src={sponsor.image}
						alt={sponsor.name}
						class="max-h-full max-w-full object-contain opacity-50 brightness-0 invert transition-all duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
					/>
				</a>
			{/each}
			{#if sponsors.length < 4}
				{#each Array(4 - sponsors.length) as _}
					<div
						class="aspect-video flex items-center justify-center rounded-lg bg-gray-800/20 dark:bg-gray-600/20 transition-colors hover:bg-gray-700/30 dark:hover:bg-gray-500/30 p-4"
					/>
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
						src={sponsor.image}
						alt={sponsor.name}
						class="max-h-full max-w-full object-contain opacity-50 brightness-0 invert transition-all duration-300 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
					/>
				</a>
			{/each}
			{#if sponsors.length < 4}
				{#each Array(4 - sponsors.length) as _}
					<div
						class="aspect-video flex items-center justify-center rounded-lg bg-gray-800/20 dark:bg-gray-600/20 transition-colors hover:bg-gray-700/30 dark:hover:bg-gray-500/30 p-3"
					/>
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
