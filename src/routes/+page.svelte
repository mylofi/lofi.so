<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import EventGraphic from '$lib/components/EventGraphic.svelte';
	const { content, heading, sponsorsData, mentions } = data;
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
				<EventGraphic />
				<div class="m-8">
					<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Join our Monthly Meetup</h2>
					<p class="mt-4 text-lg text-gray-600 dark:text-gray-300">{heading.meetup.date}</p>
				</div>
			</div>
		</div>
	</section>
</div>

<div class="relative py-16">
	<SponsorsRail {nextEvent} {sponsors} />

	<div class="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-8">
		<div class="lg:flex">
			<!-- Main Content -->
			<div class="flex-1 xl:mr-[19.5rem]">
				<!-- Start Here Guide -->
				<section id="start-here" class="py-16">
					<div class="sticky top-[5rem] z-10 -mx-4 mb-8 px-4 py-4 dark:bg-transparent">
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Learn</h2>
					</div>
					<div class="flex gap-8">
						<!-- Vertical Tabs -->
						<div class="sticky top-[9.5rem] h-fit flex-shrink-0">
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
							<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
								{#if activeLearnTab === 'read'}
									{#each readContent as item}
										<a
											href={item.url}
											class="block rounded-lg bg-gray-200 p-6 shadow-sm transition hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
										>
											<img src={item.icon} alt={item.title} class="mb-4 h-8 w-8" />

											<h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
												{item.title}
											</h3>
											<p class="text-gray-500 dark:text-gray-400">By {item.author}</p>
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
											<div class="p-6">
												<h3
													class="mb-3 line-clamp-2 text-xl font-semibold text-gray-900 dark:text-white"
												>
													{item.title}
												</h3>
												<p class="mb-4 text-gray-500 dark:text-gray-400">By {item.author}</p>
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
				</section>

				<!-- Local-first Mentions Feed -->
				<section class="py-16">
					<div
						class="sticky top-[5rem] z-10 -mx-4 mb-8 bg-white/80 px-4 py-4 backdrop-blur-sm dark:bg-gray-900/80"
					>
						<h2 class="text-3xl font-bold text-gray-900 dark:text-white">Latest Mentions</h2>
					</div>
					<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
						{#each mentions.mentions as mention}
							<article class="overflow-hidden rounded-lg bg-gray-200 shadow-sm dark:bg-gray-800">
								<div class="p-6">
									<div class="mb-4 flex items-center">
										<div class="ml-3">
											<p class="font-medium text-gray-900 dark:text-white">{mention.author}</p>
											<p class="text-sm text-gray-500 dark:text-gray-400">on {mention.platform}</p>
											<p class="text-xs text-gray-400 dark:text-gray-500">{mention.date}</p>
										</div>
									</div>
									<h3 class="mb-3 line-clamp-2 text-xl font-semibold text-gray-900 dark:text-white">
										{mention.title}
									</h3>
									<p class="mb-4 line-clamp-3 text-gray-500 dark:text-gray-400">
										{mention.excerpt}
									</p>
									<a
										href={mention.url}
										class="inline-flex items-center text-primary hover:text-primary/80"
									>
										Read more
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
				</section>

				<!-- Monthly Meetup Section - For medium screens and up -->
				<section id="monthly-meetup-desktop" class="hidden md:block">
					<div class="flex flex-col items-center justify-between gap-8 md:flex-row">
						<div class="flex-1">
							<EventGraphic />
						</div>
					</div>
				</section>

				<!-- App Categories -->
				<section id="apps" class="py-16">
					<div
						class="sticky top-[5rem] z-10 -mx-4 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80"
					>
						<div class="px-4 py-4">
							<h2 class="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
								Local-First Apps & Tools
							</h2>
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
								<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{#each tab.items as item}
										<a
											href={item.url}
											class="group relative overflow-hidden rounded-2xl bg-gray-200 p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
										>
											<div class="flex items-start gap-4">
												<img
													src={item.icon}
													alt={item.title}
													class="h-16 w-16 rounded-xl shadow-lg"
												/>
												<div class="flex-1">
													<h4
														class={`text-lg font-semibold text-gray-900 group-hover:text-${tab.color} dark:text-white`}
													>
														{item.title}
													</h4>
													<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.author}</p>
												</div>
											</div>
											<div class="mt-4">
												<span
													class={`inline-flex items-center rounded-full bg-${tab.color}/10 px-3 py-1 text-xs font-medium text-${tab.color}`}
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
