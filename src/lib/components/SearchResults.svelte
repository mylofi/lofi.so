<script lang="ts">
  import { searchStore, toggleSearchModal } from '$lib/stores/searchStore';
  import type { SearchResult } from '$lib/stores/searchStore';
  import { onMount, createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  const dispatch = createEventDispatcher();
  
  // Group results by category
  $: groupedResults = $searchStore.results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);
  
  // Get categories and sort them in a logical order
  $: categories = Object.keys(groupedResults).sort((a, b) => {
    const priority: Record<string, number> = {
      'Page': 1,
      'Section': 2,
      'Blog Post': 3,
      'Documentation': 4,
      'Library': 5,
      'Tool': 6,
      'Database': 7,
      'Event': 8,
      'Community': 9,
      'Article': 10,
      'Video': 11,
      'Application': 12,
      'Resource': 13,
      'External Resource': 14
    };
    
    return (priority[a] || 99) - (priority[b] || 99);
  });
  
  $: flatResults = categories.flatMap(category => groupedResults[category]);
  
  // Track selected result index
  let selectedIndex = -1;
  
  // Reset selected index when results change
  $: if ($searchStore.results) {
    selectedIndex = -1;
  }
  
  // Handle keyboard navigation
  function handleKeydown(e: KeyboardEvent) {
    if (!flatResults.length) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = (selectedIndex + 1) % flatResults.length;
      scrollSelectedIntoView();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = (selectedIndex - 1 + flatResults.length) % flatResults.length;
      scrollSelectedIntoView();
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      navigateToResult(flatResults[selectedIndex]);
    }
  }
  
  // Navigate to the selected result
  function navigateToResult(result: SearchResult) {
    // Check if it's an external URL
    if (result.url.startsWith('http')) {
      window.open(result.url, '_blank');
    } else {
      goto(result.url);
    }
    
    toggleSearchModal();
  }
  
  function handleResultClick(event: MouseEvent, result: SearchResult) {
    event.preventDefault();
    
    navigateToResult(result);
  }
  
  // Scroll the selected result into view
  function scrollSelectedIntoView() {
    setTimeout(() => {
      const selectedElement = document.querySelector('.search-result-selected');
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }, 0);
  }
  
  // Set up keyboard event listener
  onMount(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  });
  
  // Highlight matching text in the excerpt
  function highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text;
    
    try {
      const regex = new RegExp(`(${query.trim()})`, 'gi');
      return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">$1</mark>');
    } catch (e) {
      // If the regex is invalid (e.g., if query contains special characters)
      return text;
    }
  }
</script>

{#if $searchStore.isLoading}
  <div class="flex justify-center py-8">
    <div class="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
  </div>
{:else if $searchStore.query && $searchStore.results.length === 0}
  <div class="py-8 text-center text-gray-500 dark:text-gray-400">
    No results found for "{$searchStore.query}"
  </div>
{:else if $searchStore.query}
  <div class="divide-y divide-gray-200 dark:divide-gray-700">
    {#each categories as category, categoryIndex}
      <div class="py-3">
        <h3 class="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
          {category} ({groupedResults[category].length})
        </h3>
        <ul class="space-y-2">
          {#each groupedResults[category] as result, resultIndex}
            {@const currentIndex = categories.slice(0, categoryIndex).reduce(
              (acc, cat) => acc + groupedResults[cat].length, 0
            ) + resultIndex}
            <li>
              <a 
                href={result.url} 
                class="block rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-800 {selectedIndex === currentIndex ? 'bg-gray-100 dark:bg-gray-800 search-result-selected' : ''}"
                on:mouseover={() => selectedIndex = currentIndex}
                on:click={(e) => handleResultClick(e, result)}
              >
                <div class="font-medium text-primary">{result.title}</div>
                <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {@html highlightMatch(result.excerpt, $searchStore.query)}
                </div>
                <div class="mt-1 text-xs text-gray-500 dark:text-gray-500">
                  {result.url}
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
{/if} 