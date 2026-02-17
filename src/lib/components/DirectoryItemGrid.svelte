<script lang="ts">
	import type { DirectoryItem } from '$lib/types/directory';

	export let items: DirectoryItem[] = [];
	export let hrefPrefix: string;
	export let emptyMessage: string = 'No items found.';
</script>

<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
	{#if items.length === 0}
		<div class="col-span-full rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
			{emptyMessage}
		</div>
	{:else}
		{#each items as item}
			<a
				href={`${hrefPrefix}/${item.fields.slug}`}
				class="group rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 transition hover:border-primary/30 hover:bg-slate-900/90 hover:shadow-sm dark:border-slate-600/70 dark:bg-slate-800/75 dark:hover:bg-slate-800/95"
			>
				<div class="flex items-start gap-3">
					<img src={item.fields.icon} alt={item.fields.Title} class="h-12 w-12 rounded-xl object-cover" />
					<div class="min-w-0 flex-1">
						<h3 class="line-clamp-1 text-base font-semibold text-slate-100">{item.fields.Title}</h3>
						<p class="mt-1 line-clamp-2 text-sm text-slate-400">{item.fields.description}</p>
					</div>
				</div>
			</a>
		{/each}
	{/if}
</div>
