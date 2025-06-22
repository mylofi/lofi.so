<script lang="ts">
    import itemJson from '$lib/data/directory/Item.json';
    import categoryJson from '$lib/data/directory/Category.json';
    import type { DirectoryData, CategoryData } from '$lib/types/directory';
    import { activeCategory } from '$lib/stores/categoryStore';
    import { searchQuery } from '$lib/stores/directorySearchStore';
    
    const items = (itemJson as DirectoryData).records;
    const categories = (categoryJson as CategoryData).records;
    
    // Get unique categories
    const categoryIds = [...new Set(
        items.flatMap(item => item.fields.Categories || [])
            .filter((category): category is number => typeof category === 'number')
    )];
    
    const categoryNames = categories
        .filter(category => categoryIds.includes(category.id))
        .map(category => category.fields.Name);
    
    const allCategories = ["All", ...categoryNames].sort();
    
    $: filteredItems = items.filter(item => {
        // Filter by category
        const categoryFilter = $activeCategory === "All" || (() => {
            const categoryId = categories.find(c => c.fields.Name === $activeCategory)?.id;
            return categoryId && item.fields.Categories?.includes(categoryId);
        })();
        
        // Filter by search query
        const searchFilter = $searchQuery === '' || [
            item.fields.Title,
            item.fields.description,
            item.fields.author
        ].some(field => field?.toLowerCase().includes($searchQuery.toLowerCase()));
        
        return categoryFilter && searchFilter;
    });
</script>

<div class="max-w-7xl mx-auto px-8">
    <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Directory
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
            Discover and explore software that puts users first through local data ownership, seamless sync, and offline capabilities.
        </p>
    </div>

    <!-- Search bar -->
    <div class="mb-6">
        <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                </svg>
            </div>
            <input
                type="search"
                bind:value={$searchQuery}
                class="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:outline-none
                    dark:bg-gray-800 dark:border-gray-700 
                       dark:placeholder-gray-400 dark:text-white"
                placeholder="Search apps and projects..."
            />
        </div>
    </div>

    <!-- Category filters -->
    <div class="mb-8">
        <div class="flex flex-wrap gap-2">
            {#each allCategories as category}
                <button
                    class="px-4 py-2 rounded-full text-sm font-medium transition-colors
                           {$activeCategory === category 
                               ? 'bg-primary text-white' 
                               : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}"
                    on:click={() => activeCategory.set(category)}
                >
                    {category}
                </button>
            {/each}
        </div>
    </div>

    <!-- Items grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each filteredItems as item}
            <a 
                href="/directory/{item.fields.Main_Category === 1 ? 'apps' : 'projects'}/{item.fields.slug}"
                class="flex items-start p-4 space-x-4 rounded-lg border border-gray-200 hover:border-gray-300 
                       bg-white dark:bg-gray-800 dark:border-gray-700 dark:hover:border-gray-600
                       transition-colors duration-200"
            >
                <img 
                    src={item.fields.icon} 
                    alt={item.fields.Title}
                    class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                    <h3 class="font-semibold text-gray-900 dark:text-white">
                        {item.fields.Title}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {item.fields.description}
                    </p>
                </div>
            </a>
        {/each}
    </div>
    
    <!-- No results message -->
    {#if filteredItems.length === 0}
        <div class="text-center py-12">
            <p class="text-gray-600 dark:text-gray-400">No items found matching your criteria.</p>
        </div>
    {/if}
</div> 