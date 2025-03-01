import { writable } from 'svelte/store';

export interface SearchResult {
  title: string;
  url: string;
  excerpt: string;
  category: string;
}

interface SearchState {
  isOpen: boolean;
  query: string;
  results: SearchResult[];
  isLoading: boolean;
}

export const searchStore = writable<SearchState>({
  isOpen: false,
  query: '',
  results: [],
  isLoading: false
});

export function toggleSearchModal() {
  searchStore.update(state => ({ ...state, isOpen: !state.isOpen }));
}

export function setQuery(query: string) {
  searchStore.update(state => ({ ...state, query, isLoading: true }));
}

export function setResults(results: SearchResult[]) {
  searchStore.update(state => ({ ...state, results, isLoading: false }));
} 