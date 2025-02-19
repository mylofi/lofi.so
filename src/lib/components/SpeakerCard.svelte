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
</script>

<main class="flex min-h-screen items-center justify-center p-4">
	<div
		class="relative flex h-fit w-fit origin-center scale-[0.55] flex-col items-end justify-end rounded-3xl bg-gradient-to-t from-primary to-discord text-black shadow-[0_0_30px_-10px_theme(colors.primary)] dark:text-white sm:scale-60 md:scale-[0.65]"
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
		<section class="max-w-[1000px] rounded-xl p-6">
			<div class="rounded-xl bg-gray-100 px-6 py-6 shadow-md dark:bg-gray-800">
				<!-- Speaker Content -->
				<div class="rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900">
					<div class="grid grid-cols-1 gap-14 lg:grid-cols-2">
						<!-- Left Column -->
						<div class="flex flex-col gap-8">
							<!-- Speaker Image and Info -->
							<div class="flex flex-col gap-6">
								<div class="relative">
									{#if speakerData.image}
										<div class="aspect-square h-56 w-56 overflow-hidden rounded-full bg-gray-200 shadow-lg dark:bg-gray-700">
											<img
												src={speakerData.image}
												alt={speakerData.name}
												class="h-full w-full object-cover"
											/>
										</div>
										<div class="absolute -bottom-2 -right-2 rounded-xl bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:bg-gray-900/95">
											<h2 class="text-2xl font-bold">{speakerData.name}</h2>
											<a
												href={`https://x.com/${speakerData.twitterHandle?.substring(1)}`}
												target="_blank"
												rel="noopener noreferrer"
												class="text-lg text-gray-600 hover:text-discord dark:text-gray-400"
											>
												{speakerData.twitterHandle}
											</a>
										</div>
									{/if}
								</div>
								<p class="max-w-md text-gray-700 dark:text-gray-300">
									{speakerData.bio}
								</p>
							</div>
						</div>

						<!-- Right Column -->
						<div class="flex flex-col justify-between gap-8">
							<!-- Header with Logo -->
							<div>
								<div class="mb-3 flex items-center gap-2">
									<img src="/images/logo.png" alt="LoFi" class="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
									<h2 class="m-0 text-xl font-bold sm:text-2xl lg:text-3xl">
										LoFi/{eventNumber}
									</h2>
								</div>
								<p class="mb-1 text-lg font-bold text-gray-800 dark:text-gray-200 sm:text-base">
									Local First Meetup #{eventNumber}
								</p>
								<p class="text-base font-bold text-discord sm:text-lg">
									{formattedDateTime}
								</p>
							</div>

							<!-- Talk Info -->
							<div class="flex flex-col gap-6">
								<h1 class="max-w-md text-2xl font-bold text-gray-900 dark:text-white lg:text-4xl">
									{speakerData.talk}
								</h1>
								<div class="space-y-4">
									{#each speakerData.talkPoints.filter((point) => point) as point}
										<div class="flex items-start gap-3">
											<div class="mt-2 h-3 w-3 flex-shrink-0 rounded-full bg-discord lg:h-4 lg:w-4" />
											<p class="max-w-md text-lg text-gray-800 dark:text-gray-200 lg:text-xl">
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