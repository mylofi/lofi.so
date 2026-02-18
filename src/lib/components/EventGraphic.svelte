<script lang="ts">
	import type { EventData } from '$lib/server/kv';
	import SponsorLockup from '$lib/components/SponsorLockup.svelte';
	import type { EventGraphicSpec, EventGraphicSpeaker } from '$lib/types/event-graphic';
	import { toEventGraphicSpec } from '$lib/utils/event-graphic-spec';

	export let eventData: EventData | null = null;
	export let eventSpec: EventGraphicSpec | null = null;
	export let renderTarget: string = 'announcement_regular';
	export let layoutMode: 'default' | 'homepage' = 'default';

	$: resolvedSpec = eventSpec || toEventGraphicSpec(eventData);
	$: hasEvent = Boolean(resolvedSpec?.event?.number);
	$: eventStart = resolvedSpec?.event.startTimeISO
		? new Date(resolvedSpec.event.startTimeISO)
		: null;
	$: isEventPassed = eventStart ? eventStart.getTime() <= Date.now() : false;
	$: isAnnouncementDiscord = renderTarget === 'announcement_discord';
	$: isHomepageLayout = layoutMode === 'homepage' && !isAnnouncementDiscord;
	$: visibleSpeakers =
		isAnnouncementDiscord && resolvedSpec
			? resolvedSpec.speakers.slice(0, 2)
			: resolvedSpec?.speakers || [];

	const normalizeXHandle = (value: string): string => {
		const stripped = value
			.trim()
			.replace(/^https?:\/\/(www\.)?x\.com\//i, '')
			.replace(/^@+/, '');
		return stripped ? `@${stripped}` : '';
	};

	const normalizeBlueskyHandle = (value: string): string => {
		return value
			.trim()
			.replace(/^https?:\/\/(www\.)?bsky\.app\/profile\//i, '')
			.replace(/^@+/, '');
	};

	const getSpeakerHandle = (speaker: EventGraphicSpeaker): string => {
		const xHandle = normalizeXHandle(speaker.socials.x || '');
		if (xHandle) return xHandle;
		const blueskyHandle = normalizeBlueskyHandle(speaker.socials.bluesky || '');
		if (blueskyHandle) return blueskyHandle;
		const byPrimary = speaker.socials[speaker.primarySocialPlatform];
		if (byPrimary) {
			if (speaker.primarySocialPlatform === 'x') {
				return normalizeXHandle(byPrimary);
			}
			if (speaker.primarySocialPlatform === 'bluesky') {
				return normalizeBlueskyHandle(byPrimary);
			}
			return byPrimary;
		}
		return '';
	};

	const getSpeakerLink = (speaker: EventGraphicSpeaker): string => {
		const xHandle = normalizeXHandle(speaker.socials.x || '');
		if (xHandle) {
			return `https://x.com/${xHandle.replace(/^@/, '')}`;
		}
		const blueskyHandle = normalizeBlueskyHandle(speaker.socials.bluesky || '');
		if (blueskyHandle) {
			return `https://bsky.app/profile/${blueskyHandle}`;
		}
		const handle = getSpeakerHandle(speaker);
		if (!handle) return '#';
		if (speaker.primarySocialPlatform === 'linkedin') {
			return handle.startsWith('http') ? handle : `https://linkedin.com/in/${handle}`;
		}
		if (speaker.primarySocialPlatform === 'website') {
			return handle.startsWith('http') ? handle : `https://${handle}`;
		}
		return `https://x.com/${handle.replace(/^@/, '')}`;
	};
</script>

{#if hasEvent && resolvedSpec}
	<main
		class="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-discord shadow-[0_0_40px_-14px_theme(colors.primary)]"
	>
		<div class="pointer-events-none absolute inset-0 opacity-20">
			<svg width="100%" height="100%">
				<defs>
					<pattern
						id="event-dot-pattern"
						x="0"
						y="0"
						width="26"
						height="26"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1" fill="white" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#event-dot-pattern)" />
			</svg>
		</div>

		<div class={`relative h-full ${isAnnouncementDiscord ? 'p-3' : 'p-4 sm:p-5 lg:p-6'}`}>
			<div
				class={`grid h-full ${isHomepageLayout ? 'grid-cols-1 md:grid-cols-[minmax(0,1fr)_17rem]' : 'grid-cols-12'} ${isAnnouncementDiscord ? 'gap-3' : 'gap-4'}`}
			>
				<section
					class={`${isHomepageLayout ? '' : 'col-span-12 md:col-span-9'} flex min-h-0 min-w-0 flex-col rounded-2xl border border-white/45 bg-white/95 text-gray-900 shadow-xl ${isAnnouncementDiscord ? 'p-3' : 'p-4 lg:p-5'}`}
				>
					<header class={isAnnouncementDiscord ? 'mb-2' : 'mb-4'}>
						<div class={`mb-2 flex items-center gap-2 ${isAnnouncementDiscord ? 'mb-1.5' : ''}`}>
							<img
								src={resolvedSpec.event.links.logoUrl || '/images/logo.png'}
								alt="LoFi"
								class={isAnnouncementDiscord
									? 'h-7 w-7 rounded-md bg-white/90 p-1'
									: 'h-9 w-9 rounded-md bg-white/90 p-1'}
							/>
							<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Agenda</p>
						</div>
						<h2
							class={isAnnouncementDiscord
								? 'text-lg font-bold leading-tight text-gray-900'
								: 'text-xl font-bold leading-tight text-gray-900 sm:text-2xl'}
						>
							LoFi/{resolvedSpec.event.number}
							{resolvedSpec.event.title}
						</h2>
						<p
							class={isAnnouncementDiscord
								? 'mt-1 text-xs font-semibold text-gray-700'
								: 'mt-2 text-sm font-semibold text-gray-700'}
						>
							{resolvedSpec.event.displayDateTime}
						</p>
					</header>

					<div
						class={`min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white ${isAnnouncementDiscord ? 'p-2.5' : 'p-3 sm:p-4'}`}
					>
						<div
							class={`flex items-center justify-between ${isAnnouncementDiscord ? 'mb-2' : 'mb-3'}`}
						>
							<h3
								class={isAnnouncementDiscord
									? 'text-xs font-semibold uppercase tracking-[0.16em] text-gray-700'
									: 'text-sm font-semibold uppercase tracking-[0.16em] text-gray-700'}
							>
								{isEventPassed ? 'Recorded Talks' : 'Scheduled Talks'}
							</h3>
							<span class="text-xs text-gray-500">{resolvedSpec.speakers.length} talks</span>
						</div>

						<div class={`overflow-hidden ${isAnnouncementDiscord ? 'space-y-2' : 'space-y-3'}`}>
							{#each visibleSpeakers as speaker}
								<div
									class={`rounded-lg border border-gray-200 bg-gray-50 ${isAnnouncementDiscord ? 'p-2' : 'p-2.5 sm:p-3'}`}
								>
									<div class="flex items-start gap-2.5 sm:gap-3">
										<div
											class={isAnnouncementDiscord
												? 'h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200'
												: 'h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-14 sm:w-14'}
										>
											{#if speaker.avatarUrl}
												<img
													src={speaker.avatarUrl}
													alt={speaker.name}
													class="h-full w-full object-cover"
												/>
											{:else}
												<div
													class="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-500"
												>
													N/A
												</div>
											{/if}
										</div>

										<div class="min-w-0 flex-1">
											<div class="mb-1 flex items-center justify-between gap-2">
												<h4
													class={isAnnouncementDiscord
														? 'truncate text-xs font-semibold text-gray-900'
														: 'truncate text-sm font-semibold text-gray-900 sm:text-base'}
												>
													{speaker.name}
												</h4>
												{#if getSpeakerHandle(speaker)}
													<a
														href={getSpeakerLink(speaker)}
														target="_blank"
														rel="noopener noreferrer"
														class="truncate text-xs font-medium text-primary hover:text-primary/80"
													>
														{getSpeakerHandle(speaker)}
													</a>
												{/if}
											</div>
											<p
												class={isAnnouncementDiscord
													? 'line-clamp-1 text-xs font-semibold italic leading-snug text-gray-800'
													: 'line-clamp-2 text-sm font-semibold italic leading-snug text-gray-800'}
											>
												{speaker.talkTitle}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</section>

				{#if isHomepageLayout}
					<aside class="flex h-full min-w-0 flex-col gap-3 md:min-w-[17rem]">
						<div class="md:hidden">
							<SponsorLockup
								sponsors={resolvedSpec.sponsors}
								compact={true}
								inline={true}
								singleRow={true}
								showHeader={false}
								minimal={true}
								className=""
							/>
						</div>

						<div class="hidden min-h-0 flex-1 overflow-hidden md:block">
							<SponsorLockup
								sponsors={resolvedSpec.sponsors}
								compact={false}
								inline={false}
								singleRow={false}
								showHeader={true}
								minimal={true}
								className="h-full"
							/>
						</div>

						<div
							class="rounded-xl border border-white/30 bg-black/10 p-2.5 backdrop-blur-sm sm:p-3"
						>
							<div class="grid grid-cols-2 gap-2 xl:grid-cols-1">
								<a
									href={resolvedSpec.event.links.discordUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex w-full items-center justify-center rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-white"
								>
									Join Discord
								</a>
								<a
									href={resolvedSpec.event.links.calendarUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex w-full items-center justify-center rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
								>
									Add to Calendar
								</a>
							</div>
						</div>
					</aside>
				{:else}
					<aside
						class={`col-span-12 flex flex-col md:col-span-3 ${isAnnouncementDiscord ? 'gap-2' : 'gap-3'}`}
					>
						<SponsorLockup
							sponsors={resolvedSpec.sponsors}
							compact={isAnnouncementDiscord || renderTarget === 'legacy_event'}
							inline={true}
						/>

						<div
							class={`rounded-2xl border border-white/35 bg-black/10 backdrop-blur-sm ${isAnnouncementDiscord ? 'p-2.5' : 'p-3'}`}
						>
							<div
								class={isAnnouncementDiscord ? 'grid grid-cols-1 gap-2' : 'grid grid-cols-2 gap-2'}
							>
								<a
									href={resolvedSpec.event.links.discordUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="flex w-full items-center justify-center rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-white"
								>
									Join Discord
								</a>
								{#if !isAnnouncementDiscord}
									<a
										href={resolvedSpec.event.links.calendarUrl}
										target="_blank"
										rel="noopener noreferrer"
										class="flex w-full items-center justify-center rounded-lg bg-white/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/30"
									>
										Add to Calendar
									</a>
								{/if}
							</div>
						</div>
					</aside>
				{/if}
			</div>
		</div>
	</main>
{:else}
	<div
		class="flex min-h-[320px] items-center justify-center rounded-2xl border border-slate-300/80 bg-slate-50 p-6 text-center dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="max-w-md">
			<img src="/images/logo.png" alt="LoFi" class="mx-auto mb-3 h-12 w-12 opacity-50" />
			<h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">
				No Event Spec Available
			</h3>
			<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
				Populate the generator form or save an event to render this card.
			</p>
		</div>
	</div>
{/if}
