<script lang="ts">
	import { page } from '$app/stores';
	import { theme, toggleTheme } from '$lib/stores/themeStore';
	let isMenuOpen = false;
	let scrollY: number;
	let lastScrollY = 0;
	let isVisible = true;
	let isAtTop = true;

	function handleScroll() {
		scrollY = window.scrollY;
		isAtTop = scrollY < 200;

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
	class="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 transition-transform duration-300 {!isAtTop
		? 'bg-white/80 backdrop-blur-sm dark:bg-gray-900/80'
		: ''}"
	class:translate-y-[-100%]={!isVisible}
>
	<nav
		class="my-2 w-full max-w-2xl rounded-2xl border transition-all duration-300 {!isAtTop
			? 'border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80'
			: 'border-transparent bg-transparent'}"
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
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
							>Start Here</a
						>
						<a
							href="#apps"
							on:click={(e) => scrollToSection(e, '#apps')}
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
							>Build</a
						>
						<a
							href="/blog"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
							>Blog</a
						>
						<button
							on:click={toggleTheme}
							class="rounded-md p-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
							aria-label="Toggle theme"
						>
							{#if $theme === 'dark'}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fill-rule="evenodd"
										d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
										clip-rule="evenodd"
									/>
								</svg>
							{:else}
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
								</svg>
							{/if}
						</button>
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
						class="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
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
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>Start Here</a
				>
				<a
					href="#apps"
					on:click={(e) => scrollToSection(e, '#apps')}
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>Apps</a
				>
				<a
					href="/blog"
					class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
					>Blog</a
				>
				<button
					on:click={toggleTheme}
					class="block w-full rounded-md px-3 py-2 text-left text-base font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
				>
					{$theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
				</button>
			</div>
		{/if}
	</nav>
</div>
