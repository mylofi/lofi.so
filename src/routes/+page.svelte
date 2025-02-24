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
	let activeLearnTab = 'read';

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

	function setActiveLearnTab(tabId: string) {
		activeLearnTab = tabId;
		document.getElementById('start-here')?.scrollIntoView({ behavior: 'smooth' });
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

<!-- Monthly Meetup Section - Visible only on small screens -->
<div class="md:hidden">
	<section id="monthly-meetup" class="py-8">
		<div class="flex flex-col items-center justify-between gap-8">
			<div class="flex-1">
				<EventGraphic eventData={eventDataForGraphic} />
			</div>
		</div>
	</section>
</div>

<div class="relative py-16">
	<SponsorsRail {nextEvent} {sponsors} eventData={eventDataForGraphic} />

	<div class="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-8">
		<div class="lg:flex">
			<!-- Main Content -->
			<div class="flex-1 xl:mr-[19.5rem]">
				<!-- Start Here/Learn Guide -->
				<section id="start-here" class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 mb-8 px-4 py-6 text-center bg-white dark:bg-gray-900 backdrop-blur-sm"
					>
						<!-- <span class="text-primary text-xs font-semibold tracking-wider uppercase mb-2 block">Get Started</span> -->
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Learn</h2>
						<div class="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
					</div>
					<div class="relative">
						<div class="flex gap-8">
							<!-- Vertical Tabs -->
							<div class="sticky top-[var(--vertical-tabs-offset)] h-fit flex-shrink-0">
								<div class="flex flex-col space-y-2">
									<button
										class={`rounded-lg px-4 py-2 text-left text-sm font-medium transition-all duration-200 ${
											activeLearnTab === 'read'
												? 'bg-gray-100 text-primary shadow-sm dark:bg-gray-800'
												: 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
										}`}
										on:click={() => setActiveLearnTab('read')}
									>
										Read
									</button>
									<button
										class={`rounded-lg px-4 py-2 text-left text-sm font-medium transition-all duration-200 ${
											activeLearnTab === 'watch'
												? 'bg-gray-100 text-primary shadow-sm dark:bg-gray-800'
												: 'text-gray-500 hover:bg-gray-100/50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/50 dark:hover:text-white'
										}`}
										on:click={() => setActiveLearnTab('watch')}
									>
										Watch
									</button>
								</div>
							</div>

							<!-- Content Grid -->
							<div class="flex-1">
								<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
									{#if activeLearnTab === 'read'}
										{#each readContent as item}
											<a
												href={item.url}
												class="block rounded-lg bg-gray-200 p-4 shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
											>
												<img src={item.icon} alt={item.title} class="mb-3 h-6 w-6" />

												<h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-white">
													{item.title}
												</h3>
												<p class="text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
											</a>
										{/each}
									{:else}
										{#each watchContent as item}
											<article
												class="overflow-hidden rounded-lg bg-gray-200 shadow-sm dark:bg-gray-800"
											>
												<div class="aspect-h-9 aspect-w-16 bg-gray-100 dark:bg-gray-900">
													<img src={item.icon} alt={item.title} class="object-cover" />
												</div>
												<div class="p-4">
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
									{/if}
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- Local-first Mentions Feed -->
				<section class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 mb-8 bg-white dark:bg-gray-900 px-4 py-6 backdrop-blur-sm"
					>
						<span class="text-primary text-xs font-semibold tracking-wider uppercase mb-2 block">Community</span>
						<div class="flex items-center justify-between">
							<h2 class="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Latest Mentions</h2>
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
						<div class="w-20 h-1 bg-primary mt-4 rounded-full"></div>
					</div>
					<div class="relative">
						<div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
							{#each mentions.mentions as mention}
								<article class="relative overflow-hidden rounded-lg border border-gray-100 bg-white p-3 transition-all hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20">
									<!-- Author and Date -->
									<div class="mb-1.5 flex items-center justify-between gap-2">
										<span class="text-xs font-medium text-gray-900 dark:text-white">{mention.author}</span>
										<time class="text-xs text-gray-400" datetime={mention.date}>
											{new Date(mention.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
										</time>
									</div>

									<!-- Content -->
									<h3 class="mb-1 line-clamp-2 text-sm font-medium leading-snug text-gray-900 dark:text-white">
										{mention.title}
									</h3>
									<p class="mb-2 line-clamp-2 text-xs text-gray-500 dark:text-gray-400">
										{mention.excerpt}
									</p>

									<!-- Link -->
									<a
										href={mention.url}
										class="text-xs font-medium text-primary hover:underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										Read on {mention.platform}
									</a>
								</article>
							{/each}
						</div>
					</div>
				</section>

				<!-- Monthly Meetup Section - For medium screens and up -->
				<section id="monthly-meetup-desktop" class="hidden md:block border border-gray-100 dark:border-gray-800 rounded-lg mb-8 ">
					<div class="flex flex-col items-center justify-between gap-8 md:flex-row">
						<div class="flex-1">
							<EventGraphic eventData={eventDataForGraphic} />
						</div>
					</div>
				</section>

				<!-- Apps to Try Section -->
				<section id="apps-to-try" class="py-16 relative border border-gray-100 dark:border-gray-800 rounded-lg mb-8 p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 mb-8 bg-white dark:bg-gray-900 px-4 py-6 backdrop-blur-sm text-center"
					>
						<!-- <span class="text-primary text-xs font-semibold tracking-wider uppercase mb-2 block">Explore</span> -->
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Discover Software</h2>
						<div class="w-20 h-1 bg-primary mx-auto mt-4 rounded-full"></div>
						<p class="text-md mt-4 text-gray-600 dark:text-gray-300">
							That put you in control of your data
						</p>
					</div>
					<div class="relative">
						<div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
							{#each content[2].sections.find((s) => s.title === 'Apps to try')?.items || [] as app}
								<a
									href={app.url}
									class="group flex flex-col overflow-hidden rounded-lg bg-gray-200 shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-white/10 max-w-[240px] mx-auto w-full"
								>
									<div class="flex h-12 items-center justify-center bg-gray-100 p-3 dark:bg-gray-700">
										<img src={app.icon} alt={app.title} class="h-6 w-6 object-contain" />
									</div>
									<div class="flex flex-1 flex-col justify-between p-4">
										<div>
											<h3
												class="text-lg font-semibold text-gray-900 group-hover:text-primary dark:text-white"
											>
												{app.title}
											</h3>
											<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">By {app.author}</p>
										</div>
										<div class="mt-3 flex items-center text-primary">
											<span class="text-sm font-medium">Try it now</span>
											<svg class="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
												<path
													fill-rule="evenodd"
													d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
													clip-rule="evenodd"
												/>
											</svg>
										</div>
									</div>
								</a>
							{/each}
						</div>
					</div>
				</section>

				<!-- App Categories -->
				<section id="apps" class="py-20 relative border border-gray-100 dark:border-gray-800 rounded-lg p-6">
					<div
						class="sticky top-[calc(var(--navbar-height)-1rem)] -mt-4 z-20 -mx-4 bg-white dark:bg-gray-900 backdrop-blur-sm"
					>
						<div class="px-4 py-6 text-center">
							<!-- <span class="text-primary text-xs font-semibold tracking-wider uppercase mb-2 block">Tools</span> -->
							<h2 class="text-3xl font-bold mb-4 text-gray-900 dark:text-white bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
								Local-First Tools
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
									{#each tab.items as item}
										<a
											href={item.url}
											class="group relative overflow-hidden rounded-2xl bg-gray-200 p-4 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
										>
											<div class="flex items-start gap-3">
												<img
													src={item.icon}
													alt={item.title}
													class="h-12 w-12 rounded-xl"
												/>
												<div class="flex-1">
													<h4
														class={`text-base font-semibold text-gray-900 group-hover:text-${tab.color} dark:text-white`}
													>
														{item.title}
													</h4>
													<p class="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{item.author}</p>
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
				</section>
			</div>
		</div>
	</div>
</div>
