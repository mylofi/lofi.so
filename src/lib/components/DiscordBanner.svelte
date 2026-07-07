<!-- DiscordBanner.svelte — Compact 800x320 layout for Discord server banner -->
<script lang="ts">
	import type { EventGraphicSpec } from '$lib/types/event-graphic';
	import { getPrimarySocial, getSocialUrl, getDisplayHandle, normalizeSponsors } from '$lib/utils/event-graphic-spec';
	import sponsorsData from '$lib/data/sponsors.json';

	export let spec: EventGraphicSpec | null = null;

	$: title = spec?.event.title || 'Meetup';
	$: eventNumber = spec?.event.number || 0;
	$: logoUrl = spec?.event.links.logo || '/images/logo.png';
	$: displayDateTime = spec?.event.displayDateTime || '';
	$: speakers = spec?.speakers || [];
	$: sponsors = spec?.sponsors || normalizeSponsors(sponsorsData.sponsors);
</script>

{#if spec && eventNumber}
	<div
		class="relative flex h-[320px] w-[800px] flex-col overflow-hidden"
		style="background: #0d1117;"
	>
		<!-- Gradient layers -->
		<div
			class="pointer-events-none absolute inset-0"
			style="background: radial-gradient(ellipse 80% 80% at 110% -20%, #5865f2 0%, transparent 55%), radial-gradient(ellipse 70% 60% at -10% 110%, #4f46e5 0%, transparent 50%);"
		></div>

		<!-- Dot texture -->
		<div class="pointer-events-none absolute inset-0 opacity-[0.06]">
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="db-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
						<circle cx="1.5" cy="1.5" r="1.5" fill="white" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#db-dots)" />
			</svg>
		</div>

		<!-- Diagonal accent stripe -->
		<div
			class="pointer-events-none absolute"
			style="top: -60%; right: -5%; width: 38%; height: 220%; background: linear-gradient(180deg, #5865f2 0%, #4f46e5 100%); opacity: 0.07; transform: rotate(-12deg); border-radius: 40px;"
		></div>

		<!-- Content -->
		<div class="relative flex flex-1 flex-col items-center justify-center px-8">

			<!-- Header -->
			<div class="mb-3 flex items-center gap-3">
				<img src={logoUrl} alt="LoFi" class="h-8 w-8 flex-shrink-0" />
				<div>
					<p class="text-[8px] font-semibold uppercase tracking-[0.2em] text-white/40">
						Local First Software
					</p>
					<h1 class="text-xl font-extrabold leading-tight tracking-tight text-white">
						LoFi/<span class="text-[#5865f2]">{eventNumber}</span> — {title}
					</h1>
				</div>
			</div>

			<!-- Date/time chip -->
			<div class="mb-5 flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
				<svg class="h-3 w-3 flex-shrink-0 text-[#5865f2]" viewBox="0 0 24 24" fill="currentColor">
					<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
				</svg>
				<span class="text-xs font-semibold text-white/80">{displayDateTime}</span>
			</div>

			<!-- Speaker avatars row -->
			<div class="flex items-center gap-6">
				{#each speakers.slice(0, 4) as speaker, i}
					<div class="flex flex-col items-center gap-1.5">
						<!-- Avatar with gradient halo -->
						<div class="relative" style="width: 64px; height: 64px;">
							<div
								class="absolute inset-[-3px] rounded-full"
								style="background: conic-gradient(from {i * 120}deg, #5865f2, #818cf8, #4f46e5, #5865f2); opacity: 0.7;"
							></div>
							<div class="absolute inset-[2px] overflow-hidden rounded-full bg-[#0d1117]">
								{#if speaker.avatar}
									<img
										src={speaker.avatar}
										alt={speaker.name}
										class="h-full w-full rounded-full object-cover object-center"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center rounded-full bg-white/5">
										<svg class="h-1/2 w-1/2 text-white/20" viewBox="0 0 24 24" fill="currentColor">
											<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
										</svg>
									</div>
								{/if}
							</div>
						</div>
						<!-- Name -->
						<span class="max-w-[120px] truncate text-center text-[11px] font-semibold text-white/80">
							{speaker.name}
						</span>
					</div>
				{/each}
			</div>

			<!-- Sponsor logos row -->
			{#if sponsors.length > 0}
				<div class="mt-4 flex items-center gap-4">
					<span class="text-[7px] font-semibold uppercase tracking-[0.18em] text-white/25">Sponsored by</span>
					{#each sponsors.slice(0, 4) as sponsor}
						<img src={sponsor.logoDark ?? sponsor.logoLight} alt={sponsor.name} class="h-4 w-auto object-contain opacity-40" />
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
