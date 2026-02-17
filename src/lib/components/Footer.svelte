<script lang="ts">
	export let sponsors: {
		url: string;
		image: string;
		name: string;
		tier: string;
	}[] = [];
</script>

<!-- Footer -->
<footer class="relative  px-4 py-12 sm:px-6 lg:px-8 dark:border-gray-800">
	<div
		class="animate-glow absolute bottom-8 left-1/2 h-[15rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary opacity-20 blur-[8rem] dark:opacity-30"
	>
	</div>
	<div class="relative mx-auto max-w-7xl text-center space-y-8">
		<!-- Sponsors Section -->
		{#if sponsors.length > 0}
			<div>
				<div class="flex items-center justify-center gap-3 mb-6">
					<img src="/images/logo.svg" alt="" class="h-5 w-auto opacity-60" />
					<p class="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">
						Made possible by our sponsors
					</p>
				</div>
				<div class="flex flex-wrap justify-center items-center gap-8">
					{#each sponsors as sponsor}
						<a
							href={sponsor.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group transition-transform hover:scale-110"
						>
							<img
								src={sponsor.image}
								alt={sponsor.name}
								class="h-14 w-auto opacity-50 grayscale dark:brightness-0 dark:invert transition-all duration-300 group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0"
							/>
						</a>
					{/each}
				</div>
			</div>
		{/if}



		<!-- Contribute Section -->
		<div class="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
			<span class="text-gray-500 dark:text-gray-400">Something missing?</span>
			<div class="flex items-center gap-3">
				<a
					href="https://github.com/mylofi/lofi.so/blob/main/src/lib/data/content.json"
					class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all"
				>
					<span>✍️</span>
					<span>Edit the lists</span>
				</a>
				<a
					href="https://github.com/mylofi/lofi.so"
					class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all"
				>
					<span>🎨</span>
					<span>Redesign</span>
				</a>
			</div>
		</div>


	</div>
</footer>

<style>
	@keyframes glow {
		0% {
			opacity: 0.1;
			transform: translate(-50%, 0) scale(0.8);
		}
		50% {
			opacity: 0.3;
			transform: translate(-50%, 0) scale(1.1);
		}
		100% {
			opacity: 0.1;
			transform: translate(-50%, 0) scale(0.8);
		}
	}

	:global(.animate-glow) {
		animation: glow 10s ease-in-out infinite;
	}
</style>
