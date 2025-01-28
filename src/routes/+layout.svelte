<script lang="ts">
	import '../app.css';
	import NavBar from '$lib/components/NavBar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<NavBar />
	<main>
		{@render children()}
	</main>
	<Footer />
</div>
