<!-- EventGraphic.svelte -->
<script lang="ts">
	import type { EventData } from '$lib/server/kv';
	import type { EventGraphicSpec } from '$lib/types/event-graphic';
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
			Outer shell: fixed 16:9 aspect ratio for export targets.
			On-screen it fills its container naturally (responsive).
			The export pipeline captures #graphic at a fixed pixel size,
			so responsive layout does not affect export output.
		-->
		<div
			class="eg-card relative w-full overflow-hidden rounded-2xl"
			style="background: #0d1117;"
		>
			<!-- ── Gradient layers ───────────────────────────────── -->
			<div
				class="pointer-events-none absolute inset-0"
				style="background: radial-gradient(ellipse 80% 80% at 110% -20%, #5865f2 0%, transparent 55%), radial-gradient(ellipse 70% 60% at -10% 110%, #4f46e5 0%, transparent 50%);"
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
				class="pointer-events-none absolute hidden sm:block"
				style="top: -60%; right: -5%; width: 38%; height: 220%; background: linear-gradient(180deg, #5865f2 0%, #4f46e5 100%); opacity: 0.07; transform: rotate(-12deg); border-radius: 40px;"
			></div>

			<!-- Past Event badge -->
			{#if isEventPassed}
				<div class="absolute left-3 top-3 z-20 flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3">
					<div class="h-1.5 w-1.5 rounded-full bg-red-400"></div>
					<span class="text-[9px] font-semibold uppercase tracking-widest text-white/70 sm:text-[10px]">Past Event</span>
				</div>
			{/if}

			<!-- ═══════════════════════════════════════════════════ -->
			<!--  RESPONSIVE LAYOUT                                  -->
			<!--  mobile:  single column, sidebar hidden             -->
			<!--  sm+:     two columns, sidebar visible              -->
			<!-- ═══════════════════════════════════════════════════ -->
			<div class="relative flex h-full w-full flex-col sm:flex-row">

				<!-- ── LEFT / MAIN: Event info + Speakers ─────────── -->
				<div class="flex flex-1 flex-col px-4 pb-4 pt-8 sm:px-[4%] sm:pb-[4%] sm:pt-[5%]">

					<!-- Header row -->
					<div class="mb-3 flex items-center gap-2.5 sm:mb-[3%] sm:gap-3">
						<img
							src={logoUrl}
							alt="LoFi"
							class="h-7 w-7 flex-shrink-0 sm:h-9 sm:w-9"
						/>
						<div>
							<p class="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40 sm:text-[10px]">
								Local First Software
							</p>
							<h1 class="text-base font-extrabold leading-tight tracking-tight text-white sm:text-xl lg:text-2xl">
								LoFi/<span class="text-[#5865f2]">{eventNumber}</span> — {title}
							</h1>
						</div>
					</div>

					<!-- Date/time chip -->
					<div class="mb-3 flex flex-wrap items-center gap-2 sm:mb-[4%]">
						<div class="flex items-center gap-1.5 rounded-full bg-white/8 px-2.5 py-1 ring-1 ring-white/10">
							<svg class="h-3 w-3 flex-shrink-0 text-[#5865f2]" viewBox="0 0 24 24" fill="currentColor">
								<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
							</svg>
							{#if isEventPassed}
								<span class="text-[10px] font-medium text-white/40 line-through sm:text-xs">{displayDateTime}</span>
							{:else}
								<span class="text-[10px] font-semibold text-white/80 sm:text-xs">{displayDateTime}</span>
							{/if}
						</div>
						{#if isEventPassed}
							<span class="text-[9px] font-medium text-white/30 sm:text-[10px]">Event has ended</span>
						{/if}
					</div>

					<!-- Section label + divider -->
					<div class="mb-3 flex items-center gap-2 sm:mb-[3%]">
						<span class="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30 sm:text-[10px]">
							{isEventPassed ? 'Recorded Talks' : 'Featured Speakers'}
						</span>
						<div class="h-px flex-1 bg-white/10"></div>
					</div>

					<!-- ── SPEAKERS ──────────────────────────────── -->
					<div class="flex flex-1 flex-col justify-around gap-3 sm:gap-[2%]">
						{#each speakers as speaker, i}
							<div class="flex items-center gap-3 sm:gap-[3%]">

								<!-- Avatar -->
								<div
									class="relative flex-shrink-0 rounded-full"
									style="width: clamp(44px, 10vw, 80px); height: clamp(44px, 10vw, 80px);"
								>
									<!-- Gradient halo -->
									<div
										class="absolute inset-[-3px] rounded-full"
										style="background: conic-gradient(from {i * 120}deg, #5865f2, #818cf8, #4f46e5, #5865f2); opacity: 0.7;"
									></div>
									<div class="absolute inset-[2px] overflow-hidden rounded-full bg-[#0d1117]">
										{#if speaker.image}
											<img
												src={speaker.image}
												alt={speaker.name}
												class="h-full w-full rounded-full object-cover object-center"
											/>
										{:else}
											<!-- Placeholder silhouette -->
											<div class="flex h-full w-full items-center justify-center rounded-full bg-white/5">
												<svg class="h-1/2 w-1/2 text-white/20" viewBox="0 0 24 24" fill="currentColor">
													<path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
												</svg>
											</div>
										{/if}
									</div>
									<!-- Number badge -->
									<div
										class="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#5865f2] text-[8px] font-bold text-white ring-1 ring-[#0d1117] sm:h-[18px] sm:w-[18px] sm:text-[9px]"
									>
										{i + 1}
									</div>
								</div>

								<!-- Speaker info -->
								<div class="min-w-0 flex-1">
									<div class="mb-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0">
										<h3 class="text-sm font-bold leading-tight text-white sm:text-base">
											{speaker.name}
										</h3>
										{#if speaker.handle}
											<span class="text-[10px] font-medium text-white/35 sm:text-[11px]">
												{speaker.handle}
											</span>
										{/if}
									</div>
									<p class="line-clamp-2 text-[11px] font-medium italic leading-snug text-white/60 sm:text-xs">
										{speaker.talk}
									</p>
								</div>
							</div>
						{/each}
					</div>

					<!-- Mobile-only CTA (shown below speakers on small screens) -->
					<div class="mt-4 flex flex-col gap-2 sm:hidden">
						{#if isEventPassed}
							<a
								href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white"
							>
								<svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
								</svg>
								Watch Recording
							</a>
							<a
								href={discordUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white/70 ring-1 ring-white/15"
							>
								<svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02z"/>
								</svg>
								Join Discord
							</a>
						{:else}
							<a
								href={registrationUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#5865f2] px-4 py-2.5 text-xs font-semibold text-white shadow-[0_0_12px_rgba(88,101,242,0.4)]"
							>
								<svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 00-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 00-4.8 0c-.14-.34-.35-.76-.54-1.09-.01-.02-.04-.03-.07-.03-1.5.26-2.93.71-4.27 1.33-.01 0-.02.01-.03.02-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05 1.8 1.32 3.53 2.12 5.24 2.65.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74.02-.04 0-.08-.04-.09-.57-.22-1.11-.48-1.64-.78-.04-.02-.04-.08-.01-.11.11-.08.22-.17.33-.25.02-.02.05-.02.07-.01 3.44 1.57 7.15 1.57 10.55 0 .02-.01.05-.01.07.01.11.09.22.17.33.26.04.03.04.09-.01.11-.52.31-1.07.56-1.64.78-.04.01-.05.06-.04.09.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01 1.72-.53 3.45-1.33 5.25-2.65.02-.01.03-.03.03-.05.44-4.53-.73-8.46-3.1-11.95-.01-.01-.02-.02-.04-.02z"/>
								</svg>
								Join on Discord
							</a>
							<a
								href={calendarUrl}
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold text-white/70 ring-1 ring-white/15"
							>
								<svg class="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
									<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
								</svg>
								Add to Calendar
							</a>
						{/if}

						<!-- Mobile sponsors strip -->
						<div class="mt-2 flex items-center justify-center gap-4 opacity-60">
							{#each sponsors.slice(0, 4) as sponsor}
								<img src={sponsor.logoLight} alt={sponsor.name} class="h-5 w-auto object-contain" />
							{/each}
						</div>
					</div>

				</div>

				<!-- ── RIGHT: Sidebar (hidden on mobile) ──────────── -->
				<div class="relative hidden w-[28%] flex-shrink-0 py-[4%] pr-[3%] sm:flex sm:flex-col">
					<div class="ml-[5%] flex h-full flex-col rounded-xl p-[8%]"
						style="background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);">

						<!-- Sponsors -->
						<div class="flex flex-1 flex-col items-center justify-around">
							<p class="mb-2 text-center text-[8px] font-semibold uppercase tracking-[0.2em] text-white/30 sm:text-[9px]">
								Sponsored by
							</p>
							<div class="flex flex-1 flex-col items-center justify-around gap-1 w-full">
								{#each sponsors.slice(0, 4) as sponsor}
									<a
										href={sponsor.url}
										target="_blank"
										rel="noopener noreferrer"
										class="flex w-full items-center justify-center rounded-lg px-2 py-1 transition hover:bg-white/5"
									>
										<img
											src={sponsor.logoLight}
											alt={sponsor.name}
											class="h-auto w-full object-contain"
											style="max-height: clamp(18px, 3cqh, 36px); max-width: 85%;"
										/>
									</a>
								{/each}
							</div>
						</div>

						<!-- Divider -->
						<div class="my-2 h-px w-4/5 self-center bg-white/10"></div>

						<!-- CTA Buttons -->
						<div class="flex w-full flex-col gap-1.5">
							{#if isEventPassed}
								<a
									href="https://www.youtube.com/playlist?list=PLTbD2QA-VMnXFsLbuPGz1H-Najv9MD2-H"
									target="_blank"
									rel="noopener noreferrer"
									class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-2 py-1.5 text-[9px] font-semibold text-white transition hover:bg-red-700 sm:text-[10px]"
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
									class="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-semibold text-white/70 ring-1 ring-white/15 transition hover:bg-white/8 hover:text-white sm:text-[10px]"
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
									class="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#5865f2] px-2 py-1.5 text-[9px] font-semibold text-white shadow-[0_0_12px_rgba(88,101,242,0.4)] transition hover:bg-[#4752c4] sm:text-[10px]"
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
									class="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[9px] font-semibold text-white/70 ring-1 ring-white/15 transition hover:bg-white/8 hover:text-white sm:text-[10px]"
								>
									<svg class="h-3 w-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
										<path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/>
									</svg>
									Add to Calendar
								</a>
							{/if}
						</div>

						<!-- lofi.so wordmark -->
						<div class="mt-2 text-center">
							<span class="text-[7px] font-semibold tracking-[0.15em] text-white/20 uppercase sm:text-[8px]">
								lofi.so
							</span>
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
