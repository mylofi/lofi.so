<script lang="ts">
	import type { EventGraphicSponsor } from '$lib/types/event-graphic';

	export let sponsors: EventGraphicSponsor[] = [];
	export let compact = false;
	export let inline = false;
	export let showHeader = true;
	export let minimal = false;
	export let singleRow = false;
	export let className = '';
	export let logoHeightPx: number | null = null;

	$: orderedSponsors = [...sponsors].sort((a, b) => a.order - b.order);

	const getLogoClasses = (): string => {
		if (logoHeightPx) return 'h-auto max-h-full';
		if (singleRow) return 'max-h-6 min-h-4 sm:max-h-7';
		if (inline) return 'max-h-7 min-h-5 sm:max-h-8';
		if (minimal && !compact) {
			return 'h-7 max-h-7 sm:h-8 sm:max-h-8 md:h-[30px] md:max-h-[30px] xl:h-[34px] xl:max-h-[34px]';
		}
		return compact ? 'max-h-8 min-h-6' : 'max-h-10 min-h-8';
	};

	const getSponsorItemClasses = (isRowItem = false): string => {
		const surfaceClasses = minimal
			? 'bg-transparent hover:bg-white/[0.06] border-white/20 hover:border-white/40'
			: 'bg-white/8 hover:bg-white/12 border-white/25';
		const sizeClasses =
			isRowItem || inline
				? 'min-h-10 px-2 py-1.5'
				: minimal && !compact
					? 'h-full min-h-0 overflow-hidden px-2 py-1 md:px-2.5 md:py-1.5'
					: 'min-h-12 px-3 py-2';
		return `${surfaceClasses} flex items-center justify-center rounded-lg border transition ${sizeClasses}`;
	};

	$: logoStyle = logoHeightPx
		? `height:min(${logoHeightPx}px,100%);max-height:${logoHeightPx}px;width:auto;`
		: '';
</script>

<div
	class={`flex min-h-0 flex-col ${minimal ? 'rounded-xl border border-white/25 bg-black/5 p-2.5 sm:p-3' : 'rounded-2xl border border-white/35 bg-black/10 p-4'} backdrop-blur-sm ${className}`}
>
	{#if showHeader}
		<div class="mb-3 flex items-center justify-between">
			<h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-white/95">Sponsors</h3>
			<span class="text-[10px] uppercase tracking-[0.16em] text-white/70">Ordered</span>
		</div>
	{/if}

	{#if orderedSponsors.length > 0}
		{#if singleRow}
			<div class="flex items-center gap-2 overflow-x-auto pb-1">
				{#each orderedSponsors as sponsor}
					<a
						href={sponsor.url}
						target="_blank"
						rel="noopener noreferrer"
						class={`${getSponsorItemClasses(true)} min-w-[4.25rem] flex-1`}
					>
						<img
							src={sponsor.logoLight}
							alt={sponsor.name}
							class={`h-auto w-auto max-w-full object-contain ${getLogoClasses()}`}
							style={logoStyle}
						/>
					</a>
				{/each}
			</div>
		{:else}
			<div
				class="grid gap-2"
				class:flex-1={minimal && !inline}
				class:h-full={minimal && !inline}
				class:min-h-0={minimal && !inline}
				class:auto-rows-fr={minimal && !inline}
				class:grid-cols-4={inline}
				class:grid-cols-2={!inline && compact && orderedSponsors.length > 3}
				class:grid-cols-1={!inline && (!compact || orderedSponsors.length <= 3)}
			>
				{#each orderedSponsors as sponsor}
					<a
						href={sponsor.url}
						target="_blank"
						rel="noopener noreferrer"
						class={getSponsorItemClasses()}
					>
						<img
							src={sponsor.logoLight}
							alt={sponsor.name}
							class={`h-auto w-auto max-w-full object-contain ${getLogoClasses()}`}
							style={logoStyle}
						/>
					</a>
				{/each}
			</div>
		{/if}
	{:else}
		<div
			class="rounded-lg border border-dashed border-white/35 px-3 py-4 text-center text-xs text-white/75"
		>
			Add at least one sponsor to render exports.
		</div>
	{/if}
</div>
