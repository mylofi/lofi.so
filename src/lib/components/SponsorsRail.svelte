<script lang="ts">
	export let nextEvent: { url: string; name: string; date: string; time: string };
	export let sponsors: {
		url: string;
		image: string;
		name: string;
		tier: 'Partner' | 'Platinum' | 'Gold';
	}[];

	type TierType = 'Partner' | 'Platinum' | 'Gold';

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

<!-- Right Sidebar - Sponsors -->
<div class="hidden xl:block">
	<div class="absolute bottom-0 right-[max(0px,calc(50%-45rem))] top-24 z-20 w-[19.5rem] px-8">
		<div class="sticky top-24 overflow-y-auto" style="max-height: calc(100vh - 6rem);">
			<!-- Next Event -->
			<div
				class="mb-4 overflow-hidden rounded-lg bg-gradient-to-b from-[#ff3e00]/10 to-gray-800/50 backdrop-blur-sm"
			>
				<a href={nextEvent.url} class="group block">
					<div class="p-6">
						<div class="mb-4 flex items-center gap-3">
							<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
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
						<h3 class="mb-2 text-lg font-semibold transition group-hover:text-primary">
							{nextEvent.name}
						</h3>
						<p class="text-sm text-gray-400">{nextEvent.date} • {nextEvent.time}</p>
					</div>
				</a>
			</div>

			<!-- Sponsors Stack -->
			<div class="space-y-2 [&_img]:transition-all [&_img]:duration-300">
				{#each sponsors as sponsor, i}
					<div class="space-y-1">
						<a
							href={sponsor.url}
							class="group block overflow-hidden bg-gray-800/50 transition-colors hover:bg-white"
							class:rounded-t-xl={i === 0}
							class:rounded-b-xl={i === sponsors.length - 1}
							style="height: {tierHeights[sponsor.tier]}px"
						>
							<div class="flex h-full w-full items-center justify-center p-4">
								<img
									src={sponsor.image}
									alt={sponsor.name}
									class="max-h-full max-w-full object-contain opacity-50 brightness-0 invert group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0"
								/>
							</div>
						</a>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.overflow-y-auto {
		scrollbar-width: none;
		-ms-overflow-style: none;
	}
	.overflow-y-auto::-webkit-scrollbar {
		display: none;
	}
</style>
