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
				Find Local-First Apps, Platforms, and Databases That Respect User Data
			</h1>
			<p class="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
				A curated directory for tools that work offline, sync cleanly, and keep ownership close to
				the user.
			</p>

			<div class="mt-8 flex flex-wrap gap-3 sm:mt-10">
				<a
					href="#directory"
					class="inline-flex items-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 sm:text-base"
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
					Browse Directory
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
					See Next Meetup
				</a>
				<a
					href="https://discord.gg/ZRrwZxn4rW"
					target="_blank"
					rel="noopener noreferrer"
					class="inline-flex items-center rounded-xl border border-discord/40 bg-discord/10 px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-discord/20 dark:text-slate-100"
				>
					Join Discord
				</a>
			</div>
		</div>

		<div class="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
			<div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">What You Get</p>
				<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Curated listings for apps, projects, sync engines, and local-first building blocks.
				</p>
			</div>
			<div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Community Signal</p>
				<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Meetups, article mentions, and people worth following in one place.
				</p>
			</div>
			<div class="rounded-2xl border border-white/80 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
				<p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Built For Sharing</p>
				<p class="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
					Generate meetup graphics and speaker cards directly from live event data.
				</p>
			</div>
		</div>
	</div>
</section>
