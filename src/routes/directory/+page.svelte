<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import itemJson from '$lib/data/directory/Item.json';
	import categoryJson from '$lib/data/directory/Category.json';
	import type { DirectoryData, CategoryData } from '$lib/types/directory';
	import { CATEGORY_PARAM, DEFAULT_CATEGORY } from '$lib/stores/categoryStore';
	import { searchQuery } from '$lib/stores/directorySearchStore';

	const items = (itemJson as DirectoryData).records;
	const categories = (categoryJson as CategoryData).records;

	const categoryIds = [
		...new Set(
			items
				.flatMap((item) => item.fields.Categories || [])
				.filter((category): category is number => typeof category === 'number')
		)
	];

	const categoryNames = categories
		.filter((category) => categoryIds.includes(category.id))
		.map((category) => category.fields.Name);

	const allCategories = ['All', ...categoryNames].sort();

	$: activeCategory = $page.url.searchParams.get(CATEGORY_PARAM) || DEFAULT_CATEGORY;

	$: filteredItems = items.filter((item) => {
		const categoryFilter =
			activeCategory === 'All' ||
			(() => {
				const categoryId = categories.find((c) => c.fields.Name === activeCategory)?.id;
				return categoryId && item.fields.Categories?.includes(categoryId);
			})();

		const searchFilter =
			$searchQuery === '' ||
			[item.fields.Title, item.fields.description, item.fields.author].some((field) =>
				field?.toLowerCase().includes($searchQuery.toLowerCase())
			);

		return categoryFilter && searchFilter;
	});

	function setCategory(category: string) {
		const url = new URL($page.url);
		if (category === DEFAULT_CATEGORY) {
			url.searchParams.delete(CATEGORY_PARAM);
		} else {
			url.searchParams.set(CATEGORY_PARAM, category);
		}
		goto(url.toString(), { replaceState: true, noScroll: true });
	}
</script>

<div class="mx-auto max-w-7xl py-8">
	<header class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
		<div class="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Local-First Directory</p>
				<h1 class="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">
					Apps, Products, Platforms, and Databases
				</h1>
				<p class="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
					Discover software that keeps user data local, works offline first, and syncs on your terms.
				</p>
			</div>
		</div>
	</header>

	<div class="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-6">
		<div class="relative mb-6">
			<div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
				<svg class="h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
					<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
				</svg>
			</div>
			<input
				type="search"
				bind:value={$searchQuery}
				class="block w-full rounded-xl border border-slate-300 bg-white p-3 pl-10 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-100 dark:placeholder:text-slate-400"
				placeholder="Search apps, products, and platforms..."
			/>
		</div>

		<div class="mb-6 flex flex-wrap gap-2">
			{#each allCategories as category}
				<button
					class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
						activeCategory === category
							? 'bg-primary text-white'
							: 'border border-slate-300 bg-white text-slate-700 hover:border-primary/30 hover:text-primary dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-800'
					}`}
					on:click={() => setCategory(category)}
				>
					{category}
				</button>
			{/each}
		</div>

		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each filteredItems as item (item.id)}
				<a
					href="/directory/{item.fields.Main_Category === 1 ? 'apps' : 'projects'}/{item.fields.slug}"
					class="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/80"
				>
					<div class="flex items-start gap-3">
						<img
							src={item.fields.icon}
							alt={item.fields.Title}
							class="h-12 w-12 flex-shrink-0 rounded-xl object-cover"
						/>
						<div class="min-w-0 flex-1">
							<h3 class="line-clamp-1 text-base font-semibold text-slate-900 dark:text-slate-100">
								{item.fields.Title}
							</h3>
							<div class="mt-1">
								<span class={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
										item.fields.Main_Category === 1
											? 'bg-primary/10 text-primary'
											: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
									}`}>
									{item.fields.Main_Category === 1 ? 'App' : 'Project'}
								</span>
							</div>
							<p class="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
								{item.fields.description}
							</p>
							<p class="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">By {item.fields.author}</p>
						</div>
					</div>
				</a>
			{/each}
		</div>

		{#if filteredItems.length === 0}
			<div class="py-12 text-center">
				<p class="text-slate-600 dark:text-slate-300">No items found matching your criteria.</p>
			</div>
		{/if}
	</div>
</div>
