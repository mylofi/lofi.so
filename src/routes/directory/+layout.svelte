<script lang="ts">
    import { page } from '$app/stores';
    import itemJson from '$lib/data/directory/Item.json';
    import mainCategoryJson from '$lib/data/directory/Main_Category.json';
    import sponsorsData from '$lib/data/sponsors.json';
    import SponsorsRail from '$lib/components/SponsorsRail.svelte';
    import type { DirectoryData, MainCategoryData } from '$lib/types/directory';
    import type { LayoutData } from './$types';
    
    const items = (itemJson as DirectoryData).records;
    const { sponsors: rawSponsors, nextEvent } = sponsorsData;
    const sponsors = rawSponsors as {
        url: string;
        image: string;
        name: string;
        tier: 'Partner' | 'Platinum' | 'Gold';
    }[];
    // const mainCategories = (mainCategoryJson as MainCategoryData).records;
    
    const apps = items.filter(item => item.fields.Main_Category === 1);
    const projects = items.filter(item => item.fields.Main_Category === 3);
    
    let expandedSections = $state(new Set<string>());
    let previousPath = $state('');
    let { data } = $props();
    const currentPath = $derived($page.url.pathname);
    
    $effect(() => {
        if (currentPath !== previousPath) {
            if (currentPath.includes('/apps') && !previousPath.includes('/apps')) {
                expandedSections = new Set([...expandedSections, 'apps']);
            }
            if (currentPath.includes('/projects') && !previousPath.includes('/projects')) {
                expandedSections = new Set([...expandedSections, 'projects']);
            }
            previousPath = currentPath;
        }
    });
    
    function toggleSection(section: string) {
        expandedSections = new Set(
            expandedSections.has(section)
                ? [...expandedSections].filter(s => s !== section)
                : [...expandedSections, section]
        );
    }
</script>

<style lang="postcss">
    .custom-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: var(--primary-color) transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: var(--primary-color);
        border-radius: 3px;
    }
    
    .custom-scrollbar::-webkit-scrollbar-button {
        display: none;
    }

    :global(:root) {
        --primary-color: rgb(99 102 241);
    }

    :global(.dark) {
        --primary-color: rgb(129 140 248);
    }
</style>

<div class="flex min-h-screen pt-[var(--navbar-height)]">
    <!-- Sidebar -->
    <div class="hidden lg:block w-64 flex-shrink-0 border-r dark:border-gray-800">
        <div class="sticky top-[var(--navbar-height)] h-[calc(90vh-var(--navbar-height))] overflow-y-auto custom-scrollbar">
            <nav class="p-4">
                <ul class="space-y-2">
                    <li>
                        <a 
                            href="/directory"
                            class="block px-4 py-2 rounded-lg transition-colors
                                   {currentPath === '/directory' 
                                       ? 'bg-primary/10 text-primary' 
                                       : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
                        >
                            Directory
                        </a>
                    </li>
                    
                    <!-- Projects Section -->
                    <li>
                        <div class="flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer
                                  hover:bg-gray-100 dark:hover:bg-gray-800
                                  {currentPath.includes('/projects') ? 'bg-primary/10 text-primary' : ''}"
                             on:click={() => toggleSection('projects')}
                        >
                            <a href="/directory/projects" class="flex-grow">Projects</a>
                            <svg 
                                class="w-4 h-4 transform transition-transform duration-200 {expandedSections.has('projects') ? 'rotate-90' : ''}" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                        {#if expandedSections.has('projects')}
                            <ul class="pl-4 mt-1 space-y-1">
                                {#each projects as project}
                                    <li>
                                        <a 
                                            href="/directory/projects/{project.fields.slug}"
                                            class="block px-4 py-1 rounded-lg text-sm transition-colors
                                                   {currentPath === `/directory/projects/${project.fields.slug}`
                                                       ? 'bg-primary/10 text-primary'
                                                       : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
                                        >
                                            {project.fields.Title}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </li>
                    
                    <!-- Apps Section -->
                    <li>
                        <div class="flex items-center justify-between px-4 py-2 rounded-lg cursor-pointer
                                  hover:bg-gray-100 dark:hover:bg-gray-800
                                  {currentPath.includes('/apps') ? 'bg-primary/10 text-primary' : ''}"
                             on:click={() => toggleSection('apps')}
                        >
                            <a href="/directory/apps" class="flex-grow">Apps</a>
                            <svg 
                                class="w-4 h-4 transform transition-transform duration-200 {expandedSections.has('apps') ? 'rotate-90' : ''}" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                            </svg>
                        </div>
                        {#if expandedSections.has('apps')}
                            <ul class="pl-4 mt-1 space-y-1">
                                {#each apps as app}
                                    <li>
                                        <a 
                                            href="/directory/apps/{app.fields.slug}"
                                            class="block px-4 py-1 rounded-lg text-sm transition-colors
                                                   {currentPath === `/directory/apps/${app.fields.slug}`
                                                       ? 'bg-primary/10 text-primary'
                                                       : 'hover:bg-gray-100 dark:hover:bg-gray-800'}"
                                        >
                                            {app.fields.Title}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    </li>
                </ul>
            </nav>
        </div>
    </div>
    
    <!-- Main content -->
    <div class="flex-1">
        <div class="relative">
            {#if !currentPath.includes('/directory/apps/') && !currentPath.includes('/directory/projects/')}
                <SponsorsRail {sponsors} {nextEvent} variant="sidebar" eventData={data.eventData} />
            {/if}
            <div class="xl:mr-[19.5rem]" class:xl:mr-0={currentPath.includes('/directory/apps/') || currentPath.includes('/directory/projects/')}>
                <slot />
            </div>
        </div>
    </div>
</div> 