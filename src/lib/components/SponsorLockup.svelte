<script lang="ts">
	import { theme } from '$lib/stores/themeStore';
	import type { EventGraphicSponsor } from '$lib/types/event-graphic';

export let sponsors: EventGraphicSponsor[] = [];
export let variant: 'strip' | 'grid' | 'sidebar' = 'strip';
export let maxVisible: number = 8;
export let showSponsorLabel: boolean = false;
const SIDEBAR_CARD_HEIGHT = 88;

	function getSponsorImage(sponsor: EventGraphicSponsor): string {
		if (sponsor.logoDark && $theme === 'dark') {
			return sponsor.logoDark;
		}
		return sponsor.logoLight;
	}

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
						src={getSponsorImage(sponsor)}
						alt={sponsor.name}
						class="h-auto max-h-16 w-28 object-contain"
					/>
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
					src={getSponsorImage(sponsor)}
					alt={sponsor.name}
					class="max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-[1.03]"
				/>
			</a>
		{/each}
		{#if sorted.length < 4}
			{#each Array(4 - sorted.length) as _}
				<div
					class="flex aspect-video items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-900/70"
				></div>
			{/each}
		{/if}
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
					class:rounded-b-xl={i === sorted.length - 1 && sorted.length >= 4}
					style="height: {SIDEBAR_CARD_HEIGHT}px"
				>
					<div class="flex h-full w-full items-center justify-center p-4">
						<img
							src={getSponsorImage(sponsor)}
							alt={sponsor.name}
							class="max-h-full max-w-full object-contain transition duration-300 group-hover:scale-[1.03]"
						/>
					</div>
				</a>
			</div>
		{/each}
		{#if sorted.length < 4}
			{#each Array(4 - sorted.length) as _, i}
				<div class="space-y-1">
					<div
						class="block overflow-hidden border border-dashed border-slate-200/90 bg-white/70 backdrop-blur-sm transition-colors dark:border-gray-800 dark:bg-gray-900/60"
						class:rounded-t-xl={sorted.length === 0 && i === 0}
						class:rounded-b-xl={i === 3 - sorted.length}
						style="height: {SIDEBAR_CARD_HEIGHT}px"
					>
						<div class="flex h-full w-full items-center justify-center p-4"></div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
{/if}
