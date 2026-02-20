<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import Hero from '$lib/components/Hero.svelte';
	import SponsorsRail from '$lib/components/SponsorsRail.svelte';
	import EventGraphic from '$lib/components/EventGraphic.svelte';

	export let data: PageData;

	const { content, sponsorsData, mentions, eventDataForGraphic, eventSpec } = data;
	const { sponsors: rawSponsors, nextEvent } = sponsorsData;

	const sponsors = rawSponsors as {
		url: string;
		image: string;
		name: string;
	}[];

	let activeTab = 'storage';

	const readContent = content[0].sections.find((s) => s.title === 'Things to read')?.items || [];
	const watchContent = [
		...(content[0].sections.find((s) => s.title === 'Things to watch')?.items || []),
		...(content[0].sections.find((s) => s.title === 'Recent Videos & Talks')?.items || [])
	];

	const tabs = [
		{
			id: 'collaboration',
			label: 'Sync & Collaboration',
			items: content[1].sections[0]?.items || []
		},
		{
			id: 'storage',
			label: 'Storage',
			items: content[1].sections[1].items
		},
		{
			id: 'development',
			label: 'Development Tools',
			items: content[1].sections[2]?.items || []
		}
	];

	function setActiveTab(tabId: string) {
		activeTab = tabId;
	}

	function formatMentionDate(dateStr: string): string {
		const [year, month, day] = dateStr.split('-').map(Number);
		if (!year || !month || !day) return '';
		const date = new Date(year, month - 1, day);
		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	onMount(() => {
		const section = $page.url.searchParams.get('section');
		if (!section) return;

		const element = document.querySelector(`#${section}`);
		if (!element) return;

		const navHeight = 100;
		const elementPosition = element.getBoundingClientRect().top;
		const offsetPosition = elementPosition + window.scrollY - navHeight;
		window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
	});
</script>

<Hero />

<div class="relative pb-20">
	<SponsorsRail {nextEvent} {sponsors} eventData={eventDataForGraphic} />

	<div class="mx-auto max-w-[92rem] px-4 sm:px-6 lg:px-8">
		<div class="xl:mr-[19.5rem]">
			<section id="explore" class="space-y-8">
				<header class="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:p-8">
					<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Explore</p>
					<h2 class="mt-3 text-2xl font-bold text-ink dark:text-white sm:text-3xl">
						Everything You Need to Build and Discover Local-First
					</h2>
					<p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
						Discover curated tools, connect with the community, and stay updated on the latest in the local-first ecosystem.
					</p>
				</header>

				<section id="join-us" class="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:p-6">
					<div class="mb-5 flex items-center justify-between gap-4 dark:border-gray-800">
						<div>
							<h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">JOIN</h3>
						</div>

					</div>
					<div class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 dark:border-gray-700 dark:bg-gray-950 sm:p-3">
						<EventGraphic spec={eventSpec} eventData={eventDataForGraphic} />
					</div>
				</section>

				<section id="learn" class="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
					<div class="mb-8 flex items-center justify-between gap-4 dark:border-gray-800">
						<div>
							<h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">LEARN</h3>
						</div>
						<a
							href="/learn"
							class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-slate-200"
						>
							See More
						</a>
					</div>

					<h4 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Things to read</h4>
					<div class="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each readContent.slice(0, 5) as item}
							<a
								href={item.url}
								class="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900"
							>
								<img src={item.icon} alt="" class="mb-3 h-7 w-7 rounded-md" />
								<h5 class="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">
									{item.title}
								</h5>
								<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">By {item.author}</p>
							</a>
						{/each}
					</div>

					<h4 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Things to watch</h4>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each watchContent.slice(0, 5) as item}
							<article class="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900">
								<div class="aspect-h-9 aspect-w-16 bg-slate-100 dark:bg-gray-950">
									<img src={item.icon} alt={item.title} class="object-cover" />
								</div>
								<div class="p-4">
									<h5 class="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">
										{item.title}
									</h5>
									<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">By {item.author}</p>
									<a
										href={item.url}
										class="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80"
									>
										Watch now
									</a>
								</div>
							</article>
						{/each}
					</div>
				</section>

				<section id="feed" class="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
					<div class="mb-8 flex items-center justify-between gap-4  dark:border-gray-800">
						<div>
							<h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">DISCOVER</h3>
						</div>
						<div class="flex flex-wrap items-center justify-end gap-2">
							<a
								href="https://www.localfirstnews.com/"
								target="_blank"
								rel="noopener noreferrer"
								class="inline-flex h-12 items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3 text-sm font-semibold text-slate-800 transition hover:border-primary/40 hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/10 dark:text-slate-100"
							>
								<span class="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-black tracking-[0.08em] text-white">
									LF
								</span>
								<span>LF News</span>
							</a>
							<a
								href="/mentions"
								class="inline-flex h-12 items-center rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-slate-200"
							>
								Read Posts
							</a>
						</div>
					</div>

					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each mentions.mentions.slice(0, 3) as mention}
							<article class="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900">
								<div class="mb-3 flex items-center justify-between">
									<span class="text-sm font-semibold text-slate-900 dark:text-slate-100">{mention.author}</span>
									<time class="text-xs font-medium text-slate-500" datetime={mention.date}>
										{formatMentionDate(mention.date)}
									</time>
								</div>
								<h4 class="line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100">
									{mention.title}
								</h4>
								<p class="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{mention.excerpt}</p>
								<a
									href={mention.url}
									class="mt-3 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80"
									target="_blank"
									rel="noopener noreferrer"
								>
									Read on {mention.platform}
								</a>
							</article>
						{/each}
					</div>
				</section>

				<section id="directory" class="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
					<div class="mb-8 flex items-center justify-between gap-4 dark:border-gray-800">
						<div>
							<h3 class="text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">DIRECTORY</h3>
						</div>
						<a
							href="/directory"
							class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-slate-200"
						>
							Discover More Software
						</a>
					</div>

					<div class="mb-6 flex flex-wrap gap-2 rounded-xl bg-slate-100 p-2 dark:bg-slate-900/80">
						{#each tabs as tab}
							<button
								class={`rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-1 ${
									activeTab === tab.id
										? 'bg-primary text-white shadow-sm shadow-primary/20'
										: 'text-slate-600 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-gray-700 dark:hover:text-white'
								}`}
								on:click={() => setActiveTab(tab.id)}
							>
								{tab.label}
							</button>
						{/each}
					</div>

					<!-- Tab Content -->
					{#each tabs as tab}
						{#if activeTab === tab.id}
							<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
												<p class="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
													{item.author}
												</p>
											</div>
										</div>
										<span class="mt-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary dark:border-primary/30 dark:bg-primary/20">
											{tab.label}
										</span>
									</a>
								{/each}
							</div>
						{/if}
					{/each}
				</section>
			</section>
		</div>
	</div>
</div>
