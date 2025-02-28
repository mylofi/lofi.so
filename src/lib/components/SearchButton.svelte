<script lang="ts">
  import { toggleSearchModal } from '$lib/stores/searchStore';
  import { browser } from '$app/environment';
  
  let shortcutKey = '⌘K';
  
  if (browser) {
    shortcutKey = navigator.platform.indexOf('Mac') >= 0 ? '⌘K' : 'Ctrl+K';
  }
</script>

<button 
  on:click={toggleSearchModal}
  class="rounded-md p-2 text-gray-700 hover:text-primary dark:text-gray-300 dark:hover:text-primary flex items-center"
  aria-label="Search"
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
  </svg>
  <span class="hidden md:inline ml-1 text-sm">Search</span>
  <kbd class="hidden md:inline ml-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{shortcutKey}</kbd>
</button> 