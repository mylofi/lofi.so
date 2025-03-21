<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	
	const { readContent, watchContent } = data;
	
	let activeTab = 'read';
	let searchTerm = '';
	
	$: filteredContent = activeTab === 'read' 
		? readContent.filter(item => 
			item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
			item.author.toLowerCase().includes(searchTerm.toLowerCase())
		)
		: watchContent.filter(item => 
			item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
			item.author.toLowerCase().includes(searchTerm.toLowerCase())
		);
</script>

<svelte:head>
	<title>Learn - Local-First Web</title>
	<meta name="description" content="Resources to learn about local-first software development" />
</svelte:head>

<div class="container mx-auto max-w-6xl px-4 sm:px-6 py-12 pt-24 md:pt-28">
	<!-- Hero Section - Simplified -->
	<div class="mb-10">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
			Learn Local-First Development
		</h1>
		<p class="text-lg text-gray-600 dark:text-gray-300">
			Discover resources to help you understand and implement local-first approaches.
		</p>
	</div>
	
	<!-- Main Content Area -->
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
		<!-- Tab Navigation -->
		<div class="flex border-b border-gray-200 dark:border-gray-700">
			<button 
				class={"px-6 py-3 font-medium text-sm " + (activeTab === 'read' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white')}
				on:click={() => { activeTab = 'read'; searchTerm = ''; }}
			>
				Articles to Read
			</button>
			<button 
				class={"px-6 py-3 font-medium text-sm " + (activeTab === 'watch' ? 'bg-primary/10 text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white')}
				on:click={() => { activeTab = 'watch'; searchTerm = ''; }}
			>
				Videos to Watch
			</button>
		</div>
		
		<!-- Search Bar -->
		<div class="p-4 bg-gray-50 dark:bg-gray-900/50">
			<div class="relative">
				<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
					<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
					</svg>
				</div>
				<input 
					type="search" 
					bind:value={searchTerm} 
					class="block w-full pl-10 p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white" 
					placeholder={activeTab === 'read' ? "Search articles..." : "Search videos..."}
				/>
			</div>
		</div>
		
		<!-- Content Section -->
		<div class="p-4">
			{#if filteredContent.length === 0}
				<div class="text-center py-10 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
					<p class="text-gray-500 dark:text-gray-400">No content found. Try a different search term.</p>
				</div>
			{:else}
				<!-- Read Content -->
				{#if activeTab === 'read'}
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredContent as item}
							<a 
								href={item.url} 
								target="_blank" 
								rel="noopener noreferrer"
								class="group flex flex-col h-full relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
							>
								<div class="p-4 flex-grow">
									<div class="flex items-center gap-3 mb-3">
										<img src={item.icon} alt={item.title} class="h-8 w-8 rounded-lg" />
										<span class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
											Article
										</span>
									</div>
									<h3 class="mb-1 text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary">
										{item.title}
									</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
								</div>
								<div class="bg-gray-50 dark:bg-gray-700/30 px-4 py-2 text-xs text-primary font-medium flex justify-end items-center">
									Read Article
									<svg class="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								</div>
							</a>
						{/each}
					</div>
				{:else}
					<!-- Watch Content -->
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each filteredContent as item}
							<a 
								href={item.url} 
								target="_blank" 
								rel="noopener noreferrer"
								class="group flex flex-col h-full relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
							>
								<div class="aspect-video bg-gray-100 dark:bg-gray-900 relative">
									<img src={item.icon} alt={item.title} class="object-cover w-full h-full" />
									<div class="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
										<div class="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
											</svg>
										</div>
									</div>
								</div>
								<div class="p-4 flex-grow">
									<div class="flex items-center mb-2">
										<span class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
											Video
										</span>
									</div>
									<h3 class="mb-1 text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary">
										{item.title}
									</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
								</div>
								<div class="bg-gray-50 dark:bg-gray-700/30 px-4 py-2 text-xs text-primary font-medium flex justify-end items-center">
									Watch Video
									<svg class="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
										<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
									</svg>
								</div>
							</a>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
	
	<!-- Resources Section -->
	<div class="grid md:grid-cols-3 gap-6 mt-10">
		<!-- Community -->
		<a href="https://discord.gg/localfirst" target="_blank" rel="noopener noreferrer" 
		   class="group flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:border-primary/20">
			<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
				</svg>
			</div>
			<h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary">Join the Community</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Connect with like-minded developers building local-first software</p>
			<div class="mt-auto pt-2 flex items-center text-primary text-sm font-medium">
				Join Discord
				<svg class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</div>
		</a>
		
		<!-- Software Directory -->
		<a href="/directory" 
		   class="group flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:border-primary/20">
			<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
				</svg>
			</div>
			<h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary">Explore Software</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Discover tools and libraries to build local-first applications</p>
			<div class="mt-auto pt-2 flex items-center text-primary text-sm font-medium">
				View directory
				<svg class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</div>
		</a>
		
		<!-- Blog -->
		<a href="/blog" 
		   class="group flex flex-col p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all hover:border-primary/20">
			<div class="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
				</svg>
			</div>
			<h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary">Read our Blog</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300 mb-2">Stay updated with the latest trends and best practices</p>
			<div class="mt-auto pt-2 flex items-center text-primary text-sm font-medium">
				Read articles
				<svg class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			</div>
		</a>
	</div>
</div>

<style>
	.aspect-video {
		aspect-ratio: 16 / 9;
	}
</style> 