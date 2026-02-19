<script lang="ts">
	import type { EventGraphicSpec } from '$lib/types/event-graphic';
	import { getPrimarySocial, getSocialUrl } from '$lib/utils/event-graphic-spec';

	// Legacy props (backward compat)
	export let speakerData: {
		name: string;
		twitterHandle: string;
		talk: string;
		bio: string;
		talkPoints: string[];
		image: string;
	} | null = null;
	export let eventNumber: number = 0;
	export let date: string = '';
	export let time: string = '';
	export let timezone: string = '';

	// Spec-driven props
	export let spec: EventGraphicSpec | null = null;
	export let speakerIndex: number = 0;

	// Resolve speaker data from spec or legacy props
	$: speaker = spec && spec.speakers[speakerIndex]
		? (() => {
				const s = spec.speakers[speakerIndex];
				const primary = getPrimarySocial(s);
				return {
					name: s.name,
					handle: primary?.handle || '',
					handleUrl: primary ? getSocialUrl(primary.platform, primary.handle) : '#',
					talk: s.talk,
					bio: s.bio,
					talkPoints: s.bullets,
					image: s.avatar
				};
			})()
		: speakerData
			? {
					name: speakerData.name,
					handle: speakerData.twitterHandle || '',
					handleUrl: speakerData.twitterHandle ? `https://x.com/${speakerData.twitterHandle.replace(/^@/, '')}` : '#',
					talk: speakerData.talk,
					bio: speakerData.bio,
					talkPoints: speakerData.talkPoints,
					image: speakerData.image
				}
			: null;

	// Resolve event metadata
	$: resolvedEventNumber = spec?.event.number || eventNumber;
	$: formattedDateTime = spec
		? spec.event.displayDateTime
		: (() => {
				const fd = date
					? new Date(date).toLocaleDateString('en-US', {
							weekday: 'long',
							day: 'numeric',
							month: 'long',
							year: 'numeric'
						})
					: '';
				const ft = time ? `${time.split(':')[0]}${time.split(':')[0] >= '12' ? 'PM' : 'AM'}` : '';
				return `${fd} @ ${ft} ${timezone}`;
			})();

	$: filteredPoints = speaker?.talkPoints.filter((p) => p) || [];

	// Conic gradient rotation offset per speaker for visual variety
	$: haloRotation = speakerIndex * 120;
</script>

{#if speaker}
<main class="inline-block">
	<!--
		Fixed 1200×675 card for agenda_regular export target.
		Two-column layout: left=avatar+identity, right=talk content.
	-->
	<div
		class="relative flex h-[675px] w-[1200px] overflow-hidden rounded-3xl"
		style="background: #0d1117;"
	>
		<!-- ── Gradient layers ─────────────────────────────── -->
		<div
			class="pointer-events-none absolute inset-0"
			style="background: radial-gradient(ellipse 70% 90% at -5% 50%, #5865f2 0%, transparent 55%), radial-gradient(ellipse 60% 60% at 110% 100%, #4f46e5 0%, transparent 50%);"
		></div>

		<!-- ── Dot texture ─────────────────────────────────── -->
		<div class="pointer-events-none absolute inset-0 opacity-[0.05]">
			<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<pattern id="dot-pattern-speaker" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
						<circle cx="1.5" cy="1.5" r="1.5" fill="white" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#dot-pattern-speaker)" />
			</svg>
		</div>

		<!-- ── Left column: avatar + identity ─────────────── -->
		<div class="relative flex w-[380px] flex-shrink-0 flex-col items-center justify-center px-12 py-12">

			<!-- Large avatar with conic halo -->
			<div class="relative mb-6" style="width: 220px; height: 220px;">
				<!-- Halo ring -->
				<div
					class="absolute inset-[-4px] rounded-full"
					style="background: conic-gradient(from {haloRotation}deg, #5865f2, #818cf8, #a78bfa, #4f46e5, #5865f2);"
				></div>
				<!-- Dark gap ring -->
				<div class="absolute inset-[3px] rounded-full bg-[#0d1117]"></div>
				<!-- Photo -->
				<div class="absolute inset-[8px] overflow-hidden rounded-full">
					{#if speaker.image}
						<img
							src={speaker.image}
							alt={speaker.name}
							class="h-full w-full object-cover object-center"
						/>
					{:else}
						<div class="flex h-full w-full items-center justify-center bg-white/5">
							<svg class="h-16 w-16 text-white/20" viewBox="0 0 24 24" fill="currentColor">
								<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
							</svg>
						</div>
					{/if}
				</div>
			</div>

			<!-- Name + handle -->
			<div class="text-center">
				<h2 class="mb-1 text-2xl font-extrabold leading-tight text-white">
					{speaker.name}
				</h2>
				{#if speaker.handle}
					<p class="text-sm font-medium text-[#818cf8]">{speaker.handle}</p>
				{/if}
			</div>

			<!-- Bio -->
			{#if speaker.bio}
				<p class="mt-4 line-clamp-4 text-center text-sm leading-relaxed text-white/50">
					{speaker.bio}
				</p>
			{/if}

			<!-- LoFi branding at bottom of left column -->
			<div class="absolute bottom-10 flex items-center gap-2">
				<img src="/images/logo.png" alt="LoFi" class="h-5 w-5 opacity-60" />
				<span class="text-xs font-bold tracking-wider text-white/30">
					LoFi/<span class="text-[#5865f2]">{resolvedEventNumber}</span>
				</span>
			</div>
		</div>

		<!-- ── Vertical divider ────────────────────────────── -->
		<div class="my-12 w-px flex-shrink-0 bg-white/10"></div>

		<!-- ── Right column: talk details ─────────────────── -->
		<div class="relative flex flex-1 flex-col justify-center px-12 py-12">

			<!-- Event label + date -->
			<div class="mb-6">
				<p class="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
					Speaking at LoFi/{resolvedEventNumber}
				</p>
				<p class="text-sm font-semibold text-[#5865f2]">{formattedDateTime}</p>
			</div>

			<!-- Accent bar + Talk title -->
			<div class="mb-6">
				<div class="mb-4 h-0.5 w-10 rounded-full bg-[#5865f2]"></div>
				<h1 class="text-[2rem] font-extrabold leading-tight tracking-tight text-white">
					{speaker.talk}
				</h1>
			</div>

			<!-- Bullet points -->
			{#if filteredPoints.length > 0}
				<div class="space-y-3">
					{#each filteredPoints as point}
						<div class="flex items-start gap-3">
							<div class="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#5865f2]"></div>
							<p class="text-base leading-snug text-white/65">{point}</p>
						</div>
					{/each}
				</div>
			{/if}

			<!-- lofi.so wordmark bottom-right -->
			<div class="absolute bottom-10 right-12">
				<span class="text-[10px] font-semibold tracking-[0.15em] text-white/15 uppercase">lofi.so</span>
			</div>
		</div>
	</div>
</main>
{/if}
