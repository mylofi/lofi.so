<script lang="ts">
	import { page } from '$app/stores';
	import itemJson from '$lib/data/directory/Item.json';
	import sponsorsData from '$lib/data/sponsors.json';
	import SponsorsRail from '$lib/components/SponsorsRail.svelte';
	import type { DirectoryData } from '$lib/types/directory';
	import type { LayoutData } from './$types';

	const items = (itemJson as DirectoryData).records;
	const { sponsors: rawSponsors, nextEvent } = sponsorsData;
	const sponsors = rawSponsors as {
		url: string;
		image: string;
		name: string;
	}[];

	const apps = items.filter((item) => item.fields.Main_Category === 1);
	const projects = items.filter((item) => item.fields.Main_Category === 3);

	let expandedSections = $state(new Set<string>());
	let previousPath = $state('');
	let { data, children } = $props<{ data: LayoutData; children: any }>();

	const currentPath = $derived($page.url.pathname);
	const isDetailView = $derived(
		currentPath.includes('/directory/apps/') || currentPath.includes('/directory/projects/')
	);

	$effect(() => {
		if (currentPath === previousPath) return;
		if (currentPath.includes('/apps')) {
			expandedSections = new Set([...expandedSections, 'apps']);
		}
		if (currentPath.includes('/projects')) {
			expandedSections = new Set([...expandedSections, 'projects']);
		}
		previousPath = currentPath;
	});

	function toggleSection(section: string) {
		expandedSections = new Set(
			expandedSections.has(section)
				? [...expandedSections].filter((s) => s !== section)
				: [...expandedSections, section]
		);
	}

	function expandSection(section: string) {
		if (expandedSections.has(section)) return;
		expandedSections = new Set([...expandedSections, section]);
	}
</script>

<div class="min-h-screen bg-paper pt-[var(--navbar-height)] dark:bg-slate-950">
	<div class="mx-auto flex max-w-[95rem]">
		<aside class="hidden w-72 shrink-0 lg:block">
			<div class="sticky top-[var(--navbar-height)] h-[calc(100vh-var(--navbar-height))] overflow-y-auto border-r border-slate-200 bg-white/70 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
				<nav class="space-y-3">
					<a
						href="/directory"
						class={`block rounded-lg px-4 py-2 text-sm font-semibold transition ${
							currentPath === '/directory'
								? 'bg-primary/10 text-primary'
								: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
						}`}
					>
						Directory Home
					</a>

					<div class="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
						<div class="flex items-center gap-1">
							<a
								href="/directory/projects"
								class={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
									currentPath.includes('/projects')
										? 'bg-primary/10 text-primary'
										: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
								}`}
								onclick={() => expandSection('projects')}
							>
								Projects
							</a>
							<button
								type="button"
								class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
								onclick={() => toggleSection('projects')}
								aria-label={expandedSections.has('projects') ? 'Collapse projects list' : 'Expand projects list'}
							>
								<svg
									class="h-4 w-4 transition-transform"
									class:rotate-90={expandedSections.has('projects')}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
						{#if expandedSections.has('projects')}
							<ul class="mt-2 space-y-1 pr-1">
								{#each projects as project}
									<li>
										<a
											href="/directory/projects/{project.fields.slug}"
											class={`block rounded-md px-3 py-1.5 text-sm transition ${
												currentPath === `/directory/projects/${project.fields.slug}`
													? 'bg-primary/10 font-semibold text-primary'
													: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
											}`}
										>
											{project.fields.Title}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</div>

					<div class="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
						<div class="flex items-center gap-1">
							<a
								href="/directory/apps"
								class={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
									currentPath.includes('/apps')
										? 'bg-primary/10 text-primary'
										: 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
								}`}
								onclick={() => expandSection('apps')}
							>
								Apps
							</a>
							<button
								type="button"
								class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
								onclick={() => toggleSection('apps')}
								aria-label={expandedSections.has('apps') ? 'Collapse apps list' : 'Expand apps list'}
							>
								<svg
									class="h-4 w-4 transition-transform"
									class:rotate-90={expandedSections.has('apps')}
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</button>
						</div>
						{#if expandedSections.has('apps')}
							<ul class="mt-2 space-y-1 pr-1">
								{#each apps as app}
									<li>
										<a
											href="/directory/apps/{app.fields.slug}"
											class={`block rounded-md px-3 py-1.5 text-sm transition ${
												currentPath === `/directory/apps/${app.fields.slug}`
													? 'bg-primary/10 font-semibold text-primary'
													: 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
											}`}
										>
											{app.fields.Title}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</nav>
			</div>
		</aside>

		<div class="flex-1">
			<div class="relative">
				{#if !isDetailView}
					<SponsorsRail {sponsors} {nextEvent} variant="sidebar" eventData={data.eventData} />
				{/if}
				<div class="px-4 pb-10 sm:px-6 lg:px-8" class:xl:mr-[19.5rem]={!isDetailView}>
					{@render children()}
				</div>
			</div>
		</div>
	</div>
</div>
