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

	// Calculate total content length to determine font sizes
	$: filteredPoints = speaker?.talkPoints.filter((p) => p) || [];
	$: totalTalkPointsLength = filteredPoints.reduce((sum, p) => sum + p.length, 0);
	$: isShortContent = (speaker?.talk.length || 0) < 30 && totalTalkPointsLength < 80;
	$: bulletTextSize = isShortContent ? 'text-base' : 'text-sm';
	$: bulletDotSize = isShortContent ? 'h-4 w-4 mt-1' : 'h-3 w-3 mt-1.5';
	$: bulletSpacing = isShortContent ? 'space-y-4' : 'space-y-2';
</script>

{#if speaker}
<main class="inline-block">
	<div
		class="relative flex w-[800px] h-[450px] flex-col rounded-3xl bg-gradient-to-t from-primary to-discord text-black shadow-[0_0_30px_-10px_theme(colors.primary)] dark:text-white"
	>
		<!-- Background Pattern -->
		<div class="pointer-events-none absolute inset-0 rounded-3xl opacity-10">
			<svg width="100%" height="100%">
				<defs>
					<pattern
						id="dot-pattern-speaker"
						x="0"
						y="0"
						width="30"
						height="30"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1.2" fill="currentColor" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#dot-pattern-speaker)" />
			</svg>
		</div>

		<!-- Main Content Section -->
		<section class="flex-1 rounded-xl p-5">
			<div class="h-full rounded-xl bg-gray-100 p-4 shadow-md dark:bg-gray-800">
				<!-- Speaker Content -->
				<div class="h-full rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900">
					<div class="flex w-full h-full gap-12">
						<!-- Speaker Column -->
						<div class="w-[300px] flex flex-col gap-4 h-full">
							<!-- Speaker Image and Info -->
							<div class="flex flex-col gap-4">
								<div class="relative">
									{#if speaker.image}
										<div class="aspect-square h-44 w-44 overflow-hidden rounded-full bg-gray-200 shadow-lg dark:bg-gray-700">
											<img
												src={speaker.image}
												alt={speaker.name}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="absolute -bottom-2 left-[100px] min-w-[120px] max-w-[200px] rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-900/95">
											<h2 class="line-clamp-2 text-lg font-bold leading-tight">{speaker.name}</h2>
											<a
												href={speaker.handleUrl}
												target="_blank"
												rel="noopener noreferrer"
												class="text-sm text-gray-600 hover:text-discord dark:text-gray-400"
											>
												{speaker.handle}
											</a>
										</div>
									{/if}
								</div>
							</div>
							<!-- Bio -->
							<p class="line-clamp-5 text-sm text-gray-700 dark:text-gray-300">
								{speaker.bio}
							</p>
						</div>

						<!-- Talk Details Column -->
						<div class="w-[400px] flex flex-col gap-8 h-full">
							<!-- Header with Logo -->
							<div>
								<div class="mb-2 flex items-center gap-2">
									<img src="/images/logo.png" alt="LoFi" class="h-10 w-10" />
									<h1 class="m-0 text-2xl font-bold">
										LoFi/{resolvedEventNumber}
									</h1>
								</div>
								<h2 class="mb-1 text-xl font-bold text-gray-800 dark:text-gray-200">
									Local First Meetup #{resolvedEventNumber}
								</h2>
								<p class="text-base font-bold text-discord">
									{formattedDateTime}
								</p>
							</div>

							<!-- Talk Info -->
							<div class="flex flex-col gap-3">
								<h1 class="line-clamp-2 font-bold text-gray-900 dark:text-white {speaker.talk.length > 40 ? 'text-xl' : 'text-2xl'}">
									{speaker.talk}
								</h1>
								<div class={bulletSpacing}>
									{#each filteredPoints as point}
										<div class="flex items-start gap-2">
											<div class="flex-shrink-0 rounded-full bg-discord {bulletDotSize}" />
											<p class="line-clamp-2 text-gray-800 dark:text-gray-200 {bulletTextSize}">
												{point}
											</p>
										</div>
									{/each}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</main>
{/if}

<style>
	.speaker-card {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>
