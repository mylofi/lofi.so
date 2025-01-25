<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  const { content, heading } = data;
  import sponsorsData from '$lib/data/sponsors.json';
  const { sponsors: rawSponsors, nextEvent } = sponsorsData;
  const sponsors = rawSponsors as { url: string; image: string; name: string; tier: 'Partner' | 'Platinum' | 'Gold'; }[];
  import Hero from '$lib/components/Hero.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import NavBar from '$lib/components/NavBar.svelte';
  import SponsorsRail from '$lib/components/SponsorsRail.svelte';
</script>

<div class="min-h-screen bg-gray-900 text-white">
  <NavBar />
  <Hero />

  <div class="relative py-16">
    <SponsorsRail {nextEvent} {sponsors} />

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
                    <a href={item.url} class="text-primary hover:text-primary/80 inline-flex items-center">
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
          <h2 class="text-3xl font-bold mb-7">Recent Videos & Talks</h2>
          <section class="py-7 px-7 bg-gray-800/50">
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
                    <a href={item.url} class="text-primary hover:text-primary/80 inline-flex items-center">
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
            <div class="bg-gradient-to-r from-primary to-[#5865F2] rounded-2xl p-8">
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
          <h2 class="text-3xl font-bold mb-7">Local-First Apps & Tools</h2>
          <section id="apps" class="py-7 px-7 rounded-md bg-gray-800">
            
            <div class="grid lg:grid-cols-3 gap-12">
              <!-- Storing Data -->
              <div>
                <h3 class="text-2xl font-semibold mb-6 text-primary">Storing Data</h3>
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
                <h3 class="text-2xl font-semibold mb-6 text-primary">Development Tools</h3>
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

  <Footer />
</div>

<style>
  :global(html) {
    background-color: rgb(17, 24, 39);
  }
</style>
