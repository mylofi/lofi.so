<script lang="ts">
    import itemJson from '$lib/data/directory/Item.json';
    import type { DirectoryData } from '$lib/types/directory';
    
    const items = (itemJson as DirectoryData).records;
    const projects = items.filter(item => item.fields.Main_Category === 3);
</script>

<div class="max-w-7xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Projects
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
            Open-source projects and tools for building local-first software.
        </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each projects as project}
            <a 
                href="/directory/projects/{project.fields.slug}"
                class="flex items-start p-4 space-x-4 rounded-lg border border-gray-200 hover:border-gray-300 
                       bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600
                       transition-colors duration-200"
            >
                <img 
                    src={project.fields.icon} 
                    alt={project.fields.Title}
                    class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                        {project.fields.Title}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {project.fields.description}
                    </p>
                </div>
            </a>
        {/each}
    </div>
</div> 