<script lang="ts">
	import SponsorLockup from '$lib/components/SponsorLockup.svelte';
	import type { EventGraphicSpec, EventGraphicSpeaker } from '$lib/types/event-graphic';

	export let speakerData: {
		name: string;
		twitterHandle?: string;
		talk: string;
		bio: string;
		talkPoints: string[];
		image: string;
	} | null = null;

	export let eventNumber: number = 1;
	export let date: string = '';
	export let time: string = '';
	export let timezone: string = 'UTC';
	export let eventSpec: EventGraphicSpec | null = null;
	export let speaker: EventGraphicSpeaker | null = null;

	$: resolvedSpeaker =
		speaker ||
		(speakerData
			? ({
					name: speakerData.name,
					socials: { x: speakerData.twitterHandle || '' },
					primarySocialPlatform: 'x',
					talkTitle: speakerData.talk,
					bio: speakerData.bio,
					bullets: (speakerData.talkPoints || []).filter(Boolean),
					avatarUrl: speakerData.image
				} satisfies EventGraphicSpeaker)
			: null);

	$: resolvedDisplayDate =
		eventSpec?.event.displayDateTime ||
		(date
			? `${new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
					weekday: 'long',
					day: 'numeric',
					month: 'long',
					year: 'numeric'
				})} @ ${time || '08:00'} ${timezone}`
			: 'Date to be announced');

	$: activeEventNumber = eventSpec?.event.number || eventNumber;
	$: activeSponsors = (eventSpec?.sponsors || []).slice(0, 4);

	const getSpeakerHandle = (): string => {
		if (!resolvedSpeaker) return '';
		const primary = resolvedSpeaker.primarySocialPlatform;
		return (
			resolvedSpeaker.socials[primary] ||
			resolvedSpeaker.socials.x ||
			resolvedSpeaker.socials.bluesky ||
			''
		);
	};

	const getSpeakerLink = (): string => {
		const handle = getSpeakerHandle();
		if (!handle) return '#';
		if (resolvedSpeaker?.primarySocialPlatform === 'bluesky') {
			return `https://bsky.app/profile/${handle.replace(/^@/, '')}`;
		}
		return `https://x.com/${handle.replace(/^@/, '')}`;
	};
</script>

{#if resolvedSpeaker}
	<main
		class="relative h-full w-full overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-discord shadow-[0_0_40px_-14px_theme(colors.primary)]"
	>
		<div class="pointer-events-none absolute inset-0 opacity-20">
			<svg width="100%" height="100%">
				<defs>
					<pattern
						id="speaker-dot-pattern"
						x="0"
						y="0"
						width="26"
						height="26"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1" fill="white" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#speaker-dot-pattern)" />
			</svg>
		</div>

		<div class="relative h-full min-h-[420px] p-4">
			<div class="grid h-full grid-cols-12 gap-3">
				<section
					class="col-span-12 flex min-h-0 flex-col rounded-2xl border border-white/45 bg-white/95 p-3 text-gray-900 shadow-xl md:col-span-8"
				>
					<header class="mb-3">
						<div class="mb-2 flex items-center gap-2">
							<img
								src={eventSpec?.event.links.logoUrl || '/images/logo.png'}
								alt="LoFi"
								class="h-8 w-8 rounded-md bg-white/90 p-1"
							/>
							<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
								Spotlight
							</p>
						</div>
						<h2 class="text-lg font-bold leading-tight sm:text-xl">LoFi/{activeEventNumber}</h2>
						<p class="mt-1 text-xs font-semibold text-gray-700">{resolvedDisplayDate}</p>
					</header>

					<div class="grid min-h-0 flex-1 grid-cols-12 gap-3 overflow-hidden">
						<div
							class="col-span-4 flex min-h-0 flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5"
						>
							<div class="h-28 w-28 overflow-hidden rounded-full bg-gray-200">
								{#if resolvedSpeaker.avatarUrl}
									<img
										src={resolvedSpeaker.avatarUrl}
										alt={resolvedSpeaker.name}
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

							<div class="min-w-0 text-center">
								<h3 class="truncate text-sm font-semibold">{resolvedSpeaker.name}</h3>
								{#if getSpeakerHandle()}
									<a
										href={getSpeakerLink()}
										target="_blank"
										rel="noopener noreferrer"
										class="truncate text-xs font-medium text-primary hover:text-primary/80"
									>
										{getSpeakerHandle()}
									</a>
								{/if}
							</div>

							<p class="line-clamp-4 text-xs leading-relaxed text-gray-600">
								{resolvedSpeaker.bio}
							</p>
						</div>

						<div class="col-span-8 min-h-0 rounded-xl border border-gray-200 bg-white p-3">
							<h4
								class="mb-2 line-clamp-2 text-base font-bold italic leading-tight text-gray-900 sm:text-lg"
							>
								{resolvedSpeaker.talkTitle}
							</h4>
							<div class="space-y-2">
								{#each resolvedSpeaker.bullets.slice(0, 4) as bullet}
									<div class="flex items-start gap-2">
										<span class="mt-1 h-2 w-2 rounded-full bg-primary"></span>
										<p class="line-clamp-2 text-xs leading-snug text-gray-700 sm:text-sm">
											{bullet}
										</p>
									</div>
								{/each}
							</div>
						</div>
					</div>
				</section>

				<aside class="col-span-12 flex min-h-0 flex-col gap-3 md:col-span-4">
					<SponsorLockup sponsors={activeSponsors} compact={true} className="flex-1" />
					<div class="rounded-2xl border border-white/35 bg-black/10 p-3 backdrop-blur-sm">
						<div class="space-y-2">
							<a
								href={eventSpec?.event.links.discordUrl || 'https://discord.gg/lofi-so'}
								target="_blank"
								rel="noopener noreferrer"
								class="flex w-full items-center justify-center rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-white"
							>
								Join Discord
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
			<h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">No Speaker Data</h3>
			<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
				Add speakers to render spotlight cards.
			</p>
		</div>
	</div>
{/if}
