<!-- Hero Section -->
<script>
	import CalendarIcon from './CalendarIcon.svelte';
</script>

<section class="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8">
	<!-- Meetup Button - Hidden on small screens -->
	<div class="absolute bottom-10 z-10 hidden sm:right-6 md:block lg:right-12">
		<button
			class="to-discord group flex items-center gap-2 rounded-full bg-gradient-to-r from-primary px-4 py-2.5 text-sm text-white shadow-lg transition-transform hover:scale-105 sm:px-6 sm:py-3 sm:text-base"
			on:click={() => {
				const desktopSection = document.querySelector('#monthly-meetup-desktop');
				if (desktopSection) {
					desktopSection.scrollIntoView({ behavior: 'smooth' });
				}
			}}
		>
			<CalendarIcon class="h-4 w-4 sm:h-5 sm:w-5" />
			<span>Tune In</span>
			<div class="animate-pulse-ring absolute inset-0 rounded-full" />
		</button>
	</div>

	<div class="absolute inset-0 overflow-hidden">
		<div
			class="animate-glow absolute left-1/2 top-0 h-[25rem] w-[40rem] -translate-x-1/2 rounded-full bg-primary opacity-30 blur-[6rem]"
		></div>
		<div
			class="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(circle_at_center,white,transparent_75%)]"
		></div>
	</div>
	<div class="relative mx-auto max-w-7xl">
		<div class="text-center">
			<img src="/images/logo.svg" alt="Local First Software" class="mx-auto mb-2 h-32 sm:h-40" />
			<h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
				Local-first Software
			</h1>
			<p class="mx-auto mt-7 max-w-2xl text-lg text-gray-300">
				So, you want to build an app that has its data co-located with its UI? That works offline?
				That synchronizes between clients? And that lets its users own their data?
			</p>
			<p class="mx-auto mt-7 max-w-2xl text-lg font-bold text-gray-300">
				Welcome to the world of local-first web development.
			</p>
			<div class="mt-14 flex justify-center gap-4">
				<a
					href="#start-here"
					class="scroll-smooth rounded-md bg-primary px-6 py-3 text-lg font-semibold transition hover:bg-primary/90"
					on:click|preventDefault={(e) => {
						document.querySelector('#start-here')?.scrollIntoView({ behavior: 'smooth' });
					}}
				>
					Start Here
				</a>
				<a
					href="#apps"
					class="rounded-md border border-gray-700 bg-gray-800 px-6 py-3 text-lg font-semibold transition hover:bg-gray-700"
					on:click|preventDefault={(e) => {
						document.querySelector('#apps')?.scrollIntoView({ behavior: 'smooth' });
					}}
				>
					Explore Apps
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
