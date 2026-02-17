<script lang="ts">
	import itemJson from '$lib/data/directory/Item.json';
	import type { DirectoryData } from '$lib/types/directory';
	import { dedupeDirectoryBySlug } from '$lib/utils/directory';

	const items = dedupeDirectoryBySlug((itemJson as DirectoryData).records);
	const projects = items.filter((item) => item.fields.Main_Category === 3);
</script>

<div class="mx-auto max-w-7xl py-8">
	<header class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:p-8">
		<p class="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Directory / Projects</p>
		<h1 class="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white sm:text-4xl">Projects</h1>
		<p class="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300 sm:text-base">
			Local-first platforms and building blocks that power apps, data sync, and developer workflows.
		</p>
	</header>

	<div class="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each projects as project}
			<a
				href="/directory/projects/{project.fields.slug}"
				class="group rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/20 hover:shadow-sm dark:border-gray-700 dark:bg-gray-950"
			>
				<div class="flex items-start gap-3">
					<img
						src={project.fields.icon}
						alt={project.fields.Title}
						class="h-12 w-12 rounded-xl object-cover"
					/>
					<div class="min-w-0">
						<h3 class="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
							{project.fields.Title}
						</h3>
						<p class="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
							{project.fields.description}
						</p>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
