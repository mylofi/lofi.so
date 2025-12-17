<script lang="ts">
	export let speakerData: {
		name: string;
		twitterHandle: string;
		talk: string;
		bio: string;
		talkPoints: string[];
		image: string;
	};

	export let eventNumber: number;
	export let date: string;
	export let time: string;
	export let timezone: string;

	$: formattedDate = date
		? new Date(date).toLocaleDateString('en-US', {
				weekday: 'long',
				day: 'numeric',
				month: 'long',
				year: 'numeric'
		  })
		: '';
	$: formattedTime = time ? `${time.split(':')[0]}${time.split(':')[0] >= '12' ? 'PM' : 'AM'}` : '';
	$: formattedDateTime = `${formattedDate} @ ${formattedTime} ${timezone}`;

	// Calculate total content length to determine font sizes
	$: totalTalkPointsLength = speakerData.talkPoints.filter(p => p).reduce((sum, p) => sum + p.length, 0);
	$: isShortContent = speakerData.talk.length < 30 && totalTalkPointsLength < 80;
	$: bulletTextSize = isShortContent ? 'text-base' : 'text-sm';
	$: bulletDotSize = isShortContent ? 'h-4 w-4 mt-1' : 'h-3 w-3 mt-1.5';
	$: bulletSpacing = isShortContent ? 'space-y-4' : 'space-y-2';
</script>

<main class="inline-block">
	<div
		class="relative flex w-[800px] h-[450px] flex-col rounded-3xl bg-gradient-to-t from-primary to-discord text-black shadow-[0_0_30px_-10px_theme(colors.primary)] dark:text-white"
	>
		<!-- Background Pattern -->
		<div class="pointer-events-none absolute inset-0 rounded-3xl opacity-10">
			<svg width="100%" height="100%">
				<defs>
					<pattern
						id="dot-pattern"
						x="0"
						y="0"
						width="30"
						height="30"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1.2" fill="currentColor" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#dot-pattern)" />
			</svg>
		</div>

		<!-- Main Content Section -->
		<section class="flex-1 rounded-xl p-5">
			<div class="h-full rounded-xl bg-gray-100 p-4 shadow-md dark:bg-gray-800">
				<!-- Speaker Content -->
				<div class="h-full rounded-xl bg-white p-5 shadow-xl dark:bg-gray-900" >
					<div class="flex w-full h-full gap-12">
						<!-- Speaker Column -->
						<div class="w-[300px] flex flex-col gap-4 h-full">
							<!-- Speaker Image and Info -->
							<div class="flex flex-col gap-4">
								<div class="relative">
									{#if speakerData.image}
										<div class="aspect-square h-44 w-44 overflow-hidden rounded-full bg-gray-200 shadow-lg dark:bg-gray-700">
											<img
												src={speakerData.image}
												alt={speakerData.name}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="absolute -bottom-2 left-[100px] min-w-[120px] max-w-[200px] rounded-xl bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm dark:bg-gray-900/95">
											<h2 class="text-lg font-bold leading-tight line-clamp-2">{speakerData.name}</h2>
											<a
												href={`https://x.com/${speakerData.twitterHandle?.substring(1)}`}
												target="_blank"
												rel="noopener noreferrer"
												class="text-sm text-gray-600 hover:text-discord dark:text-gray-400"
											>
												{speakerData.twitterHandle}
											</a>
										</div>
									{/if}
								</div>
							</div>
							<!-- Bio -->
							<p class="text-sm text-gray-700 dark:text-gray-300 line-clamp-5">
								{speakerData.bio}
							</p>
						</div>

						<!-- Talk Details  Column-->
						<div class="w-[400px] flex flex-col gap-8 h-full">
							<!-- Header with Logo -->
							<div>
								<div class="mb-2 flex items-center gap-2">
									<img src="/images/logo.png" alt="LoFi" class="h-10 w-10" />
									<h1 class="m-0 text-2xl font-bold">
										LoFi/{eventNumber}
									</h1>
								</div>
								<h2 class="mb-1 text-xl font-bold text-gray-800 dark:text-gray-200">
									Local First Meetup #{eventNumber}
								</h2>
								<p class="text-base font-bold text-discord">
									{formattedDateTime}
								</p>
							</div>

							<!-- Talk Info -->
							<div class="flex flex-col gap-3">
								<h1 class="font-bold text-gray-900 dark:text-white line-clamp-2 {speakerData.talk.length > 40 ? 'text-xl' : 'text-2xl'}">
									{speakerData.talk}
								</h1>
								<div class={bulletSpacing}>
									{#each speakerData.talkPoints.filter((point) => point) as point}
										<div class="flex items-start gap-2">
											<div class="flex-shrink-0 rounded-full bg-discord {bulletDotSize}" />
											<p class="text-gray-800 dark:text-gray-200 line-clamp-2 {bulletTextSize}">
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

<style>
	.speaker-card {
		font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu,
			Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
	}
</style>