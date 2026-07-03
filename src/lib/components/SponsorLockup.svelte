<script lang="ts">
	import type { EventGraphicSponsor } from '$lib/types/event-graphic';

export let sponsors: EventGraphicSponsor[] = [];
export let variant: 'strip' | 'grid' | 'sidebar' = 'strip';
export let maxVisible: number = 8;
export let showSponsorLabel: boolean = false;
const SIDEBAR_CARD_HEIGHT = 88;

	$: sorted = [...sponsors].sort((a, b) => a.order - b.order).slice(0, maxVisible);
</script>

{#if variant === 'strip'}
	<!-- Horizontal strip for inside event graphic cards -->
	<div class="flex flex-1 flex-col items-center pt-4">
		{#if showSponsorLabel}
			<h4 class="whitespace-nowrap text-center text-lg font-bold text-white/90">Sponsored by</h4>
		{/if}
		<div class="flex flex-1 flex-col items-center justify-around py-2">
			{#each sorted as sponsor}
				<a
					href={sponsor.url}
					target="_blank"
					rel="noopener noreferrer"
					class="transition hover:opacity-90"
				>
					<img
						src={sponsor.logoLight}
						alt={sponsor.name}
						class="h-auto max-h-16 w-28 object-contain {sponsor.logoDark ? 'dark:hidden' : ''}"
					/>
					{#if sponsor.logoDark}
						<img
							src={sponsor.logoDark}
							alt={sponsor.name}
							class="hidden h-auto max-h-16 w-28 object-contain dark:block"
						/>
					{/if}
				</a>
			{/each}
		</div>
	</div>
{:else if variant === 'grid'}
	<!-- 2x2 responsive grid for standalone display -->
	<div class="grid grid-cols-2 gap-4">
		{#each sorted as sponsor}
			<a
				href={sponsor.url}
				target="_blank"
				rel="noopener noreferrer"
				class="group flex aspect-video items-center justify-center rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-primary/20 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800"
			>
				<img
					src={sponsor.logoLight}
					alt={sponsor.name}
					class="max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-[1.03] {sponsor.logoDark
						? 'dark:hidden'
						: ''}"
				/>
				{#if sponsor.logoDark}
					<img
						src={sponsor.logoDark}
						alt={sponsor.name}
						class="hidden max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-[1.03] dark:block"
					/>
				{/if}
			</a>
		{/each}
	</div>
{:else if variant === 'sidebar'}
	<!-- Vertical stack for SponsorsRail -->
	<div class="space-y-2 [&_img]:transition-all [&_img]:duration-300">
		{#each sorted as sponsor, i}
			<div class="space-y-1">
				<a
					href={sponsor.url}
					class="group block overflow-hidden border border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-sm transition-colors hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-900/90 dark:hover:bg-gray-800/80"
					class:rounded-t-xl={i === 0}
					class:rounded-b-xl={i === sorted.length - 1}
					style="height: {SIDEBAR_CARD_HEIGHT}px"
				>
					<div class="flex h-full w-full items-center justify-center p-4">
						<img
							src={sponsor.logoLight}
							alt={sponsor.name}
							class="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.03] {sponsor.logoDark
								? 'dark:hidden'
								: ''}"
						/>
						{#if sponsor.logoDark}
							<img
								src={sponsor.logoDark}
								alt={sponsor.name}
								class="hidden max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.03] dark:block"
							/>
						{/if}
					</div>
				</a>
			</div>
		{/each}
	</div>
{/if}
