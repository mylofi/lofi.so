<!-- Hero Section -->
<script>
</script>

<section class="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
	<!-- Meetup Button - Hidden on small screens -->
	<!-- <div class="absolute bottom-10 z-10 hidden sm:right-6 md:block lg:right-12">
		<button
			class="group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-discord px-4 py-2.5 text-sm text-white shadow-lg transition-transform hover:scale-105 sm:px-6 sm:py-3 sm:text-base"
			on:click={() => {
				const desktopSection = document.querySelector('#monthly-meetup-desktop');
				if (desktopSection) {
					desktopSection.scrollIntoView({ behavior: 'smooth' });
				}
			}}
		>
			<span>Tune In</span>
			<div class="animate-pulse-ring absolute inset-0 rounded-full" />
		</button>
	</div> -->

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
			<p class="mx-auto mt-7 max-w-2xl text-lg font-bold text-gray-600 dark:text-gray-300">
				Welcome to a better way of using software.
			</p>
			<div class="mt-14 flex justify-center gap-4">
				<a
					href="https://discord.gg/ZRrwZxn4rW"
					target="_blank"
					rel="noopener noreferrer"
					class="scroll-smooth rounded-md bg-[#5865F2] px-6 py-3 text-lg font-semibold text-white transition hover:bg-[#5865F2]/90 flex items-center gap-2"
				>
					<svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
						<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
					</svg>
					Join
				</a>
				<a
					href="#explore"
					class="scroll-smooth rounded-md border border-gray-200 bg-white px-6 py-3 text-lg font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
					on:click|preventDefault={(e) => {
						const exploreSection = document.getElementById('explore');
						if (exploreSection) {
							const navHeight = 100;
							const elementPosition = exploreSection.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.scrollY - navHeight;
							
							window.scrollTo({
								top: offsetPosition,
								behavior: 'smooth'
							});
						}
					}}
				>
					Explore
				</a>
				<a
					href="#directory"
					class="rounded-md border border-gray-200 bg-white px-6 py-3 text-lg font-semibold text-gray-900 transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
					on:click|preventDefault={(e) => {
						const section = document.getElementById('directory');
						if (section) {
							const navHeight = 100;
							const elementPosition = section.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.scrollY - navHeight;
							
							window.scrollTo({
								top: offsetPosition,
								behavior: 'smooth'
							});
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

	@keyframes pulseRing {
		0% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7);
		}

		70% {
			transform: scale(1);
			box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
		}

		100% {
			transform: scale(0.95);
			box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
		}
	}

	:global(.animate-glow) {
		animation: glow 7s ease-in-out infinite;
	}

	.animate-pulse-ring {
		animation: pulseRing 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
