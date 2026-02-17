<script lang="ts">
	import itemJson from '$lib/data/directory/Item.json';
	import DirectoryItemGrid from '$lib/components/DirectoryItemGrid.svelte';
	import type { DirectoryData } from '$lib/types/directory';

	const items = (itemJson as DirectoryData).records;
	const apps = items.filter((item) => item.fields.Main_Category === 1);
</script>

<div class="mx-auto max-w-7xl py-8">
	<header class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
		<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Directory / Apps</p>
		<h1 class="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">Apps</h1>
		<p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
			Local-first applications that put users first.
		</p>
	</header>

	<DirectoryItemGrid items={apps} hrefPrefix="/directory/apps" emptyMessage="No apps found." />
</div>
