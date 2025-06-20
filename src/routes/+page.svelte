<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import EventGraphic from '$lib/components/EventGraphic.svelte';
	const { content, heading, sponsorsData, mentions, eventDataForGraphic } = data;
	const { sponsors: rawSponsors, nextEvent } = sponsorsData;
	const sponsors = rawSponsors as {
		url: string;
		image: string;
		name: string;
		tier: 'Partner' | 'Platinum' | 'Gold';
	}[];
	import Hero from '$lib/components/Hero.svelte';
	import SponsorsRail from '$lib/components/SponsorsRail.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	// Add state for active tab
	let activeTab = 'storage';
	
	// State for explore header animation
	let isScrolled = false;
	
	// Get read and watch content
	const readContent = content[0].sections.find((s) => s.title === 'Things to read')?.items || [];
	const watchContent = [
		...(content[0].sections.find((s) => s.title === 'Things to watch')?.items || []),
		...(content[0].sections.find((s) => s.title === 'Recent Videos & Talks')?.items || [])
	];

	// Define tab categories
	const tabs = [
		{ id: 'storage', label: 'Storage', color: 'primary', items: content[1].sections[0].items },
		{
			id: 'collaboration',
			label: 'Sync & Collaboration',
			color: '[#5865F2]',
			items: content[1].sections[1]?.items || []
		},
		{
			id: 'development',
			label: 'Development Tools',
			color: 'primary',
			items: content[1].sections[2]?.items || []
		}
	];

	// Function to handle tab change
	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	onMount(() => {
		const section = $page.url.searchParams.get('section');
		if (section) {
			const element = document.querySelector(`#${section}`);
			if (element) {
				const navHeight = 100;
				const elementPosition = element.getBoundingClientRect().top;
				const offsetPosition = elementPosition + window.scrollY - navHeight;

				window.scrollTo({
					top: offsetPosition,
					behavior: 'smooth'
				});
			}
		}
		
		// Add scroll event listener for explore header animation
		const exploreSection = document.getElementById('explore');
		const exploreStickyHeader = document.getElementById('explore-header');
		const navbarHeight = document.documentElement.style.getPropertyValue('--navbar-height') || '80px';
		const navHeight = parseInt(navbarHeight) || 80;
		
		if (exploreSection && exploreStickyHeader) {
			window.addEventListener('scroll', () => {
				const scrollPosition = window.scrollY;
				const exploreSectionTop = exploreSection.offsetTop;
				const exploreSectionRect = exploreSection.getBoundingClientRect();
				
				// Check if the section has reached the navbar
				isScrolled = exploreSectionRect.top <= navHeight;
			});
		}
	});
</script>

<Hero />

<div class="relative py-16">
	<SponsorsRail {nextEvent} {sponsors} eventData={eventDataForGraphic} />
	
	<div class="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-8">
		<div class="lg:flex">
			<!-- Main Content -->
			<div class="flex-1 xl:mr-[19.5rem]">
				<!-- Parent Explore Section with Sticky Header -->
				<section id="explore" class="relative">
					<!-- Main Sticky Header -->
					<div
						id="explore-header"
						class="sticky top-[calc(var(--navbar-height)-1rem)] z-30 bg-white dark:bg-gray-900 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 mb-16 py-6 transition-all duration-300 ease-in-out"
					>
						<div class="px-4 transition-all duration-300 ease-in-out text-center">
							<h2 class="transition-all duration-300 ease-in-out bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-bold mb-4 text-gray-900 dark:text-white" class:text-3xl={!isScrolled} class:text-xl={isScrolled}>
								Explore
							</h2>
							<div class="h-1 bg-primary rounded-full transition-all duration-300 ease-in-out mx-auto" class:w-20={!isScrolled} class:w-12={isScrolled}></div>
						</div>
					</div>

					<!-- 1. Join Us Section (Meetup Graphic) -->
					<section id="join-us" class="py-12 relative border border-gray-100 dark:border-gray-800 rounded-lg p-6 mb-8 mt-8">
						<div 
							class="sticky top-[calc(var(--navbar-height)+5rem)] z-20 -mx-4 -mt-6 mb-8 px-4 py-8 bg-white dark:bg-gray-900 backdrop-blur-sm text-left border-b border-gray-100 dark:border-gray-800"
							
						>
							<h3 class="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Join Us</h3>
						</div>
						<div class="pt-6 md:block rounded-lg mb-2">
							<div class="flex flex-col items-center justify-center md:flex-row">
								<div class="w-full max-w-4xl mx-auto">
									<EventGraphic eventData={eventDataForGraphic} />
								</div>
							</div>
						</div>
					</section>

					<!-- 2. Learn Section -->
					<section id="learn" class="py-12 relative border border-gray-100 dark:border-gray-800 rounded-lg p-6 mb-8">
						<div
							class="sticky top-[calc(var(--navbar-height)+5rem)] z-20 -mx-4 -mt-6 mb-8 px-4 py-8 bg-white dark:bg-gray-900 backdrop-blur-sm flex justify-between items-center border-b border-gray-100 dark:border-gray-800"
						>
							<h3 class="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Learn</h3>
							<a href="/learn" class="inline-flex items-center text-primary hover:text-primary/80">
								See more
								<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</a>
						</div>
						
						<div class="pt-6 relative">
							<!-- Read Content Section -->
							<h4 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Things to read</h4>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
								{#each readContent.slice(0, 5) as item}
									<a
										href={item.url}
										class="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
									>
										<img src={item.icon} alt={item.title} class="mb-3 h-6 w-6" />

										<h5 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
											{item.title}
										</h5>
										<p class="text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
									</a>
								{/each}
							</div>
							
							<!-- Watch Content Section -->
							<h4 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Things to watch</h4>
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{#each watchContent.slice(0, 5) as item}
									<article
										class="relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
									>
										<div class="aspect-h-9 aspect-w-16 bg-gray-100 dark:bg-gray-900">
											<img src={item.icon} alt={item.title} class="object-cover" />
										</div>
										<div class="p-3">
											<h5
												class="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white"
											>
												{item.title}
											</h5>
											<p class="mb-3 text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
											<a
												href={item.url}
												class="inline-flex items-center text-primary hover:text-primary/80"
											>
												Watch now
												<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
													<path
														fill-rule="evenodd"
														d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
														clip-rule="evenodd"
													/>
												</svg>
											</a>
										</div>
									</article>
								{/each}
							</div>
						</div>
					</section>

					<!-- 3. Feed Section -->
					<section id="feed" class="py-12 relative border border-gray-100 dark:border-gray-800 rounded-lg p-6 mb-8">
						<div
							class="sticky top-[calc(var(--navbar-height)+5rem)] z-20 -mx-4 -mt-6 mb-8 px-4 py-8 bg-white dark:bg-gray-900 backdrop-blur-sm flex justify-between items-center border-b border-gray-100 dark:border-gray-800"
						>
							<div class="text-left">
								<span class="text-primary text-xs font-semibold tracking-wider uppercase mb-2 block">Community</span>
								<h3 class="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Feed</h3>
							</div>
							<a href="/mentions" class="inline-flex items-center text-primary hover:text-primary/80">
								See all mentions
								<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</a>
						</div>
						<div class="pt-6 relative">
							<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
								{#each mentions.mentions.slice(0, 3) as mention}
									<article class="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20">
										<!-- Author and Date -->
										<div class="mb-3 flex items-center justify-between">
											<span class="text-sm font-medium text-gray-900 dark:text-white">{mention.author}</span>
											<time class="text-sm text-gray-500" datetime={mention.date}>
												{new Date(mention.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
											</time>
										</div>

										<!-- Content -->
										<h3 class="mb-2 text-base font-semibold leading-snug text-gray-900 dark:text-white">
											{mention.title}
										</h3>
										<p class="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
											{mention.excerpt}
										</p>

										<!-- Link -->
										<a
											href={mention.url}
											class="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80"
											target="_blank"
											rel="noopener noreferrer"
										>
											Read on {mention.platform}
											<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
												<path
													fill-rule="evenodd"
													d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
													clip-rule="evenodd"
												/>
											</svg>
										</a>
									</article>
								{/each}
							</div>
						</div>
					</section>

					<!-- 4. Directory Section (App Categories) -->
					<section id="directory" class="py-12 relative border border-gray-100 dark:border-gray-800 rounded-lg p-6 mb-8">
						<div
							class="sticky top-[calc(var(--navbar-height)+5rem)] z-20 -mx-4 -mt-6 mb-8 px-4 py-8 bg-white dark:bg-gray-900 backdrop-blur-sm flex justify-between items-center border-b border-gray-100 dark:border-gray-800"
						>
							<h3 class="text-2xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Directory</h3>
							<a href="/directory" class="inline-flex items-center text-primary hover:text-primary/80">
								Discover more software
								<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
										clip-rule="evenodd"
									/>
								</svg>
							</a>
						</div>
						
						<div class="pt-6 relative">
							<!-- Tabs Navigation -->
							<div class="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800/50 mb-8">
								{#each tabs as tab}
									<button
										class={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
											activeTab === tab.id
												? `bg-white text-${tab.color} shadow-sm dark:bg-gray-800`
												: 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
										}`}
										on:click={() => setActiveTab(tab.id)}
									>
										{tab.label}
									</button>
								{/each}
							</div>

							<!-- Tab Content -->
							<div class="mt-8">
								{#each tabs as tab}
									{#if activeTab === tab.id}
										<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
											{#each tab.items.slice(0, 6) as item}
												<a
													href={item.url}
													class="group relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
												>
													<div class="flex items-start gap-3">
														<img
															src={item.icon}
															alt={item.title}
															class="h-12 w-12 rounded-xl"
														/>
														<div class="flex-1">
															<h4
																class="mb-1 text-base font-semibold text-gray-900 dark:text-white"
															>
																{item.title}
															</h4>
															<p class="text-sm text-gray-500 dark:text-gray-400">{item.author}</p>
														</div>
													</div>
													<div class="mt-3">
														<span
															class={`inline-flex items-center rounded-full bg-${tab.color}/10 px-2.5 py-0.5 text-xs font-medium text-${tab.color}`}
														>
															{tab.label}
														</span>
													</div>
												</a>
											{/each}
										</div>
									{/if}
								{/each}
							</div>
						</div>
					</section>
				</section>

				<!-- 5. Sponsors Section with tiered layout -->
				<section class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] z-30 bg-white dark:bg-gray-900 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 mb-8 py-6 -mx-4 px-4 text-center"
					>
						<h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Sponsors</h2>
						<div class="w-20 h-1 bg-primary mx-auto rounded-full"></div>
					</div>
					<div class="relative space-y-12">
						<!-- Partners Row -->
						<div class="flex flex-wrap justify-center gap-8">
							{#each sponsors.filter(s => s.tier === 'Partner') as sponsor}
								<a 
									href={sponsor.url} 
									target="_blank" 
									rel="noopener noreferrer" 
									class="group block p-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10"
									style="height: 150px; width: 300px;"
								>
									<div class="flex h-full w-full items-center justify-center">
										<img 
											src={sponsor.image} 
											alt={sponsor.name} 
											style="max-height: 110px;"
											class="w-auto mx-auto opacity-75 dark:opacity-50 grayscale dark:brightness-0 dark:invert group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0 transition-all duration-300" 
										/>
									</div>
								</a>
							{/each}
						</div>
						
						<!-- Platinum Row -->
						<div class="flex flex-wrap justify-center gap-8">
							{#each sponsors.filter(s => s.tier === 'Platinum') as sponsor}
								<a 
									href={sponsor.url} 
									target="_blank" 
									rel="noopener noreferrer" 
									class="group block p-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10"
									style="height: 120px; width: 250px;"
								>
									<div class="flex h-full w-full items-center justify-center">
										<img 
											src={sponsor.image} 
											alt={sponsor.name} 
											style="max-height: 80px;"
											class="w-auto mx-auto opacity-75 dark:opacity-50 grayscale dark:brightness-0 dark:invert group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0 transition-all duration-300" 
										/>
									</div>
								</a>
							{/each}
						</div>
						
						<!-- Gold Row -->
						<div class="flex flex-wrap justify-center gap-8">
							{#each sponsors.filter(s => s.tier === 'Gold') as sponsor}
								<a 
									href={sponsor.url} 
									target="_blank" 
									rel="noopener noreferrer" 
									class="group block p-6 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10"
									style="height: 90px; width: 200px;"
								>
									<div class="flex h-full w-full items-center justify-center">
										<img 
											src={sponsor.image} 
											alt={sponsor.name}
											style="max-height: 50px;" 
											class="w-auto mx-auto opacity-75 dark:opacity-50 grayscale dark:brightness-0 dark:invert group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:invert-0 transition-all duration-300" 
										/>
									</div>
								</a>
							{/each}
						</div>
					</div>
				</section>
			</div>
		</div>
	</div>
</div>
