import Fuse from 'fuse.js';
import { setResults } from '$lib/stores/searchStore';
import type { SearchResult } from '$lib/stores/searchStore';
import { browser } from '$app/environment';

let searchIndex: SearchResult[] = [];
let fuse: Fuse<SearchResult> | null = null;

if (browser) {
  // Fetch the search index from the JSON file
  const initSearchIndex = async () => {
    try {
      const response = await fetch('/search-index.json');
      if (response.ok) {
        searchIndex = await response.json();
        console.log(`Loaded ${searchIndex.length} entries from search index`);
        
        // Initialize Fuse with the loaded index
        fuse = new Fuse(searchIndex, {
          keys: ['title', 'excerpt', 'category'],
          threshold: 0.3,
          includeScore: true,
          ignoreLocation: true,
          useExtendedSearch: true
        });
      } else {
        console.error('Failed to load search index');
      }
    } catch (error) {
      console.error('Error loading search index:', error);
    }
  };
  
  // Initialize the search index
  initSearchIndex();
}

export function performSearch(query: string) {
  if (!browser || !fuse) {
    return;
  }
  
  if (!query.trim()) {
    setResults([]);
    return;
  }
  
  // Perform client-side search using Fuse.js
  const results = fuse.search(query).map((result) => result.item);
  setResults(results);
} 