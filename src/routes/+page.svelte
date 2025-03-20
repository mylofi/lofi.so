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
		document.getElementById('apps')?.scrollIntoView({ behavior: 'smooth' });
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
	});
</script>

<Hero />

<div class="relative py-16">
	<SponsorsRail {nextEvent} {sponsors} eventData={eventDataForGraphic} />
	
	<div class="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-8">
		<div class="lg:flex">
			<!-- Main Content -->
			<div class="flex-1 xl:mr-[19.5rem]">
				<!-- 1. App Categories (Explore) -->
				<section id="apps" class="py-20 relative border border-gray-100 dark:border-gray-800 rounded-lg p-6 mb-8">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 bg-white dark:bg-gray-900 backdrop-blur-sm"
					>
						<div class="px-4 py-6 text-center">
							<h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								Explore
							</h2>
							<div class="w-20 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
							<!-- Tabs Navigation -->
							<div class="flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800/50">
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
						</div>
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
								{#if tab.items.length > 6}
									<div class="mt-8 text-center">
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
								{/if}
							{/if}
						{/each}
					</div>
				</section>

				<!-- 2. Monthly Meetup Sections -->
				<!-- Mobile version -->
				<div class="md:hidden">
					<section id="monthly-meetup" class="py-8 mb-8">
						<div class="flex flex-col items-center justify-between gap-8">
							<div class="flex-1">
								<EventGraphic eventData={eventDataForGraphic} />
							</div>
						</div>
					</section>
				</div>

				<!-- Desktop version -->
				<section id="monthly-meetup-desktop" class="hidden md:block border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div class="flex flex-col items-center justify-between gap-8 md:flex-row">
						<div class="flex-1">
							<EventGraphic eventData={eventDataForGraphic} />
						</div>
					</div>
				</section>

				<!-- 3. Learn Guide (vertical sections instead of tabs) -->
				<section id="start-here" class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 mb-8 px-4 py-6 text-center bg-white dark:bg-gray-900 backdrop-blur-sm"
					>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Learn</h2>
						<div class="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
					</div>
					
					<div class="relative">
						<!-- Read Content Section -->
						<h3 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Things to read</h3>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-12">
							{#each readContent.slice(0, 5) as item}
								<a
									href={item.url}
									class="relative overflow-hidden rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
								>
									<img src={item.icon} alt={item.title} class="mb-3 h-6 w-6" />

									<h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
										{item.title}
									</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
								</a>
							{/each}
						</div>
						
						<!-- Watch Content Section -->
						<h3 class="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Things to watch</h3>
						<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{#each watchContent.slice(0, 5) as item}
								<article
									class="relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
								>
									<div class="aspect-h-9 aspect-w-16 bg-gray-100 dark:bg-gray-900">
										<img src={item.icon} alt={item.title} class="object-cover" />
									</div>
									<div class="p-3">
										<h3
											class="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 dark:text-white"
										>
											{item.title}
										</h3>
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
						
						<!-- See More Link -->
						<div class="mt-8 text-center">
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
					</div>
				</section>

				<!-- 4. Local-first Mentions Feed -->
				<section class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 mb-8 bg-white dark:bg-gray-900 px-4 py-6 backdrop-blur-sm text-center"
					>
						<span class="text-primary text-xs font-semibold tracking-wider uppercase mb-2 block">Community</span>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Latest Mentions</h2>
						<div class="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
					</div>
					<div class="relative">
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
						<div class="mt-8 text-center">
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
					</div>
				</section>

				<!-- 5. Sponsors Section with tiered layout -->
				<section class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 mb-8 bg-white dark:bg-gray-900 px-4 py-6 backdrop-blur-sm text-center"
					>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Sponsors</h2>
						<div class="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
					</div>
					<div class="relative space-y-8">
						{#each ['Partner', 'Platinum', 'Gold'] as tier}
							{#if sponsors.some(s => s.tier === tier)}
								<div class="flex justify-center">
									<h3 class="inline-block py-8 text-center text-base font-medium text-gray-600 dark:text-gray-300 mb-4 bg-gray-100 dark:bg-gray-800/30 rounded-md min-w-full">
										{tier === 'Partner' ? 'in partnership with' : `${tier} Sponsors`}
									</h3>
								</div>
								<div class="grid gap-{tier === 'Gold' ? 6 : 8} {tier === 'Gold' ? 'md:grid-cols-5' : 'md:grid-cols-2'} justify-items-center">
									{#each sponsors.filter(s => s.tier === tier) as sponsor}
										<a 
											href={sponsor.url} 
											target="_blank" 
											rel="noopener noreferrer" 
											class="block p-{tier === 'Partner' ? 8 : tier === 'Platinum' ? 6 : 4} transition-all duration-200 hover:bg-gray-50 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 w-full"
										>
											<img 
												src={sponsor.image} 
												alt={sponsor.name} 
												class="h-{tier === 'Partner' ? 16 : tier === 'Platinum' ? 14 : 10} w-auto mx-auto opacity-75 dark:opacity-50 grayscale dark:brightness-0 dark:invert transition-all duration-300 hover:opacity-100 hover:grayscale-0 hover:brightness-100 hover:invert-0" 
											/>
										</a>
									{/each}
								</div>
							{/if}
						{/each}
					</div>
					
				</section>
			</div>
		</div>
	</div>
</div>
