<script lang="ts">
	import SponsorLockup from '$lib/components/SponsorLockup.svelte';
	import type { EventGraphicSpec } from '$lib/types/event-graphic';

	export let eventSpec: EventGraphicSpec | null = null;
</script>

{#if eventSpec}
	<main
		class="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-discord shadow-[0_0_40px_-14px_theme(colors.primary)]"
	>
		<div class="pointer-events-none absolute inset-0 opacity-20">
			<svg width="100%" height="100%">
				<defs>
					<pattern
						id="sponsor-dot-pattern"
						x="0"
						y="0"
						width="26"
						height="26"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1" fill="white" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#sponsor-dot-pattern)" />
			</svg>
		</div>

		<div class="relative grid h-full min-h-[420px] grid-cols-12 gap-4 p-4 sm:p-5">
			<section
				class="col-span-12 flex flex-col rounded-2xl border border-white/45 bg-white/95 p-4 text-gray-900 shadow-xl md:col-span-7"
			>
				<div class="mb-3 flex items-center gap-2">
					<img
						src={eventSpec.event.links.logoUrl || '/images/logo.png'}
						alt="LoFi"
						class="h-10 w-10 rounded-md bg-white/90 p-1"
					/>
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
						Sponsor Companion
					</p>
				</div>

				<h2 class="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl">
					LoFi/{eventSpec.event.number}
					{eventSpec.event.title}
				</h2>
				<p class="mt-2 text-sm font-semibold text-gray-700">{eventSpec.event.displayDateTime}</p>

				<div class="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-3">
					<p class="text-sm font-semibold text-gray-900">Thanks to our sponsors</p>
					<p class="mt-1 text-sm text-gray-700">
						{eventSpec.sponsors.map((sponsor) => sponsor.name).join(', ')}
					</p>
				</div>

				<div class="mt-auto flex flex-wrap gap-2 pt-5">
					<a
						href={eventSpec.event.links.discordUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
					>
						Join Discord
					</a>
					<a
						href={eventSpec.event.links.calendarUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:bg-gray-100"
					>
						Add to Calendar
					</a>
				</div>
			</section>

			<aside class="col-span-12 md:col-span-5">
				<SponsorLockup sponsors={eventSpec.sponsors} className="h-full" />
			</aside>
		</div>
	</main>
{:else}
	<div
		class="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-300/80 bg-slate-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900"
	>
		<p class="text-sm text-slate-500 dark:text-slate-300">
			No event spec available for sponsor card.
		</p>
	</div>
{/if}
