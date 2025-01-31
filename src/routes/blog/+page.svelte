<script lang="ts">
	import SponsorsRail from '$lib/components/SponsorsRail.svelte';
	import type { PageData } from './$types';
	export let data: PageData;
	const { posts, sponsorsData } = data;
	const { sponsors, nextEvent } = sponsorsData;

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="flex min-h-screen flex-col">
	<main class="flex-grow">
		<div class="mx-auto max-w-7xl px-4 pb-16 pt-24">
			<div class="flex justify-center gap-8">
				<div class="max-w-4xl">
					<h1 class="mb-12 text-3xl font-bold text-gray-900 dark:text-white">
						Latest From the Blog
					</h1>

					<div class="space-y-8">
						{#each posts as post}
							<div class="group">
								<div class="mb-2">
									<time class="text-gray-500 dark:text-gray-400">{formatDate(post.date)}</time>
								</div>
								<a href="/blog/{post.slug}" class="block">
									<h2
										class="text-xl font-semibold text-gray-900 transition-colors group-hover:text-discord dark:text-white dark:group-hover:text-discord"
									>
										{post.title}
									</h2>
								</a>
								<div class="mt-4 border-b border-gray-200 dark:border-gray-800"></div>
							</div>
						{/each}
					</div>
				</div>

				<div class="hidden w-80 lg:block">
					<SponsorsRail {sponsors} {nextEvent} variant="sidebar" />
				</div>
			</div>
		</div>
	</main>
</div>
