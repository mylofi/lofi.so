<script lang="ts">
	import '../app.css';
	import NavBar from '$lib/components/NavBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import EventPopup from '$lib/components/EventPopup.svelte';
	import { theme } from '$lib/stores/themeStore';
	let { children } = $props();
</script>

<div class="min-h-screen bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
	<NavBar />
	<main>
		{@render children()}
	</main>
	<Footer />
	<EventPopup />
</div>
