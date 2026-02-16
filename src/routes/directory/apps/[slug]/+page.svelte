<script lang="ts">
	import { page } from '$app/stores';
	import itemJson from '$lib/data/directory/Item.json';
	import categoryJson from '$lib/data/directory/Category.json';
	import type { DirectoryData, CategoryData } from '$lib/types/directory';

	const items = (itemJson as DirectoryData).records;
	const categories = (categoryJson as CategoryData).records;

	$: slug = $page.params.slug;
	$: apps = items.filter((item) => item.fields.Main_Category === 1);
	$: currentIndex = apps.findIndex((app) => app.fields.slug === slug);
	$: app = apps[currentIndex];
	$: prevApp = currentIndex > 0 ? apps[currentIndex - 1] : null;
	$: nextApp = currentIndex < apps.length - 1 ? apps[currentIndex + 1] : null;
	$: appCategories = categories
		.filter((category) => app?.fields.Categories?.includes(category.id))
		.map((category) => category.fields.Name);

	function cleanHost(url: string): string {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}
</script>

{#if app}
	<div class="mx-auto max-w-5xl py-8">
		<nav class="mb-5 text-sm text-slate-500 dark:text-slate-400">
			<a href="/directory" class="hover:text-primary">Directory</a>
			<span class="mx-2">/</span>
			<a href="/directory/apps" class="hover:text-primary">Apps</a>
			<span class="mx-2">/</span>
			<span>{app.fields.Title}</span>
		</nav>

		<section class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:p-8">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex min-w-0 items-start gap-4">
					<img
						src={app.fields.icon}
						alt={app.fields.Title}
						class="h-16 w-16 rounded-2xl border border-slate-200 object-cover dark:border-gray-700"
					/>
					<div class="min-w-0">
						<p class="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
							App
						</p>
						<h1 class="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">
							{app.fields.Title}
						</h1>
						<p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">By {app.fields.author}</p>
						<p class="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-200 sm:text-base">
							{app.fields.description}
						</p>
					</div>
				</div>
				<a
					href={app.fields.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
				>
					Visit {app.fields.Title}
				</a>
			</div>

			<div class="mt-6 grid gap-4 sm:grid-cols-2">
				<div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
					<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Website</p>
					<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{cleanHost(app.fields.url)}</p>
				</div>
				<div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
					<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Categories</p>
					<div class="mt-2 flex flex-wrap gap-2">
						{#if appCategories.length > 0}
							{#each appCategories as category}
								<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-gray-800 dark:text-slate-200">
									{category}
								</span>
							{/each}
						{:else}
							<span class="text-sm text-slate-500 dark:text-slate-300">Uncategorized</span>
						{/if}
					</div>
				</div>
			</div>
		</section>

		<div class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-gray-800">
			{#if prevApp}
				<a href="/directory/apps/{prevApp.fields.slug}" class="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300">
					← {prevApp.fields.Title}
				</a>
			{:else}
				<div></div>
			{/if}

			{#if nextApp}
				<a href="/directory/apps/{nextApp.fields.slug}" class="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300">
					{nextApp.fields.Title} →
				</a>
			{/if}
		</div>
	</div>
{:else}
	<div class="py-16 text-center">
		<h1 class="text-2xl font-bold text-slate-900 dark:text-white">App not found</h1>
		<a href="/directory/apps" class="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Back to Apps</a>
	</div>
{/if}
