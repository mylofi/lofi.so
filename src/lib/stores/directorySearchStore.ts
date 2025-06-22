import { writable } from 'svelte/store';

// Store for the directory search query
export const searchQuery = writable('');

// Helper function to reset search
export const resetSearch = () => {
    searchQuery.set('');
}; 