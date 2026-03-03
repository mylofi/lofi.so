/**
 * Category filtering is now driven by the URL search param `?category=`.
 * See /routes/directory/+page.svelte for usage.
 *
 * This file is kept as a central reference for the param name
 * so it stays consistent if referenced elsewhere.
 */
export const CATEGORY_PARAM = 'category';
export const DEFAULT_CATEGORY = 'All';