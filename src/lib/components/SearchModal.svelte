<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { searchStore, toggleSearchModal, setQuery } from '$lib/stores/searchStore';
  import SearchResults from './SearchResults.svelte';
  import RecentSearches from './RecentSearches.svelte';
  import { performSearch } from '$lib/utils/search';
  import { browser } from '$app/environment';
  
  let searchInput: HTMLInputElement;
  let query = '';
  let recentSearchesComponent: { addRecentSearch: (query: string) => void };
  
  // Handle keyboard events
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if ($searchStore.isOpen) {
        toggleSearchModal();
      }
    }
    
    // Detect Ctrl+K or Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      toggleSearchModal();
    }
  }
  
  // Debounce search input
  let searchTimeout: any;
  function handleInput() {
    if (!browser) return;
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      setQuery(query);
      await performSearch(query);
      
      // Add to recent searches if query is not empty
      if (query.trim() && recentSearchesComponent) {
        recentSearchesComponent.addRecentSearch(query.trim());
      }
    }, 300);
  }
  
  // Handle search selection from recent/popular searches
  function handleSearchSelection(selectedQuery: string) {
    query = selectedQuery;
    setQuery(selectedQuery);
    performSearch(selectedQuery);
  }
  
  onMount(() => {
    // Focus the search input when modal opens
    if ($searchStore.isOpen && searchInput) {
      setTimeout(() => searchInput.focus(), 100);
    }
    
    // Add global event listener for keyboard shortcut
    if (browser) {
      window.addEventListener('keydown', handleKeydown);
    }
  });
  
  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
  
  // Watch for changes in isOpen state
  $: if (browser && $searchStore.isOpen && searchInput) {
    setTimeout(() => searchInput.focus(), 100);
  }
  
  // Clear search when modal is closed
  $: if (!$searchStore.isOpen) {
    query = '';
    setQuery('');
  }
</script>

<style>
  /* Custom scrollbar styles */
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  /* For Webkit browsers (Chrome, Safari) */
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
    border-radius: 6px;
  }
  
  /* For dark mode */
  :global(.dark) .custom-scrollbar {
    scrollbar-color: rgba(75, 85, 99, 0.5) transparent;
  }
  
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(75, 85, 99, 0.5);
  }
  
  /* Hover effects */
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(156, 163, 175, 0.8);
  }
  
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(75, 85, 99, 0.8);
  }
</style>

{#if $searchStore.isOpen}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto"
    transition:fade={{ duration: 200 }}
  >
    <!-- Backdrop -->
    <div 
      class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
      on:click={toggleSearchModal}
    ></div>
    
    <!-- Modal -->
    <div 
      class="relative mx-auto mt-20 max-w-xl rounded-xl bg-white p-4 shadow-2xl dark:bg-gray-800"
      transition:fly={{ y: -20, duration: 200 }}
    >
      <!-- Search input -->
      <div class="flex items-center border-b border-gray-200 pb-4 dark:border-gray-700">
        <svg class="h-5 w-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          bind:this={searchInput}
          bind:value={query}
          on:input={handleInput}
          type="text"
          placeholder="Search pages, blog posts, docs, libraries..."
          class="w-full border-none bg-transparent px-4 py-2 text-gray-900 focus:outline-none dark:text-white"
        />
        <button 
          on:click={toggleSearchModal}
          class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <!-- Search results or recent searches -->
      <div class="mt-4 max-h-96 overflow-y-auto custom-scrollbar">
        {#if $searchStore.query}
          <SearchResults />
        {:else}
          <RecentSearches 
            bind:this={recentSearchesComponent}
            onSelectSearch={handleSearchSelection} 
          />
        {/if}
      </div>
      
      <!-- Footer with keyboard shortcuts -->
      <div class="mt-4 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <div class="flex justify-between">
          <span>↑↓ to navigate</span>
          <span>↵ to select</span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  </div>
{/if} 