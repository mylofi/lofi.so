<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	const { content, heading, sponsorsData } = data;
	const { sponsors: rawSponsors, nextEvent } = sponsorsData;
	const sponsors = rawSponsors as {
		url: string;
		image: string;
		name: string;
		tier: 'Partner' | 'Platinum' | 'Gold';
	}[];
	import Hero from '$lib/components/Hero.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import NavBar from '$lib/components/NavBar.svelte';
	import SponsorsRail from '$lib/components/SponsorsRail.svelte';

	// Add state for active tab
	let activeTab = 'storage';

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
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<NavBar />
	<Hero />

	<!-- Monthly Meetup Section - Visible only on small screens -->
	<div class="md:hidden">
		<section id="monthly-meetup" class="py-8">
			<div class="mx-4 rounded-2xl bg-gradient-to-r from-primary to-discord">
				<div class="flex flex-col items-center justify-between gap-8">
					<div class="flex-1">
						<img
							src="/images/meetup22.png"
							alt="LoFi/22 Local First Meetup #22"
							class="mb-6 w-full rounded-lg shadow-lg"
						/>
						<div class="m-8">
							<h2 class="text-3xl font-bold">Join our Monthly Meetup</h2>
							<p class="mt-4 text-lg">{heading.meetup.date}</p>
							<div class="mt-6 flex flex-wrap gap-4">
								<a
									href={heading.meetup.discord_link}
									class="inline-flex items-center rounded-md bg-white/10 px-6 py-3 transition-colors hover:bg-white/20"
								>
									<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"
										><path
											d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
										/></svg
									>
									Join on Discord
								</a>
								<a
									href={heading.meetup.gcal_link}
									class="inline-flex items-center rounded-md bg-white/10 px-6 py-3 transition-colors hover:bg-white/20"
								>
									<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"
										><path
											d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
										/></svg
									>
									Add to Calendar
								</a>
							</div>
						</div>
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
						<h2 class="mb-8 text-3xl font-bold">Learn</h2>
						<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{#each content[0].sections[0].items.slice(0, 6) as item}
								<a
									href={item.url}
									class="block rounded-lg bg-gray-800 p-6 transition hover:bg-gray-700"
								>
									<img src={item.icon} alt={item.title} class="mb-4 h-8 w-8" />
									<h3 class="mb-2 text-xl font-semibold">{item.title}</h3>
									<p class="text-gray-400">By {item.author}</p>
								</a>
							{/each}
						</div>
					</section>

					<!-- Local-first Mentions Feed -->
					<section class="py-16">
						<h2 class="mb-8 text-3xl font-bold">Latest Mentions</h2>
						<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{#each content[0].sections[0].items.slice(0, 3) as item}
								<article class="overflow-hidden rounded-lg bg-gray-800">
									<div class="p-6">
										<div class="mb-4 flex items-center">
											<img src={item.icon} alt={item.title} class="h-8 w-8 rounded-full" />
											<div class="ml-3">
												<p class="font-medium">{item.author}</p>
												<p class="text-sm text-gray-400">Recently shared</p>
											</div>
										</div>
										<h3 class="mb-3 line-clamp-2 text-xl font-semibold">
											{item.title}
										</h3>
										<a
											href={item.url}
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

					<!-- Recent Videos & Talks -->
					<section class="bg-gray-800/50 px-7 py-7">
						<h2 class="mb-7 text-3xl font-bold">Recent Videos & Talks</h2>
						<div class="mb-7 h-px bg-gray-700"></div>
						<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
							{#each content[0].sections[1].items.slice(0, 3) as item}
								<article class="overflow-hidden rounded-lg bg-gray-800">
									<div class="aspect-h-9 aspect-w-16 bg-gray-900">
										<img src={item.icon} alt={item.title} class="object-cover" />
									</div>
									<div class="p-6">
										<h3 class="mb-3 line-clamp-2 text-xl font-semibold">
											{item.title}
										</h3>
										<p class="mb-4 text-gray-400">By {item.author}</p>
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
					</section>

					<!-- Monthly Meetup Section - For medium screens and up -->
					<section id="monthly-meetup-desktop" class="hidden py-16 md:block">
						<div class="max-w-xl rounded-2xl bg-gradient-to-r from-primary to-discord">
							<div class="flex flex-col items-center justify-between gap-8 md:flex-row">
								<div class="flex-1">
									<img
										src="/images/meetup22.png"
										alt="LoFi/22 Local First Meetup #22"
										class="mb-6 w-full rounded-lg shadow-lg"
									/>
									<div class="m-8">
										<h2 class="text-3xl font-bold">Join our Monthly Meetup</h2>
										<p class="mt-4 text-lg">{heading.meetup.date}</p>
										<div class="mt-6 flex flex-wrap gap-4">
											<a
												href={heading.meetup.discord_link}
												class="inline-flex items-center rounded-md bg-white/10 px-6 py-3 transition-colors hover:bg-white/20"
											>
												<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"
													><path
														d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"
													/></svg
												>
												Join on Discord
											</a>
											<a
												href={heading.meetup.gcal_link}
												class="inline-flex items-center rounded-md bg-white/10 px-6 py-3 transition-colors hover:bg-white/20"
											>
												<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor"
													><path
														d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
													/></svg
												>
												Add to Calendar
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>

					<!-- App Categories -->
					<section id="apps" class="py-16">
						<div class="mb-8">
							<h2 class="mb-8 text-3xl font-bold">Local-First Apps & Tools</h2>
							<!-- Tabs Navigation -->
							<div class="flex space-x-1 rounded-xl bg-gray-800/50 p-1">
								{#each tabs as tab}
									<button
										class="flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 {activeTab ===
										tab.id
											? `bg-gray-800 text-${tab.color} shadow-sm`
											: 'text-gray-400 hover:bg-gray-800/50 hover:text-white'}"
										on:click={() => setActiveTab(tab.id)}
									>
										{tab.label}
									</button>
								{/each}
							</div>
						</div>

						<!-- Tab Content -->
						{#each tabs as tab}
							{#if activeTab === tab.id}
								<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
									{#each tab.items as item}
										<a
											href={item.url}
											class="group relative overflow-hidden rounded-2xl bg-gray-800 p-6 transition-all duration-300 hover:scale-[1.02] hover:bg-gray-700"
										>
											<div class="flex items-start gap-4">
												<img
													src={item.icon}
													alt={item.title}
													class="h-16 w-16 rounded-xl shadow-lg"
												/>
												<div class="flex-1">
													<h4 class="text-lg font-semibold group-hover:text-{tab.color}">
														{item.title}
													</h4>
													<p class="mt-1 text-sm text-gray-400">{item.author}</p>
												</div>
											</div>
											<div class="mt-4">
												<span
													class="inline-flex items-center rounded-full bg-{tab.color}/10 px-3 py-1 text-xs font-medium text-{tab.color}"
												>
													{tab.label}
												</span>
											</div>
										</a>
									{/each}
								</div>
							{/if}
						{/each}
					</section>
				</div>
			</div>
		</div>
	</div>

	<Footer />
</div>

<style>
	:global(html) {
		background-color: rgb(17, 24, 39);
	}
</style>
