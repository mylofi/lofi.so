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
</script>

<div class="relative py-16">
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

				<!-- Mentions Grid -->
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
		</div>
	</div>
</div> 