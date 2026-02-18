<script lang="ts">
	import type { EventData } from '$lib/server/kv';
	import SponsorLockup from '$lib/components/SponsorLockup.svelte';
	import type { EventGraphicSpec, EventGraphicSpeaker } from '$lib/types/event-graphic';
	import { toEventGraphicSpec } from '$lib/utils/event-graphic-spec';

	export let eventData: EventData | null = null;
	export let eventSpec: EventGraphicSpec | null = null;
	export let renderTarget: string = 'x_feed';

	$: resolvedSpec = eventSpec || toEventGraphicSpec(eventData);
	$: hasEvent = Boolean(resolvedSpec?.event?.number);
	$: eventStart = resolvedSpec?.event.startTimeISO
		? new Date(resolvedSpec.event.startTimeISO)
		: null;
	$: isEventPassed = eventStart ? eventStart.getTime() <= Date.now() : false;

	const getSpeakerHandle = (speaker: EventGraphicSpeaker): string => {
		const byPrimary = speaker.socials[speaker.primarySocialPlatform];
		if (byPrimary) return byPrimary;
		if (speaker.socials.x) return speaker.socials.x;
		if (speaker.socials.bluesky) return speaker.socials.bluesky;
		return '';
	};

	const getSpeakerLink = (speaker: EventGraphicSpeaker): string => {
		const handle = getSpeakerHandle(speaker);
		if (!handle) return '#';
		if (speaker.primarySocialPlatform === 'bluesky') {
			return `https://bsky.app/profile/${handle.replace(/^@/, '')}`;
		}
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

		<div class="relative h-full min-h-[460px] p-4 sm:p-5 lg:p-6">
			<div class="grid h-full grid-cols-12 gap-4">
				<section
					class="col-span-12 flex min-h-0 flex-col rounded-2xl border border-white/45 bg-white/95 p-4 text-gray-900 shadow-xl md:col-span-8 lg:p-5"
				>
					<header class="mb-4">
						<div class="mb-2 flex items-center gap-2">
							<img
								src={resolvedSpec.event.links.logoUrl || '/images/logo.png'}
								alt="LoFi"
								class="h-9 w-9 rounded-md bg-white/90 p-1"
							/>
							<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Agenda</p>
						</div>
						<h2 class="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">
							LoFi/{resolvedSpec.event.number}
							{resolvedSpec.event.title}
						</h2>
						<p class="mt-2 text-sm font-semibold text-gray-700">
							{resolvedSpec.event.displayDateTime}
						</p>
					</header>

					<div
						class="min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white p-3 sm:p-4"
					>
						<div class="mb-3 flex items-center justify-between">
							<h3 class="text-sm font-semibold uppercase tracking-[0.16em] text-gray-700">
								{isEventPassed ? 'Recorded Talks' : 'Scheduled Talks'}
							</h3>
							<span class="text-xs text-gray-500">{resolvedSpec.speakers.length} talks</span>
						</div>

						<div class="space-y-3 overflow-hidden">
							{#each resolvedSpec.speakers as speaker}
								<div class="rounded-lg border border-gray-200 bg-gray-50 p-2.5 sm:p-3">
									<div class="flex items-start gap-2.5 sm:gap-3">
										<div
											class="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:h-14 sm:w-14"
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
												<h4 class="truncate text-sm font-semibold text-gray-900 sm:text-base">
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
												class="line-clamp-2 text-sm font-semibold italic leading-snug text-gray-800"
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

				<aside class="col-span-12 flex min-h-0 flex-col gap-3 md:col-span-4">
					<SponsorLockup
						sponsors={resolvedSpec.sponsors}
						compact={renderTarget === 'legacy_event'}
						className="flex-1"
					/>

					<div class="rounded-2xl border border-white/35 bg-black/10 p-3 backdrop-blur-sm">
						<div class="space-y-2">
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
