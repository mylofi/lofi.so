<section class="relative isolate overflow-hidden px-4 pb-16 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-36">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute inset-0 bg-gradient-to-b from-panel/80 via-paper to-paper dark:from-gray-900 dark:via-gray-900 dark:to-gray-900"></div>
		<div class="absolute -left-24 top-0 h-80 w-80 rounded-full bg-primary/25 blur-3xl"></div>
		<div class="absolute -right-20 top-12 h-72 w-72 rounded-full bg-discord/20 blur-3xl"></div>
		<div class="absolute bottom-0 left-0 right-0 h-40 bg-[radial-gradient(ellipse_at_center,rgba(76,98,255,0.12),transparent_70%)]"></div>
	</div>

	<div class="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
		<div>
			<p class="mb-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
				Local-First Discovery Index
			</p>
			<h1 class="max-w-3xl text-balance text-4xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl dark:text-white">
				Sync & Local-First
			</h1>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
				A curated directory & community for builders.
			</p>

			<div class="mt-8 flex flex-wrap gap-3 sm:mt-10">
				<a
					href="https://discord.gg/ZRrwZxn4rW"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center gap-3 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 sm:text-base"
				>
					<span class="inline-flex h-5 w-5 items-center justify-center" aria-hidden="true">
						<svg class="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
							/>
						</svg>
					</span>
					<span>Join</span>
				</a>
				<a
					href="#directory"
					class="inline-flex items-center rounded-xl border border-slate-300 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:bg-gray-900/80 dark:text-slate-200 dark:hover:border-primary/40 sm:text-base"
					on:click|preventDefault={() => {
						const section = document.getElementById('directory');
						if (section) {
							const navHeight = 100;
							const elementPosition = section.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.scrollY - navHeight;
							window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
						}
					}}
				>
					Directory
				</a>
				<a
					href="#join-us"
					class="inline-flex items-center rounded-xl border border-slate-300 bg-white/90 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-primary/30 hover:text-primary dark:border-gray-700 dark:bg-gray-900/80 dark:text-slate-200 dark:hover:border-primary/40"
					on:click|preventDefault={() => {
						const section = document.getElementById('join-us');
						if (section) {
							const navHeight = 100;
							const elementPosition = section.getBoundingClientRect().top;
							const offsetPosition = elementPosition + window.scrollY - navHeight;
							window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
						}
					}}
				>
					Explore
				</a>
			</div>
		</div>

		<div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
			<div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Join</p>
				<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Connect with like-minded builders and stay updated on the latest in local-first development.
				</p>
			</div>
			<div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Learn</p>
				<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Meetups, article mentions, and people worth following in one place.
				</p>
			</div>
			<div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Discover</p>
				<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Tools, databases, apps and more from builders like you.
				</p>
			</div>
		</div>
	</div>
</section>
