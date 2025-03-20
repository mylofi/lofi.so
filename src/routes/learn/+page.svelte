<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
	
	const { readContent, watchContent } = data;
	
	let readSearchTerm = '';
	let watchSearchTerm = '';
	
	$: filteredReadContent = readContent.filter(item => 
		item.title.toLowerCase().includes(readSearchTerm.toLowerCase()) || 
		item.author.toLowerCase().includes(readSearchTerm.toLowerCase())
	);
	
	$: filteredWatchContent = watchContent.filter(item => 
		item.title.toLowerCase().includes(watchSearchTerm.toLowerCase()) || 
		item.author.toLowerCase().includes(watchSearchTerm.toLowerCase())
	);
</script>

<svelte:head>
	<title>Learn - Local-First Web</title>
	<meta name="description" content="Resources to learn about local-first software development" />
</svelte:head>

<div class="mx-auto max-w-[90rem] px-4 sm:px-6 md:px-8 py-24">
	<!-- Hero Section -->
	<div class="text-center mb-16">
		<h1 class="text-4xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
			Learn Local-First Development
		</h1>
		<div class="w-24 h-1 bg-primary mx-auto mb-6 rounded-full"></div>
		<p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
			Discover resources to help you understand and implement local-first approaches
			in your applications, putting users back in control of their data.
		</p>
	</div>
	
	<div class="grid lg:grid-cols-2 gap-12">
		<!-- Read Section -->
		<section class="border border-gray-100 dark:border-gray-800 rounded-lg p-6">
			<div class="sticky top-[var(--navbar-height)] z-20 -mx-4 px-4 py-4 bg-white dark:bg-gray-900 backdrop-blur-sm">
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
					Things to Read
				</h2>
				<div class="w-16 h-1 bg-primary mb-6 rounded-full"></div>
				
				<!-- Search input -->
				<div class="relative mb-6">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<input 
						type="search" 
						bind:value={readSearchTerm} 
						class="block w-full pl-10 p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-primary dark:focus:border-primary" 
						placeholder="Search articles..."
					/>
				</div>
			</div>
			
			<div class="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
				{#if filteredReadContent.length === 0}
					<div class="text-center py-10">
						<p class="text-gray-500 dark:text-gray-400">No articles found. Try a different search term.</p>
					</div>
				{:else}
					{#each filteredReadContent as item}
						<a 
							href={item.url} 
							target="_blank" 
							rel="noopener noreferrer"
							class="block relative overflow-hidden rounded-lg border border-gray-200 bg-white p-6 transition-all hover:border-primary/20 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20"
						>
							<div class="flex items-start gap-4">
								<img src={item.icon} alt={item.title} class="h-8 w-8 rounded-lg" />
								<div>
									<h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
										{item.title}
									</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">By {item.author}</p>
								</div>
							</div>
							<div class="mt-4 flex justify-between items-center">
								<span class="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
									Article
								</span>
								<svg class="w-5 h-5 text-gray-400 group-hover:text-primary" viewBox="0 0 20 20" fill="currentColor">
									<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
								</svg>
							</div>
						</a>
					{/each}
				{/if}
			</div>
		</section>
		
		<!-- Watch Section -->
		<section class="border border-gray-100 dark:border-gray-800 rounded-lg p-6">
			<div class="sticky top-[var(--navbar-height)] -mt-6 z-20 -mx-4 px-4 py-4 bg-white dark:bg-gray-900 backdrop-blur-sm">
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
					Things to Watch
				</h2>
				<div class="w-16 h-1 bg-primary mb-6 rounded-full"></div>
				
				<!-- Search input -->
				<div class="relative mb-6">
					<div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
						<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<input 
						type="search" 
						bind:value={watchSearchTerm} 
						class="block w-full pl-10 p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-primary dark:focus:border-primary" 
						placeholder="Search videos..."
					/>
				</div>
			</div>
			
			<div class="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
				{#if filteredWatchContent.length === 0}
					<div class="text-center py-10">
						<p class="text-gray-500 dark:text-gray-400">No videos found. Try a different search term.</p>
					</div>
				{:else}
					<div class="grid grid-cols-2 gap-4">
						{#each filteredWatchContent as item}
							<article class="relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-primary/20 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary/20">
								<div class="aspect-h-9 aspect-w-16 bg-gray-100 dark:bg-gray-900 relative group">
									<img src={item.icon} alt={item.title} class="object-cover w-full" />
									<div class="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
										<div class="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center">
											<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
											</svg>
										</div>
									</div>
								</div>
								<div class="p-3">
									<h3 class="mb-1 line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{item.title}</h3>
									<p class="mb-1.5 text-xs text-gray-500 dark:text-gray-400">By {item.author}</p>
									<div class="flex justify-between items-center">
										<span class="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
											Video
										</span>
										<a href={item.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-primary hover:text-primary/80 text-xs">
											Watch now
											<svg class="ml-1 h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
												<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
											</svg>
										</a>
									</div>
								</div>
							</article>
						{/each}
					</div>
				{/if}
			</div>
		</section>
	</div>
	
	<!-- Additional resources section -->
	<section class="mt-16 border border-gray-100 dark:border-gray-800 rounded-lg p-6">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">
			More Resources
		</h2>
		<div class="w-16 h-1 bg-primary mx-auto mb-8 rounded-full"></div>
		
		<div class="grid md:grid-cols-3 gap-8 mt-8">
			<!-- Community -->
			<div class="text-center">
				<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Join the Community</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-4">Connect with like-minded developers building local-first software</p>
				<a href="https://discord.gg/localfirst" target="_blank" rel="noopener noreferrer" class="inline-flex items-center text-primary hover:text-primary/80">
					Join Discord
					<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
			</div>
			
			<!-- Software Directory -->
			<div class="text-center">
				<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Explore Software</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-4">Discover tools and libraries to build local-first applications</p>
				<a href="/directory" class="inline-flex items-center text-primary hover:text-primary/80">
					View directory
					<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
			</div>
			
			<!-- Blog -->
			<div class="text-center">
				<div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
					<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
					</svg>
				</div>
				<h3 class="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Read our Blog</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-4">Stay updated with the latest trends and best practices</p>
				<a href="/blog" class="inline-flex items-center text-primary hover:text-primary/80">
					Read articles
					<svg class="ml-1 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
					</svg>
				</a>
			</div>
		</div>
	</section>
</div>

<style>
	.custom-scrollbar {
		scrollbar-width: thin;
		scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
	}
	
	.custom-scrollbar::-webkit-scrollbar {
		width: 6px;
	}
	
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background-color: rgba(156, 163, 175, 0.5);
		border-radius: 20px;
	}
	
	.aspect-h-9 {
		--tw-aspect-h: 9;
	}
	
	.aspect-w-16 {
		position: relative;
		padding-bottom: calc(var(--tw-aspect-h) / var(--tw-aspect-w) * 100%);
		--tw-aspect-w: 16;
	}
	
	.aspect-w-16 > * {
		position: absolute;
		height: 100%;
		width: 100%;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
	}
</style> 