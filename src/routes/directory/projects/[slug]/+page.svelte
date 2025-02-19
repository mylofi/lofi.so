<script lang="ts">
    import { page } from '$app/stores';
    import itemJson from '$lib/data/directory/Item.json';
    import categoryJson from '$lib/data/directory/Category.json';
    import type { DirectoryData, CategoryData } from '$lib/types/directory';
    
    const items = (itemJson as DirectoryData).records;
    const categories = (categoryJson as CategoryData).records;
    
    $: slug = $page.params.slug;
    $: projects = items.filter(item => item.fields.Main_Category === 3);
    $: currentIndex = projects.findIndex(project => project.fields.slug === slug);
    $: project = projects[currentIndex];
    
    // Get next and previous projects
    $: prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
    $: nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;
    
    // Get related categories
    $: projectCategories = categories
        .filter(category => project?.fields.Categories?.includes(category.id))
        .map(category => category.fields.Name);
        
    // Get apps that use this project
    $: appsUsingThis = project 
        ? items.filter(
            item => Array.isArray(item.fields.Uses) && item.fields.Uses.includes(project.id)
        )
        : [];
</script>

{#if project}
    <div class="px-8">
        <!-- Breadcrumb -->
        <nav class="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
            <a href="/directory" class="hover:text-primary">Directory</a>
            <span>›</span>
            <a href="/directory/projects" class="hover:text-primary">Projects</a>
            <span>›</span>
            <span class="text-gray-900 dark:text-white">{project.fields.Title}</span>
        </nav>

        <!-- Header -->
        <div class="flex items-center space-x-6 mb-8">
            <img 
                src={project.fields.icon} 
                alt={project.fields.Title}
                class="w-20 h-20 rounded-xl object-cover flex-shrink-0"
            />
            <div>
                <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
                    {project.fields.Title}
                </h1>
                <p class="mt-2 text-gray-500 dark:text-gray-400">
                    By {project.fields.author}
                </p>
            </div>
        </div>

        <!-- Description -->
        <div class="prose dark:prose-invert max-w-none mb-8">
            <p>{project.fields.description}</p>
        </div>

        <!-- Categories -->
        {#if projectCategories.length > 0}
            <div class="flex flex-wrap gap-2 mb-8">
                {#each projectCategories as category}
                    <span class="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
                        {category}
                    </span>
                {/each}
            </div>
        {/if}

        <!-- Apps using this project -->
        {#if appsUsingThis.length > 0}
            <div class="border-t dark:border-gray-800 pt-8 mb-8">
                <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Apps using {project.fields.Title}
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {#each appsUsingThis as app}
                        <a 
                            href="/directory/apps/{app.fields.slug}"
                            class="flex items-start p-4 space-x-4 rounded-lg border border-gray-200 hover:border-gray-300 
                                   bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600
                                   transition-colors duration-200"
                        >
                            <img 
                                src={app.fields.icon} 
                                alt={app.fields.Title}
                                class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white">
                                    {app.fields.Title}
                                </h3>
                                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                    {app.fields.description}
                                </p>
                            </div>
                        </a>
                    {/each}
                </div>
            </div>
        {/if}

        <!-- Visit Link -->
        <div class="mb-12">
            <a 
                href={project.fields.url}
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            >
                Visit {project.fields.Title}
                <svg class="ml-2 w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
            </a>
        </div>

        <!-- Next/Previous Navigation -->
        <div class="flex justify-between items-center border-t dark:border-gray-800 pt-8">
            {#if prevProject}
                <a 
                    href="/directory/projects/{prevProject.fields.slug}"
                    class="flex items-center space-x-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                    <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clip-rule="evenodd" />
                    </svg>
                    <span>{prevProject.fields.Title}</span>
                </a>
            {:else}
                <div></div>
            {/if}

            {#if nextProject}
                <a 
                    href="/directory/projects/{nextProject.fields.slug}"
                    class="flex items-center space-x-3 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary"
                >
                    <span>{nextProject.fields.Title}</span>
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
            Project not found
        </h1>
        <a 
            href="/directory/projects" 
            class="mt-4 inline-block text-primary hover:underline"
        >
            Back to Projects
        </a>
    </div>
{/if} 