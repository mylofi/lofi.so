<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  
  export let onSelectSearch: (query: string) => void;
  
  // Recent searches
  let recentSearches: string[] = [];
  
  // Popular searches test
  const popularSearches = [
    'local-first',
    'offline',
    'CRDT',
    'sync',
    'collaboration',
    'Automerge',
    'Yjs'
  ];
  
  onMount(() => {
    if (browser) {
      try {
        const storedSearches = localStorage.getItem('recentSearches');
        if (storedSearches) {
          recentSearches = JSON.parse(storedSearches);
        }
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  });
  
  export function addRecentSearch(query: string) {
    if (!browser || !query.trim()) return;
    
    try {
      // Add to the beginning and remove duplicates
      recentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    } catch (e) {
      console.error('Error saving recent searches:', e);
    }
  }
  
  function handleSearchClick(query: string) {
    onSelectSearch(query);
  }
</script>

<div>
  {#if recentSearches.length > 0}
    <div class="mb-4">
      <h3 class="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
        Recent Searches
      </h3>
      <div class="flex flex-wrap gap-2">
        {#each recentSearches as search}
          <button
            on:click={() => handleSearchClick(search)}
            class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {search}
          </button>
        {/each}
      </div>
    </div>
  {/if}
  
  <div>
    <h3 class="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
      Popular Searches
    </h3>
    <div class="flex flex-wrap gap-2">
      {#each popularSearches as search}
        <button
          on:click={() => handleSearchClick(search)}
          class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {search}
        </button>
      {/each}
    </div>
  </div>
</div> 