<script lang="ts">
	import { page } from '$app/stores';
	import { theme, toggleTheme } from '$lib/stores/themeStore';
	import SearchButton from './SearchButton.svelte';
	import SearchModal from './SearchModal.svelte';
	import { toggleSearchModal } from '$lib/stores/searchStore';
	import { browser } from '$app/environment';
	
	let isMenuOpen = false;
	let scrollY: number;
	let lastScrollY = 0;
	let isVisible = true;
	let isAtTop = true;
	
	// Determine the keyboard shortcut based on platform
	let shortcutKey = '⌘K';
	
	if (browser) {
		// Check if we're on Windows/Linux or Mac
		shortcutKey = navigator.platform.indexOf('Mac') >= 0 ? '⌘K' : 'Ctrl+K';
	}

	function handleScroll() {
		scrollY = window.scrollY;
		isAtTop = scrollY < 20;

		// Only apply scroll-based visibility on the homepage
		if ($page.url.pathname === '/') {
			if (!isAtTop) {
				isVisible = true;
			} else {
				isVisible = true;
				lastScrollY = scrollY;
			}
		} else {
			// Always visible on non-homepage routes
			isVisible = true;
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
			const navHeight = parseInt(
				getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')
			);
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
	class="fixed left-0 right-0 z-40 transition-all duration-300 {!isAtTop || $page.url.pathname !== '/'
		? 'bg-white/80 backdrop-blur-sm dark:bg-gray-900/80'
		: ''}"
	class:translate-y-[-100%]={!isVisible && $page.url.pathname === '/'}
>
	<nav
		class="w-full border transition-all duration-300 {!isAtTop || $page.url.pathname !== '/'
			? 'border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-900/80'
			: 'border-transparent bg-transparent'}"
	>
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center">
					<a href="/" class="flex items-center">
						<img
							src="/images/logo.svg"
							alt="Local First Software"
							class="h-10 w-auto transition-transform duration-300"
							class:scale-125={isAtTop}
						/>
					</a>
				</div>

				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center space-x-4">
					<div
						class="flex items-center space-x-4 transition-opacity duration-300"
						class:opacity-0={isAtTop && $page.url.pathname === '/'}
						class:pointer-events-none={isAtTop && $page.url.pathname === '/'}
					>
						<a
							href="/learn"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
							>Learn</a
						>
						<a
							href="/directory"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
							>Directory</a
						>
						<a
							href="/blog"
							class="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
							>Blog</a
						>
					</div>
					<SearchButton />
					<button
						on:click={toggleTheme}
						class="rounded-md p-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary"
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

				<!-- Mobile menu button and theme toggle -->
				<div class="flex items-center space-x-2 md:hidden">
					<SearchButton />
					<button
						on:click={toggleTheme}
						class="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
						aria-label="Toggle theme"
					>
						{#if $theme === 'dark'}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-6 w-6"
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
								class="h-6 w-6"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
							</svg>
						{/if}
					</button>
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
		{#if isMenuOpen}
			<div class="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
				<div class="space-y-1 px-4 py-3">
					<a
						href="/learn"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary"
						>Learn</a
					>
					<a
						href="/directory"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary"
						>Directory</a
					>
					<a
						href="/blog"
						class="block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary"
						>Blog</a
					>
					<button
						on:click={() => {
							toggleSearchModal();
							isMenuOpen = false;
						}}
						class="w-full text-left block rounded-md px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-primary"
					>
						Search <span class="text-xs text-gray-500 dark:text-gray-400 ml-1">{shortcutKey}</span>
					</button>
				</div>
			</div>
		{/if}
	</nav>
</div>

<!-- Search Modal -->
<SearchModal />
