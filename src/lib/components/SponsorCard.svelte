<script lang="ts">
	import type { EventGraphicSponsor } from '$lib/types/event-graphic';

	export let sponsors: EventGraphicSponsor[] = [];
	export let eventNumber: number = 0;
	export let displayDateTime: string = '';

	$: sorted = [...sponsors].sort((a, b) => a.order - b.order);
</script>

<main class="inline-block">
	<div
		class="relative flex h-[675px] w-[1200px] flex-col rounded-3xl bg-gradient-to-t from-primary to-discord text-white shadow-[0_0_30px_-10px_theme(colors.primary)]"
	>
		<!-- Background Pattern -->
		<div class="pointer-events-none absolute inset-0 rounded-3xl opacity-10">
			<svg width="100%" height="100%">
				<defs>
					<pattern
						id="dot-pattern-sponsor"
						x="0"
						y="0"
						width="30"
						height="30"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1.2" fill="currentColor" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#dot-pattern-sponsor)" />
			</svg>
		</div>

		<!-- Content -->
		<div class="relative z-10 flex h-full flex-col items-center justify-center px-12 py-10">
			<!-- Header -->
			<div class="mb-6 flex items-center gap-3">
				<img src="/images/logo.png" alt="LoFi" class="h-14 w-14" />
				<div>
					<h1 class="m-0 text-4xl font-bold">LoFi/{eventNumber}</h1>
					{#if displayDateTime}
						<p class="text-lg font-medium text-white/80">{displayDateTime}</p>
					{/if}
				</div>
			</div>

			<!-- Sponsored by heading -->
			<h2 class="mb-8 text-2xl font-bold text-white/90">Sponsored by</h2>

			<!-- Sponsor Grid -->
			<div class="grid grid-cols-2 gap-8">
				{#each sorted as sponsor}
					<div
						class="flex items-center justify-center rounded-2xl bg-white/10 px-10 py-6 backdrop-blur-sm"
					>
						<img
							src={sponsor.logoLight}
							alt={sponsor.name}
							class="h-auto max-h-20 w-auto max-w-[200px] object-contain"
						/>
					</div>
				{/each}
			</div>

			<!-- CTA -->
			<p class="mt-8 text-lg text-white/70">lofi.so</p>
		</div>
	</div>
</main>
