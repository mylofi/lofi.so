<!-- Footer -->
<footer class="relative border-t border-gray-200 px-4 py-8 sm:px-6 lg:px-8 dark:border-gray-800">
	<div
		class="animate-glow absolute bottom-8 left-1/2 h-[15rem] w-[30rem] -translate-x-1/2 rounded-full bg-primary opacity-20 blur-[8rem] dark:opacity-30"
	></div>
	<div class="relative mx-auto max-w-7xl text-center">
		<div class="space-y-2">
			<p class="text-lg text-gray-600 dark:text-gray-300">
				Something missing?
				<a
					href="https://github.com/mylofi/lofi.so/blob/main/src/lib/data/content.json"
					class="text-gray-900 underline transition hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
				>
					<span class="inline-block text-primary">✍️ Edit the lists</span>
				</a>
				or
				<a
					href="https://github.com/mylofi/lofi.so"
					class="text-gray-900 underline transition hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
				>
					<span class="inline-block text-primary">🎨 redesign the page!</span>
				</a>
			</p>
		</div>
		<img src="/images/logo.svg" alt="Local First Software" class="mx-auto mt-6 h-12 opacity-50" />
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
