<!-- EventGraphic.svelte -->
<script lang="ts">
	import type { EventData } from '$lib/server/kv';
	import type { EventGraphicSpec, EventGraphicSponsor } from '$lib/types/event-graphic';
	import { toEventGraphicSpec, getPrimarySocial, getSocialUrl, normalizeSponsors } from '$lib/utils/event-graphic-spec';
	import sponsorsData from '$lib/data/sponsors.json';
	import { formatYMDLong, formatHHMM12 } from '$lib/utils/date';

	export let eventData: EventData | null = null;
	export let spec: EventGraphicSpec | null = null;

	// Derive spec from eventData if not provided directly
	$: resolvedSpec = spec
		? spec
		: eventData
			? toEventGraphicSpec(eventData, undefined, sponsorsData.sponsors)
			: null;

	$: title = resolvedSpec?.event.title || eventData?.title || 'Meetup';
	$: eventNumber = resolvedSpec?.event.number || eventData?.eventNumber || 0;
	$: logoUrl = resolvedSpec?.event.links.logo || eventData?.logoUrl || '/images/logo.png';

	// Sponsors from spec (order-sorted) or fallback to raw data
	$: sponsors = resolvedSpec?.sponsors || normalizeSponsors(sponsorsData.sponsors);

	// Date/time display
	$: displayDateTime = resolvedSpec
		? resolvedSpec.event.displayDateTime
		: eventData
			? `${eventData.date ? formatYMDLong(eventData.date) : ''} @ ${eventData.time ? formatHHMM12(eventData.time) : ''} ${eventData.timezone || ''}`
			: '';

	// Event passed detection
	$: startTimeISO = resolvedSpec?.event.startTimeISO || eventData?.startTimeISO;
	$: startTimeDate = startTimeISO ? new Date(startTimeISO) : null;
	$: isEventPassed = startTimeDate
		? startTimeDate.getTime() <= Date.now()
		: eventData?.date
			? new Date(eventData.date) < new Date()
			: false;

	// Speakers from spec or legacy
	$: speakers = resolvedSpec
		? resolvedSpec.speakers.map((s) => {
				const primary = getPrimarySocial(s);
				return {
					name: s.name,
					handle: primary?.handle || '',
					handleUrl: primary ? getSocialUrl(primary.platform, primary.handle) : '#',
					talk: s.talk,
					image: s.avatar
				};
			})
		: (eventData?.speakers || []).map((s) => ({
				name: s.name,
				handle: s.twitterHandle || '',
				handleUrl: s.twitterHandle ? `https://x.com/${s.twitterHandle.replace(/^@/, '')}` : '#',
				talk: s.talk,
				image: s.image
			}));

	// Links
	$: registrationUrl = resolvedSpec?.event.links.registration || eventData?.registrationUrl || '';
	$: discordUrl = resolvedSpec?.event.links.discord || eventData?.discordUrl || '';
	$: calendarUrl = resolvedSpec?.event.links.calendar || eventData?.calendarUrl || '';
</script>

{#if (resolvedSpec || eventData) && eventNumber}
	<main id="graphic" class="flex h-full items-center justify-center">
		<!--
			Fixed-ratio outer shell: 1200×675 (16:9). All internal sizing is
			absolute or viewport-relative so the exported PNG is pixel-perfect.
		-->
		<div
			class="relative w-full overflow-hidden rounded-2xl"
			style="aspect-ratio: 16/9; background: #0d1117;"
		>
			<!-- ── Gradient background ───────────────────────────── -->
			<div
				class="pointer-events-none absolute inset-0"
				style="background: radial-gradient(ellipse 80% 80% at 110% -20%, #5865f2 0%, transparent 55%), radial-gradient(ellipse 70% 60% at -10% 110%, #4f46e5 0%, transparent 50%), #0d1117;"
			></div>

			<!-- ── Dot texture ───────────────────────────────────── -->
			<div class="pointer-events-none absolute inset-0 opacity-[0.06]">
				<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
					<defs>
						<pattern id="eg-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
							<circle cx="1.5" cy="1.5" r="1.5" fill="white" />
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#eg-dots)" />
				</svg>
			</div>

			<!-- ── Diagonal accent stripe ────────────────────────── -->
			<div
				class="pointer-events-none absolute"
				style="top: -60%; right: -5%; width: 38%; height: 220%; background: linear-gradient(180deg, #5865f2 0%, #4f46e5 100%); opacity: 0.07; transform: rotate(-12deg); border-radius: 40px;"
			></div>

			<!-- Past Event badge -->
			{#if isEventPassed}
				<div class="absolute left-5 top-5 z-20 flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
					<div class="h-1.5 w-1.5 rounded-full bg-red-400"></div>
					<span class="text-[10px] font-semibold uppercase tracking-widest text-white/70">Past Event</span>
				</div>
			{/if}

			<!-- ═══════════════════════════════════════════════════ -->
			<!--  CONTENT GRID: left=speakers 70%, right=sidebar 30% -->
			<!-- ═══════════════════════════════════════════════════ -->
			<div class="relative flex h-full w-full">

				<!-- ── LEFT: Event info + Speakers ──────────────── -->
				<div class="flex flex-1 flex-col px-[4%] py-[5%]">

					<!-- Header row -->
					<div class="mb-[3%] flex items-center gap-3">
						<img
							src={logoUrl}
							alt="LoFi"
							class="h-[7%] w-auto flex-shrink-0"
							style="height: clamp(28px, 5.5cqh, 48px);"
						/>
						<div>
							<p class="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
								Local First Software
							</p>
							<h1 class="text-[clamp(16px,2.4cqw,28px)] font-extrabold leading-tight tracking-tight text-white">
								LoFi/<span class="text-[#5865f2]">{eventNumber}</span> — {title}
							</h1>
						</div>
					</div>

					<!-- Date/time chip -->
					<div class="mb-[4%] flex items-center gap-2">
						<div class="flex items-center gap-1.5 rounded-full bg-white/8 px-3 py-1 ring-1 ring-white/10">
							<svg class="h-3 w-3 text-[#5865f2]" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
							</svg>
							{#if isEventPassed}
								<span class="text-[clamp(9px,1.1cqw,13px)] font-medium text-white/40 line-through">{displayDateTime}</span>
							{:else}
								<span class="text-[clamp(9px,1.1cqw,13px)] font-semibold text-white/80">{displayDateTime}</span>
							{/if}
						</div>
						{#if isEventPassed}
							<span class="text-[clamp(8px,1cqw,11px)] font-medium text-white/30">Event has ended</span>
						{/if}
					</div>

					<!-- Divider -->
					<div class="mb-[3%] flex items-center gap-3">
						<span class="text-[clamp(8px,0.9cqw,11px)] font-semibold uppercase tracking-[0.18em] text-white/30">
							{isEventPassed ? 'Recorded Talks' : 'Featured Speakers'}
						</span>
						<div class="h-px flex-1 bg-white/10"></div>
					</div>

					<!-- ── SPEAKER CARDS ─────────────────────────── -->
					<div class="flex flex-1 flex-col justify-around gap-[2%]">
						{#each speakers as speaker, i}
							<div class="group flex items-center gap-[3%]">
								<!-- Avatar -->
								<div
									class="relative flex-shrink-0 rounded-full ring-2 ring-white/10 ring-offset-2 ring-offset-transparent"
									style="width: clamp(52px, 11cqw, 96px); height: clamp(52px, 11cqw, 96px);"
								>
									<!-- Gradient halo -->
									<div
										class="absolute inset-[-3px] rounded-full opacity-60"
										style="background: conic-gradient(from {i * 120}deg, #5865f2, #818cf8, #4f46e5, #5865f2);"
									></div>
									<div class="absolute inset-[2px] overflow-hidden rounded-full bg-[#0d1117]">
										<img
											src={speaker.image || ''}
											alt={speaker.name}
											class="h-full w-full rounded-full object-cover object-center"
										/>
									</div>
									<!-- Speaker number badge -->
									<div
										class="absolute -bottom-0.5 -right-0.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#5865f2] text-[9px] font-bold text-white ring-1 ring-[#0d1117]"
									>
										{i + 1}
									</div>
								</div>

								<!-- Speaker info -->
								<div class="min-w-0 flex-1">
									<div class="mb-0.5 flex items-baseline gap-2">
										<h3 class="truncate text-[clamp(11px,1.5cqw,18px)] font-bold leading-tight text-white">
											{speaker.name}
										</h3>
										{#if speaker.handle}
											<span class="flex-shrink-0 text-[clamp(8px,0.9cqw,11px)] font-medium text-white/35">
												{speaker.handle}
											</span>
										{/if}
									</div>
									<p class="line-clamp-2 text-[clamp(9px,1.1cqw,13px)] font-medium italic leading-snug text-white/60">
										{speaker.talk}
									</p>
								</div>
							</div>
						{/each}
					</div>

				</div>

				<!-- ── RIGHT: Sidebar ────────────────────────────── -->
				<div
					class="flex w-[26%] flex-shrink-0 flex-col items-stretch py-[5%] pr-[3%]"
				>
					<!-- Thin separator line -->
					<div class="mb-[5%] h-full flex flex-col">
						<div class="ml-[5%] h-full rounded-xl" style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);">
							<div class="flex h-full flex-col items-center p-[8%]">

								<!-- Sponsors block -->
								<div class="flex flex-1 flex-col items-center justify-around w-full">
									<p class="mb-2 text-center text-[clamp(7px,0.8cqw,10px)] font-semibold uppercase tracking-[0.2em] text-white/30">
										Sponsored by
									</p>
									<div class="flex flex-1 flex-col items-center justify-around gap-2 w-full">
										{#each sponsors.slice(0, 4) as sponsor}
											<a
												href={sponsor.url}
												target="_blank"
												rel="noopener noreferrer"
												class="flex w-full items-center justify-center rounded-lg px-2 py-1.5 transition hover:bg-white/5"
											>
												<img
													src={sponsor.logoLight}
													alt={sponsor.name}
													class="h-auto w-full object-contain"
													style="max-height: clamp(22px, 3.5cqh, 40px); max-width: 85%;"
												/>
											</a>
										{/each}
									</div>
								</div>

								<!-- Divider -->
								<div class="my-3 h-px w-4/5 bg-white/10"></div>

								<!-- CTA Buttons -->
								<div class="flex w-full flex-col gap-2">
									{#if isEventPassed}
										<a
											href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
											target="_blank"
											rel="noopener noreferrer"
											class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-2 py-2 text-[clamp(8px,0.9cqw,11px)] font-semibold text-white transition hover:bg-red-700"
										>
											<svg class="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
												<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
											</svg>
											Watch Recording
										</a>
										<a
											href={discordUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[clamp(8px,0.9cqw,11px)] font-semibold text-white/70 ring-1 ring-white/15 transition hover:bg-white/8 hover:text-white"
										>
											<svg class="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
												<path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02z"/>
											</svg>
											Join Discord
										</a>
									{:else}
										<a
											href={registrationUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#5865f2] px-2 py-2 text-[clamp(8px,0.9cqw,11px)] font-semibold text-white shadow-[0_0_12px_rgba(88,101,242,0.4)] transition hover:bg-[#4752c4]"
										>
											<svg class="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
												<path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02z"/>
											</svg>
											Join on Discord
										</a>
										<a
											href={calendarUrl}
											target="_blank"
											rel="noopener noreferrer"
											class="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[clamp(8px,0.9cqw,11px)] font-semibold text-white/70 ring-1 ring-white/15 transition hover:bg-white/8 hover:text-white"
										>
											<svg class="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
												<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
											</svg>
											Add to Calendar
										</a>
									{/if}
								</div>

								<!-- lofi.so wordmark -->
								<div class="mt-3 text-center">
									<span class="text-[clamp(7px,0.7cqw,9px)] font-semibold tracking-[0.15em] text-white/20 uppercase">
										lofi.so
									</span>
								</div>

							</div>
						</div>
					</div>
				</div>

			</div>
		</div>
	</main>
{:else}
	<div class="flex h-screen items-center justify-center">
		<div
			class="flex min-h-[300px] w-1/2 items-center justify-center rounded-xl bg-gray-100 p-8 text-center dark:bg-gray-800"
		>
			<div class="max-w-md">
				<img src="/images/logo.png" alt="LoFi" class="mx-auto mb-4 h-16 w-16 opacity-50" />
				<h2 class="mb-2 text-2xl font-bold text-gray-700 dark:text-gray-200">No Upcoming Event</h2>
				<p class="text-gray-600 dark:text-gray-400">
					Stay tuned! Our next Local First event is being planned. Check back soon for updates or
					join our Discord community.
				</p>
				<div class="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<a
						href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
					>
						<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
						</svg>
						Catch Up on Past Events
					</a>
					<a
						href="https://discord.gg/lofi-so"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5865f2] px-4 py-2 text-white transition hover:bg-[#4752c4]"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02z"/>
						</svg>
						Join Discord Community
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
