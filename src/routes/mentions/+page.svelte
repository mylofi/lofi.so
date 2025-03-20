<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	import SponsorsRail from '$lib/components/SponsorsRail.svelte';
	const { mentions, sponsorsData } = data;
	const { sponsors: rawSponsors, nextEvent } = sponsorsData;
	const sponsors = rawSponsors as {
		url: string;
		image: string;
		name: string;
		tier: 'Partner' | 'Platinum' | 'Gold';
	}[];

	// Filter mentions by type with explicit type checking
	const videoMentions = mentions.mentions.filter(m => m && m.type === 'video' && (m.platform === 'YouTube' || m.platform === 'TikTok'));
	const readMentions = mentions.mentions.filter(m => !m.type || m.type === 'read');

	// Debug logging
	console.log('All mentions:', mentions.mentions);
	console.log('Video mentions:', videoMentions);
	console.log('Read mentions:', readMentions);
</script>

<div class="relative py-24">
	<SponsorsRail {nextEvent} {sponsors} />

	<div class="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-8">
		<div class="lg:flex">
			<div class="flex-1 xl:mr-[19.5rem]">
				<!-- Hero Section -->
				<div class="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 to-primary p-6 text-white shadow-xl">
					<div class="relative z-10">
						<h1 class="mb-2 text-3xl font-bold">Local-First Community Mentions</h1>
						<p class="text-base text-white/90">Discover what developers, thought leaders, and community members are saying about Local-First Software.</p>
					</div>
					<div class="absolute right-0 top-0 h-full w-1/2 opacity-10">
						<svg class="h-full w-full" viewBox="0 0 100 100" fill="currentColor">
							<path d="M95 50c0 24.85-20.15 45-45 45S5 74.85 5 50 25.15 5 50 5s45 20.15 45 45zm-87.5 0c0 23.47 19.03 42.5 42.5 42.5S92.5 73.47 92.5 50 73.47 7.5 50 7.5 7.5 26.53 7.5 50zm80 0c0 22.09-17.91 40-40 40S7.5 72.09 7.5 50s17.91-40 40-40 40 17.91 40 40z"/>
						</svg>
					</div>
				</div>

				<!-- Watch Section -->
				<section class="mb-12">
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Watch</h2>
						<span class="text-sm text-gray-500 dark:text-gray-400">{videoMentions.length} videos</span>
					</div>
					<div class="grid gap-6 sm:grid-cols-2">
						{#each videoMentions as mention}
							<article class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20">
								<div class="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
									{#if mention.platform === 'YouTube'}
										<iframe
											class="h-full w-full"
											src="https://www.youtube.com/embed/{mention.url.split('v=')[1]}"
											title={mention.title}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen
										/>
									{:else if mention.platform === 'TikTok'}
										<iframe
											class="h-full w-full"
											src="https://www.tiktok.com/embed/{mention.url.split('/video/')[1]}"
											title={mention.title}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowfullscreen
										/>
									{/if}
								</div>
								<div class="p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-xs font-medium text-gray-900 dark:text-white">{mention.author}</span>
										<time class="text-xs text-gray-400" datetime={mention.date}>
											{new Date(mention.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
										</time>
									</div>
									<h3 class="mb-2 line-clamp-2 text-lg font-semibold leading-snug text-gray-900 dark:text-white">
										{mention.title}
									</h3>
									<p class="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
										{mention.excerpt}
									</p>
									<a
										href={mention.url}
										class="inline-flex items-center text-primary hover:text-primary/80"
										target="_blank"
										rel="noopener noreferrer"
									>
										Watch on {mention.platform}
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

				<!-- Read Section -->
				<section class="mb-12">
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Read</h2>
						<span class="text-sm text-gray-500 dark:text-gray-400">{readMentions.length} articles</span>
					</div>
					<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{#each readMentions as mention}
							<article class="group relative overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20">
								<div class="p-4">
									<div class="mb-2 flex items-center justify-between">
										<span class="text-xs font-medium text-gray-900 dark:text-white">{mention.author}</span>
										<time class="text-xs text-gray-400" datetime={mention.date}>
											{new Date(mention.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
										</time>
									</div>
									<h3 class="mb-2 line-clamp-2 text-lg font-semibold leading-snug text-gray-900 dark:text-white">
										{mention.title}
									</h3>
									<p class="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
										{mention.excerpt}
									</p>
									<a
										href={mention.url}
										class="inline-flex items-center text-primary hover:text-primary/80"
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
								</div>
							</article>
						{/each}
					</div>
				</section>

				<!-- Folks to Follow Section -->
				<section class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
					<h2 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Folks to Follow</h2>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each [
							{
								name: "Peter van Hardenberg",
								handle: "@pvh",
								url: "https://twitter.com/pvh",
								image: "https://pbs.twimg.com/profile_images/1328185619030306817/E4HOEB1f_200x200.jpg"
							},
							{
								name: "Johannes Schickling",
								handle: "@schickling",
								url: "https://twitter.com/schickling",
								image: "https://pbs.twimg.com/profile_images/1624092671739408417/GGvOzADg_200x200.jpg"
							},
							{
								name: "Geoffrey Litt",
								handle: "@geoffreylitt",
								url: "https://twitter.com/geoffreylitt",
								image: "https://pbs.twimg.com/profile_images/722626068293763072/4erM-SPN_200x200.jpg"
							},
							{
								name: "Yonz",
								handle: "@devYonz",
								url: "https://twitter.com/devYonz",
								image: "https://pbs.twimg.com/profile_images/1144723583492489216/P_w9bGIW_200x200.png"
							},
							{
								name: "Matt Wonlaw",
								handle: "@tantaman",
								url: "https://twitter.com/tantaman",
								image: "https://pbs.twimg.com/profile_images/1534358445083791367/cQxb9f9X_200x200.jpg"
							},
							{
								name: "James Pearce",
								handle: "@jamespearce",
								url: "https://twitter.com/jamespearce",
								image: "https://avatars.githubusercontent.com/u/90942?v=4"
							}
						] as person}
							<a
								href={person.url}
								class="group flex items-center gap-3 rounded-lg border border-gray-200 p-3 transition-all hover:border-primary/20 hover:shadow-md dark:border-gray-700 dark:hover:border-primary/20"
								target="_blank"
								rel="noopener noreferrer"
							>
								<img
									src={person.image}
									alt={person.name}
									class="h-12 w-12 rounded-full object-cover"
								/>
								<div>
									<h3 class="font-medium text-gray-900 dark:text-white">{person.name}</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">{person.handle}</p>
								</div>
							</a>
						{/each}
					</div>
				</section>
			</div>
		</div>
	</div>
</div> 