<script lang="ts">
	import { page } from '$app/stores';
	import itemJson from '$lib/data/directory/Item.json';
	import categoryJson from '$lib/data/directory/Category.json';
	import type { DirectoryData, CategoryData } from '$lib/types/directory';

	const items = (itemJson as DirectoryData).records;
	const categories = (categoryJson as CategoryData).records;

	$: slug = $page.params.slug;
	$: projects = items.filter((item) => item.fields.Main_Category === 3);
	$: currentIndex = projects.findIndex((project) => project.fields.slug === slug);
	$: project = projects[currentIndex];
	$: prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
	$: nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
	$: projectCategories = categories
		.filter((category) => project?.fields.Categories?.includes(category.id))
		.map((category) => category.fields.Name);
	$: appsUsingThis = project
		? items.filter((item) => Array.isArray(item.fields.Uses) && item.fields.Uses.includes(project.id))
		: [];

	function cleanHost(url: string): string {
		try {
			return new URL(url).hostname.replace('www.', '');
		} catch {
			return url;
		}
	}
</script>

{#if project}
	<div class="mx-auto max-w-5xl py-8">
		<nav class="mb-5 text-sm text-slate-500 dark:text-slate-400">
			<a href="/directory" class="hover:text-primary">Directory</a>
			<span class="mx-2">/</span>
			<a href="/directory/projects" class="hover:text-primary">Projects</a>
			<span class="mx-2">/</span>
			<span>{project.fields.Title}</span>
		</nav>

		<section class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 sm:p-8">
			<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
				<div class="flex min-w-0 items-start gap-4">
					<img
						src={project.fields.icon}
						alt={project.fields.Title}
						class="h-16 w-16 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
					/>
					<div class="min-w-0">
						<p class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
							Project
						</p>
						<h1 class="mt-2 text-3xl font-black tracking-tight text-ink dark:text-white">
							{project.fields.Title}
						</h1>
						<p class="mt-1 text-sm font-medium text-slate-500 dark:text-slate-300">By {project.fields.author}</p>
						<p class="mt-4 max-w-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-200 sm:text-base">
							{project.fields.description}
						</p>
					</div>
				</div>
				<a
					href={project.fields.url}
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
				>
					Visit {project.fields.Title}
				</a>
			</div>

			<div class="mt-6 grid gap-4 sm:grid-cols-2">
				<div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
					<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Website</p>
					<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
						{cleanHost(project.fields.url)}
					</p>
				</div>
				<div class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/85">
					<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Categories</p>
					<div class="mt-2 flex flex-wrap gap-2">
						{#if projectCategories.length > 0}
							{#each projectCategories as category}
								<span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-100">
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

		{#if appsUsingThis.length > 0}
			<section class="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
				<h2 class="text-lg font-bold text-slate-900 dark:text-white">Apps using {project.fields.Title}</h2>
				<div class="mt-4 grid gap-3 sm:grid-cols-2">
					{#each appsUsingThis as app}
						<a
							href="/directory/apps/{app.fields.slug}"
							class="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-primary/20 hover:shadow-sm dark:border-slate-700 dark:bg-slate-900/85"
						>
							<div class="flex items-start gap-3">
								<img src={app.fields.icon} alt={app.fields.Title} class="h-10 w-10 rounded-lg object-cover" />
								<div class="min-w-0">
									<h3 class="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{app.fields.Title}</h3>
									<p class="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{app.fields.description}</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<div class="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700">
			{#if prevProject}
				<a href="/directory/projects/{prevProject.fields.slug}" class="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300">
					← {prevProject.fields.Title}
				</a>
			{:else}
				<div></div>
			{/if}

			{#if nextProject}
				<a href="/directory/projects/{nextProject.fields.slug}" class="text-sm font-semibold text-slate-600 hover:text-primary dark:text-slate-300">
					{nextProject.fields.Title} →
				</a>
			{/if}
		</div>
	</div>
{:else}
	<div class="py-16 text-center">
		<h1 class="text-2xl font-bold text-slate-900 dark:text-white">Project not found</h1>
		<a href="/directory/projects" class="mt-3 inline-block text-sm font-semibold text-primary hover:underline">Back to Projects</a>
	</div>
{/if}
