<script lang="ts">
    import { page } from '$app/stores';
    import itemJson from '$lib/data/directory/Item.json';
    import categoryJson from '$lib/data/directory/Category.json';
    import type { DirectoryData, CategoryData } from '$lib/types/directory';
    
    const items = (itemJson as DirectoryData).records;
    const categories = (categoryJson as CategoryData).records;
    
    $: slug = $page.params.slug;
    $: apps = items.filter(item => item.fields.Main_Category === 1);
    $: currentIndex = apps.findIndex(app => app.fields.slug === slug);
    $: app = apps[currentIndex];
    
    // Get next and previous apps
    $: prevApp = currentIndex > 0 ? apps[currentIndex - 1] : null;
    $: nextApp = currentIndex < apps.length - 1 ? apps[currentIndex + 1] : null;
    
    // Get related categories
    $: appCategories = categories
        .filter(category => app?.fields.Categories?.includes(category.id))
        .map(category => category.fields.Name);
</script>

{#if app}
    <div class="px-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <a href="/directory" class="hover:text-primary">Directory</a>
            <span>›</span>
            <a href="/directory/apps" class="hover:text-primary">Apps</a>
            <span>›</span>
            <span class="text-gray-900 dark:text-white">{app.fields.Title}</span>
        </nav>

        <!-- Header -->
        <div class="flex items-center space-x-6 mb-8">
            <img 
                src={app.fields.icon} 
                alt={app.fields.Title}
                class="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    {app.fields.Title}
                </h1>
                <p class="mt-2 text-gray-500 dark:text-gray-400">
                    By {app.fields.author}
                </p>
            </div>
        </div>

        <!-- Description -->
        <div class="prose dark:prose-invert max-w-none mb-8">
            <p>{app.fields.description}</p>
        </div>

        <!-- Categories -->
        {#if appCategories.length > 0}
            <div class="flex flex-wrap gap-2 mb-8">
                {#each appCategories as category}
                    <span class="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
                        {category}
                    </span>
                {/each}
            </div>
        {/if}

        <!-- Visit Link -->
        <div class="mb-12">
            <a 
                href={app.fields.url}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
                Visit {app.fields.Title}
                <svg class="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </a>
        </div>

        <!-- Next/Previous Navigation -->
        <div class="flex justify-between items-center border-t dark:border-gray-800 pt-8">
            {#if prevApp}
                <a 
                    href="/directory/apps/{prevApp.fields.slug}"
                    class="flex items-center space-x-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <span>{prevApp.fields.Title}</span>
                </a>
            {:else}
                <div></div>
            {/if}

            {#if nextApp}
                <a 
                    href="/directory/apps/{nextApp.fields.slug}"
                    class="flex items-center space-x-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                    <span>{nextApp.fields.Title}</span>
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </a>
            {/if}
        </div>
    </div>
{:else}
    <div class="text-center py-12">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            App not found
        </h1>
        <a 
            href="/directory/apps" 
            class="mt-4 inline-block text-primary hover:underline"
        >
            Back to Apps
        </a>
    </div>
{/if} 