<script lang="ts">
	import itemJson from '$lib/data/directory/Item.json';
	import type { DirectoryData } from '$lib/types/directory';

	const items = (itemJson as DirectoryData).records;
	const apps = items.filter((item) => item.fields.Main_Category === 1);
</script>

<div class="mx-auto max-w-7xl py-8">
	<header class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
		<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Directory / Apps</p>
		<h1 class="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">Apps</h1>
		<p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
			Local-first applications that prioritize data ownership, offline support, and reliable sync.
		</p>
	</header>

	<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each apps as app}
			<a
				href="/directory/apps/{app.fields.slug}"
				class="group rounded-xl border border-slate-700/60 bg-slate-900/70 p-4 transition hover:border-primary/30 hover:bg-slate-900/90 hover:shadow-sm dark:border-slate-600/70 dark:bg-slate-800/75 dark:hover:bg-slate-800/95"
			>
				<div class="flex items-start gap-3">
					<img src={app.fields.icon} alt={app.fields.Title} class="h-12 w-12 rounded-xl object-cover" />
					<div class="min-w-0">
						<h3 class="truncate text-base font-semibold text-slate-100">{app.fields.Title}</h3>
						<p class="mt-1 line-clamp-2 text-sm text-slate-400">{app.fields.description}</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
