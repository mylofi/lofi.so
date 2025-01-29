<script lang="ts">
	import { onMount } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import { popupStore } from '$lib/stores/popupStore';
	import EventGraphic from './EventGraphic.svelte';
	import { browser } from '$app/environment';

	onMount(() => {
		popupStore.initialize();
	});

	$: if (browser) {
		if ($popupStore) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'auto';
		}
	}
</script>

{#if $popupStore}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
		transition:fade={{ duration: 200 }}
	>
		<div class="relative w-fit" transition:scale={{ duration: 200, start: 0.95 }}>
			<!-- Event Graphic -->
			<div class="relative scale-75 transform">
				<button
					on:click={() => popupStore.dismiss()}
					class="absolute -right-0.5 -top-0.5 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-red-400 text-xl font-bold text-gray-600 transition hover:bg-red-500"
				>
					×
				</button>
				<EventGraphic />
			</div>
		</div>
	</div>
{/if}
