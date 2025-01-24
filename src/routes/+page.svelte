<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  const { content, heading } = data;
  import sponsorsData from '$lib/data/sponsors.json';
  const { sponsors, nextEvent } = sponsorsData;
</script>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute left-1/2 top-0 -translate-x-1/2 w-[40rem] h-[35rem] bg-[#ff3e00] opacity-20 blur-[8rem] rounded-full"></div>
      <div class="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(circle_at_center,white,transparent_75%)]"></div>
    </div>
    <div class="max-w-7xl mx-auto relative">
      <div class="text-center">
        <img src="/images/logo.svg" alt="Local First Software" class="h-32 sm:h-40 mx-auto mb-2" />
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Local-first Software
        </h1>
        <p class="mt-6 text-xl text-gray-300 max-w-3xl mx-auto">
          Own your data, work offline, and collaborate seamlessly. Build apps that put users first.
        </p>
        <p class="mt-12 text-lg text-gray-300 max-w-2xl mx-auto">
          So, you want to build an app that has its data co-located with its UI? That works offline? That synchronizes between clients? And that lets its users own their data?
        </p>
        <div class="mt-10 flex justify-center gap-4">
          <a href="#start-here" class="rounded-md bg-[#ff3e00] px-6 py-3 text-lg font-semibold hover:bg-[#ff3e00]/90 transition">
            Start Here
          </a>
          <a href="#apps" class="rounded-md bg-gray-800 border border-gray-700 px-6 py-3 text-lg font-semibold hover:bg-gray-700 transition">
            Explore Apps
          </a>
        </div>
      </div>
    </div>
  </section>

  <div class="relative">
    <!-- Right Sidebar - Sponsors -->
    <div class="hidden xl:block">
      <div class="absolute z-20 top-10 bottom-0 right-[max(0px,calc(50%-45rem))] w-[19.5rem] px-8">
        <div class="sticky top-10 overflow-y-auto" style="max-height: calc(100vh - 5rem);">
          <!-- Next Event -->
          <div class="mb-4 rounded-lg bg-gradient-to-b from-[#ff3e00]/10 to-gray-800/50 backdrop-blur-sm overflow-hidden">
            <a href={nextEvent.url} class="block group">
              <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <div class="w-8 h-8 rounded-lg bg-[#ff3e00]/20 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#ff3e00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span class="text-sm font-medium text-[#ff3e00]">Next Event</span>
                </div>
                <h3 class="text-lg font-semibold mb-2 group-hover:text-[#ff3e00] transition">{nextEvent.name}</h3>
                <p class="text-sm text-gray-400">{nextEvent.date} • {nextEvent.time}</p>
              </div>
            </a>
          </div>

          <!-- Sponsors Stack -->
          <div class="space-y-1.5 [&_img]:transition-all [&_img]:duration-300">
            {#each sponsors as sponsor}
              <a 
                href={sponsor.url}
                class="block rounded-lg bg-gray-800/50 hover:bg-white transition-colors overflow-hidden group"
                style="height: {sponsor.height}px"
              >
                <div class="w-full h-full p-4 flex items-center justify-center">
                  <img 
                    src={sponsor.image} 
                    alt={sponsor.name}
                    class="max-w-full max-h-full object-contain brightness-0 invert opacity-50 group-hover:brightness-100 group-hover:invert-0 group-hover:opacity-100"
                  />
                </div>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-[90rem] mx-auto px-4 sm:px-6 md:px-8">
      <div class="lg:flex">
        <!-- Main Content -->
        <div class="flex-1 xl:mr-[19.5rem]">
          <!-- Local-first Mentions Feed -->
          <section class="py-16">
            <h2 class="text-3xl font-bold mb-8">Latest Mentions</h2>
            <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {#each content[0].sections[0].items.slice(0, 3) as item}
                <article class="bg-gray-800 rounded-lg overflow-hidden">
                  <div class="p-6">
                    <div class="flex items-center mb-4">
                      <img src={item.icon} alt={item.title} class="w-8 h-8 rounded-full" />
                      <div class="ml-3">
                        <p class="font-medium">{item.author}</p>
                        <p class="text-sm text-gray-400">Recently shared</p>
                      </div>
                    </div>
                    <h3 class="text-xl font-semibold mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <a href={item.url} class="text-[#ff3e00] hover:text-[#ff3e00]/80 inline-flex items-center">
                      Read more
                      <svg class="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </article>
              {/each}
            </div>
          </section>

          <!-- Recent Videos & Talks -->
          <section class="py-16 bg-gray-800/50">
            <h2 class="text-3xl font-bold mb-8">Recent Videos & Talks</h2>
            <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {#each content[0].sections[1].items.slice(0, 3) as item}
                <article class="bg-gray-800 rounded-lg overflow-hidden">
                  <div class="aspect-w-16 aspect-h-9 bg-gray-900">
                    <img src={item.icon} alt={item.title} class="object-cover" />
                  </div>
                  <div class="p-6">
                    <h3 class="text-xl font-semibold mb-3 line-clamp-2">
                      {item.title}
                    </h3>
                    <p class="text-gray-400 mb-4">By {item.author}</p>
                    <a href={item.url} class="text-[#5865F2] hover:text-[#5865F2]/80 inline-flex items-center">
                      Watch now
                      <svg class="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </div>
                </article>
              {/each}
            </div>
          </section>

          <!-- Monthly Meetup Section -->
          <section class="py-16">
            <div class="bg-gradient-to-r from-[#ff3e00] to-[#5865F2] rounded-2xl p-8">
              <div class="flex flex-col md:flex-row items-center justify-between gap-8">
                <div>
                  <h2 class="text-3xl font-bold">Join our Monthly Meetup</h2>
                  <p class="mt-4 text-lg">{heading.meetup.date}</p>
                  <div class="mt-6 flex gap-4">
                    <a href={heading.meetup.discord_link} class="inline-flex items-center rounded-md bg-white/10 px-4 py-2 hover:bg-white/20">
                      Join on Discord
                    </a>
                    <a href={heading.meetup.gcal_link} class="inline-flex items-center rounded-md bg-white/10 px-4 py-2 hover:bg-white/20">
                      Add to Calendar
                    </a>
                  </div>
                </div>
                <div class="text-6xl font-bold">
                  <div class="text-center">
                    <div class="text-2xl uppercase">{heading.meetup.cal_month}</div>
                    <div>{heading.meetup.cal_day}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Start Here Guide -->
          <section id="start-here" class="py-16">
            <h2 class="text-3xl font-bold mb-8">Start Here</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {#each content[0].sections[0].items.slice(0, 6) as item}
                <a href={item.url} class="block p-6 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
                  <img src={item.icon} alt={item.title} class="w-8 h-8 mb-4" />
                  <h3 class="text-xl font-semibold mb-2">{item.title}</h3>
                  <p class="text-gray-400">By {item.author}</p>
                </a>
              {/each}
            </div>
          </section>

          <!-- App Categories -->
          <section id="apps" class="py-16 bg-gray-800">
            <h2 class="text-3xl font-bold mb-12">Local-First Apps & Tools</h2>
            
            <div class="grid lg:grid-cols-3 gap-12">
              <!-- Storing Data -->
              <div>
                <h3 class="text-2xl font-semibold mb-6 text-[#ff3e00]">Storing Data</h3>
                <div class="space-y-4">
                  {#each content[1].sections[0].items as item}
                    <a href={item.url} class="flex items-center p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                      <img src={item.icon} alt={item.title} class="w-8 h-8 mr-4" />
                      <div>
                        <h4 class="font-medium">{item.title}</h4>
                        <p class="text-sm text-gray-400">{item.author}</p>
                      </div>
                    </a>
                  {/each}
                </div>
              </div>

              <!-- Sync & Collaboration -->
              <div>
                <h3 class="text-2xl font-semibold mb-6 text-[#5865F2]">Sync & Collaboration</h3>
                <div class="space-y-4">
                  {#each content[1].sections[1]?.items || [] as item}
                    <a href={item.url} class="flex items-center p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                      <img src={item.icon} alt={item.title} class="w-8 h-8 mr-4" />
                      <div>
                        <h4 class="font-medium">{item.title}</h4>
                        <p class="text-sm text-gray-400">{item.author}</p>
                      </div>
                    </a>
                  {/each}
                </div>
              </div>

              <!-- Development Tools -->
              <div>
                <h3 class="text-2xl font-semibold mb-6 text-[#ff3e00]">Development Tools</h3>
                <div class="space-y-4">
                  {#each content[1].sections[2]?.items || [] as item}
                    <a href={item.url} class="flex items-center p-4 rounded-lg bg-gray-700 hover:bg-gray-600 transition">
                      <img src={item.icon} alt={item.title} class="w-8 h-8 mr-4" />
                      <div>
                        <h4 class="font-medium">{item.title}</h4>
                        <p class="text-sm text-gray-400">{item.author}</p>
                      </div>
                    </a>
                  {/each}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <footer class="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
    <div class="absolute left-1/2 bottom-16 -translate-x-1/2 w-[30rem] h-[15rem] bg-[#ff3e00] opacity-30 blur-[8rem] rounded-full"></div>
    <div class="max-w-7xl mx-auto text-center relative">
      <div class="space-y-4">
        <p class="text-lg text-gray-300">
          We started a blog! Read our origin story in 
          <a href="/blog/first-post" class="text-white underline hover:text-gray-300 transition">the first post</a>.
        </p>
        <p class="text-lg text-gray-300">
          Something missing? 
          <a href="https://github.com/username/repo/edit/main/content" class="text-white underline hover:text-gray-300 transition">
            <span class="inline-block">✍️ Edit the lists</span>
          </a> 
          or 
          <a href="https://github.com/username/repo" class="text-white underline hover:text-gray-300 transition">
            <span class="inline-block">🎨 redesign the page!</span>
          </a>
        </p>
      </div>
      <img src="/images/logo.svg" alt="Local First Software" class="h-16 mx-auto mt-12 opacity-50" />
    </div>
  </footer>
</div>

<style>
  :global(html) {
    background-color: rgb(17, 24, 39);
  }

  /* Hide scrollbar but keep functionality */
  .overflow-y-auto {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
</style>
