<script lang="ts">
	import type { EventGraphicSponsor } from '$lib/types/event-graphic';

	export let sponsors: EventGraphicSponsor[] = [];
	export let compact = false;
	export let className = '';

	$: orderedSponsors = [...sponsors].sort((a, b) => a.order - b.order);

	const getLogoClasses = (): string => {
		return compact ? 'max-h-8 min-h-6' : 'max-h-10 min-h-8';
	};
</script>

<div class={`rounded-2xl border border-white/35 bg-black/10 p-4 backdrop-blur-sm ${className}`}>
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-white/95">Sponsors</h3>
		<span class="text-[10px] uppercase tracking-[0.16em] text-white/70">Ordered</span>
	</div>

	{#if orderedSponsors.length > 0}
		<div
			class="grid gap-2"
			class:grid-cols-2={compact && orderedSponsors.length > 3}
			class:grid-cols-1={!compact || orderedSponsors.length <= 3}
		>
			{#each orderedSponsors as sponsor}
				<a
					href={sponsor.url}
					target="_blank"
					rel="noopener noreferrer"
					class="flex min-h-12 items-center justify-center rounded-lg border border-white/30 bg-white/90 px-3 py-2 transition hover:bg-white"
				>
					<img
						src={sponsor.logoLight}
						alt={sponsor.name}
						class={`h-auto w-auto max-w-full object-contain ${getLogoClasses()}`}
					/>
				</a>
			{/each}
		</div>
	{:else}
		<div
			class="rounded-lg border border-dashed border-white/35 px-3 py-4 text-center text-xs text-white/75"
		>
			Add at least one sponsor to render exports.
		</div>
	{/if}
</div>
