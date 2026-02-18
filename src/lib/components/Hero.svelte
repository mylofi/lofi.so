<section class="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="animate-glow absolute left-1/2 top-0 h-[25rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary opacity-30 blur-[6rem] dark:opacity-30"
		></div>
		<div
			class="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-50 [mask-image:radial-gradient(circle_at_center,white,transparent_75%)] dark:opacity-100"
		></div>
	</div>

	<div class="relative mx-auto max-w-7xl">
		<div class="text-center">
			<img src="/images/logo.svg" alt="Local First Software" class="mx-auto mb-2 h-32 sm:h-40" />
			<h1
				class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl"
			>
				Local-first Software
			</h1>
			<p class="mx-auto mt-7 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
				Experience apps that work offline, keep your data private, and sync seamlessly across your
				devices. Your data stays with you, not locked in the cloud.
			</p>

			<div class="mt-14 flex justify-center gap-4">
				<a
					href="https://discord.gg/ZRrwZxn4rW"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-3 rounded-md bg-primary px-6 py-3 text-lg font-semibold text-white transition hover:bg-primary/90"
				>
					<span class="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
						<svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
							/>
						</svg>
					</span>
					<span>Join</span>
				</a>
				<a
					href="#join-us"
					class="rounded-md border border-gray-200 bg-white px-6 py-3 text-lg font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
					on:click|preventDefault={() => {
						const section = document.querySelector('#join-us');
						if (section) {
							const navHeight = 100;
							const elementPosition = section.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.scrollY - navHeight;
							window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
						}
					}}
				>
					Explore
				</a>
				<a
					href="#directory"
					class="rounded-md border border-gray-200 bg-white px-6 py-3 text-lg font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
					on:click|preventDefault={() => {
						const section = document.querySelector('#directory');
						if (section) {
							const navHeight = 100;
							const elementPosition = section.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.scrollY - navHeight;
							window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
						}
					}}
				>
					Directory
				</a>
			</div>
		</div>
	</div>
</section>

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
		animation: glow 7s ease-in-out infinite;
	}
</style>
