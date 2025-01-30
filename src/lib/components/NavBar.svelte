<script lang="ts">
	import { page } from '$app/stores';
	let isMenuOpen = false;
	let scrollY: number;
	let lastScrollY = 0;
	let isVisible = true;
	let isAtTop = true;

	function handleScroll() {
		scrollY = window.scrollY;
		isAtTop = scrollY < 50;

		if (!isAtTop) {
			isVisible = true;
		} else {
			isVisible = true;
			lastScrollY = scrollY;
		}
	}

	function scrollToSection(e: Event, id: string) {
		e.preventDefault();
		const isHomePage = $page.url.pathname === '/';

		if (!isHomePage) {
			window.location.href = `/?section=${id.replace('#', '')}`;
			return;
		}

		const element = document.querySelector(id);
		if (element) {
			const navHeight = 100;
			const elementPosition = element.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.scrollY - navHeight;

			window.scrollTo({
				top: offsetPosition,
				behavior: 'smooth'
			});
		}
		isMenuOpen = false;
	}
</script>

<svelte:window on:scroll={handleScroll} />

<div
	class="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 transition-transform duration-300"
	class:translate-y-[-100%]={!isVisible}
>
	<nav
		class="my-2 w-full max-w-2xl rounded-2xl border border-gray-800 bg-gray-900/80 backdrop-blur-sm transition-all duration-300"
		class:bg-transparent={isAtTop}
		class:border-transparent={isAtTop}
	>
		<div class="px-4 sm:px-6">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center">
					<a href="/" class="flex items-center">
						<img
							src="/images/logo.svg"
							alt="Local First Software"
							class="h-8 w-auto transition-transform duration-300"
							class:scale-125={isAtTop}
						/>
					</a>
				</div>

				<!-- Desktop Navigation -->
				<div
					class="hidden transition-opacity duration-300 md:block"
					class:opacity-0={isAtTop}
					class:pointer-events-none={isAtTop}
				>
					<div class="flex items-center space-x-4">
						<a
							href="#start-here"
							on:click={(e) => scrollToSection(e, '#start-here')}
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
							>Start Here</a
						>
						<a
							href="#apps"
							on:click={(e) => scrollToSection(e, '#apps')}
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
							>Build</a
						>
						<a
							href="/blog"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
							>Blog</a
						>
					</div>
				</div>

				<!-- Mobile menu button -->
				<div
					class="transition-opacity duration-300 md:hidden"
					class:opacity-0={isAtTop}
					class:pointer-events-none={isAtTop}
				>
					<button
						on:click={() => (isMenuOpen = !isMenuOpen)}
						class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none"
					>
						<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							{#if isMenuOpen}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							{:else}
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M4 6h16M4 12h16M4 18h16"
								/>
							{/if}
						</svg>
					</button>
				</div>
			</div>
		</div>

		<!-- Mobile menu -->
		{#if isMenuOpen && !isAtTop}
			<div class="space-y-1 px-2 pb-3 pt-2 sm:px-3 md:hidden">
				<a
					href="#start-here"
					on:click={(e) => scrollToSection(e, '#start-here')}
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
					>Start Here</a
				>
				<a
					href="#apps"
					on:click={(e) => scrollToSection(e, '#apps')}
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
					>Apps</a
				>
				<a
					href="/blog"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-300 hover:text-white"
					>Blog</a
				>
			</div>
		{/if}
	</nav>
</div>
