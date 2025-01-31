<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const { post } = data;

	let activeHeading = '';
	let observer: IntersectionObserver;

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return new Intl.DateTimeFormat('en-US', {
			month: 'long',
			day: 'numeric',
			year: 'numeric'
		}).format(date);
	}

	function scrollToHeading(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' });
		}
	}

	onMount(() => {
		// Set up intersection observer for headings
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						activeHeading = entry.target.id;
					}
				});
			},
			{ rootMargin: '-100px 0px -66%' }
		);

		// Observe all headings
		document
			.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]')
			.forEach((heading) => {
				observer.observe(heading);
			});

		return () => {
			observer.disconnect();
		};
	});
</script>

<div class="min-h-screen text-gray-900 dark:text-white">
	<main class="mx-auto max-w-7xl px-4 pb-16 pt-24">
		<div class="flex justify-between gap-8">
			<article
				class="prose prose-lg max-w-4xl dark:prose-invert prose-headings:text-gray-900 prose-p:text-gray-700 dark:prose-headings:text-white dark:prose-p:text-gray-300"
			>
				<h1 class="mb-4 text-5xl font-bold leading-tight text-gray-900 dark:text-white">
					{post.title}
				</h1>

				<div class="mb-12 border-b border-gray-200 pb-4 dark:border-gray-800">
					<div class="flex items-baseline gap-2">
						<a
							href={post.author_link}
							class="text-gray-900 underline hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
							target="_blank"
							rel="noopener noreferrer">{post.author}</a
						>
						<span class="font-bold text-gray-900 dark:text-white">·</span>
						<span class="text-gray-500 dark:text-gray-400">{formatDate(post.date)}</span>
					</div>
				</div>

				<div class="prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
					{@html post.content}
				</div>
			</article>

			<nav class="sticky top-24 hidden w-64 self-start lg:block">
				<h4 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">On this page</h4>
				<ul class="space-y-3">
					{#each post.headings as heading}
						<li class="pl-{(heading.level - 1) * 4}">
							<button
								class="w-full cursor-pointer text-left"
								class:text-primary={activeHeading === heading.id}
								class:text-gray-500={activeHeading !== heading.id && !heading.level}
								class:dark:text-gray-400={activeHeading !== heading.id}
								on:click={() => scrollToHeading(heading.id)}
							>
								<span class="transition-colors hover:text-primary">
									{heading.text}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</nav>
		</div>
	</main>
</div>

<style>
	:global(article h1, article h2, article h3, article h4, article h5, article h6) {
		scroll-margin-top: 100px;
	}
	:global(.prose h2) {
		font-size: 1.875rem !important;
		margin-top: 2.5rem !important;
		margin-bottom: 1.5rem !important;
		font-weight: 600 !important;
	}
	:global(.prose p) {
		margin-top: 1.25rem !important;
		margin-bottom: 1.25rem !important;
		line-height: 1.75 !important;
	}
</style>
