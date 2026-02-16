<script lang="ts">
	export let sponsors: {
		url: string;
		image: string;
		name: string;
		tier: string;
	}[] = [];
</script>

<footer class="relative mt-16 border-t border-slate-200/80 bg-white/80 px-4 py-12 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 sm:px-6 lg:px-8">
	<div class="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-primary/10 to-transparent"></div>

	<div class="relative mx-auto max-w-7xl space-y-8">
		{#if sponsors.length > 0}
			<section class="space-y-4">
				<div class="flex items-center justify-center gap-3">
					<img src="/images/logo.svg" alt="" class="h-5 w-auto opacity-70" />
					<p class="text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300">
						Made possible by our sponsors
					</p>
				</div>
				<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
					{#each sponsors as sponsor}
						<a
							href={sponsor.url}
							target="_blank"
							rel="noopener noreferrer"
							class="group flex h-20 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 transition hover:border-primary/25 hover:bg-slate-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-900"
						>
							<img
								src={sponsor.image}
								alt={sponsor.name}
								class="max-h-12 w-auto object-contain transition duration-300 group-hover:scale-[1.03]"
							/>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<section class="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-600 dark:border-gray-800 dark:text-slate-300 sm:flex-row">
			<p>Something missing? Help improve the index.</p>
			<div class="flex flex-wrap items-center gap-3">
				<a
					href="https://github.com/mylofi/lofi.so/blob/main/src/lib/data/content.json"
					class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-slate-200"
				>
					Edit Lists
				</a>
				<a
					href="https://github.com/mylofi/lofi.so"
					class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:text-slate-200"
				>
					Contribute Design
				</a>
			</div>
		</section>
	</div>
</footer>
