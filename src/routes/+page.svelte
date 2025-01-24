<script lang="ts">
  import type { PageData } from './$types';
  export let data: PageData;
  const { content, heading } = data;

  const sponsors = [
    {
      name: "Void(0)",
      image: "https://void0.io/img/void0.svg",
      url: "https://void0.io",
      tier: "Gold"
    },
    {
      name: "StackBlitz",
      image: "https://c.staticblitz.com/assets/logo-181cc8d8cd4e2e0f0d988a354b80842874d72dcd5d5c770df421567fe5114a57.svg",
      url: "https://stackblitz.com",
      tier: "Gold"
    },
    {
      name: "Astro",
      image: "https://astro.build/assets/press/logomark-light.svg",
      url: "https://astro.build",
      tier: "Silver"
    },
    {
      name: "Electric SQL",
      image: "https://raw.githubusercontent.com/electric-sql/meta/main/identity/ElectricSQL-icon-light-trans.svg",
      url: "https://electric-sql.com",
      tier: "Silver"
    }
  ];
</script>

<div class="min-h-screen bg-gray-900 text-white">
  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-[#ff3e00]/30 via-[#ff3e00]/5 to-transparent" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);"></div>
      <div class="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:radial-gradient(circle_at_center,white,transparent_75%)]"></div>
    </div>
    <div class="max-w-7xl mx-auto relative">
      <div class="text-center">
        <img src="/images/logo.svg" alt="Local First Software" class="h-32 sm:h-40 mx-auto mb-12" />
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

      <!-- Right Sidebar - Sponsors -->
      <div class="hidden xl:block fixed z-20 right-[max(0px,calc(50%-45rem))] w-[19.5rem] top-[100vh] bottom-0 py-10 px-8">
        <div class="sticky top-10 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg bg-gray-800/50 backdrop-blur-sm">
          <div class="p-6">
            <h3 class="text-lg font-semibold mb-6">Sponsors</h3>
            <div class="space-y-8">
              <!-- Gold Sponsors -->
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-4">Gold Sponsors</h4>
                <div class="space-y-4">
                  {#each sponsors.filter(s => s.tier === 'Gold') as sponsor}
                    <a href={sponsor.url} class="block p-4 rounded bg-gray-800 hover:bg-gray-700 transition group">
                      <img src={sponsor.image} alt={sponsor.name} class="w-full h-12 object-contain mb-2 group-hover:opacity-90" />
                      <p class="text-sm text-gray-400 group-hover:text-gray-300">{sponsor.name}</p>
                    </a>
                  {/each}
                </div>
              </div>

              <!-- Silver Sponsors -->
              <div>
                <h4 class="text-sm font-medium text-gray-400 mb-4">Silver Sponsors</h4>
                <div class="space-y-4">
                  {#each sponsors.filter(s => s.tier === 'Silver') as sponsor}
                    <a href={sponsor.url} class="block p-4 rounded bg-gray-800 hover:bg-gray-700 transition group">
                      <img src={sponsor.image} alt={sponsor.name} class="w-full h-10 object-contain mb-2 group-hover:opacity-90" />
                      <p class="text-sm text-gray-400 group-hover:text-gray-300">{sponsor.name}</p>
                    </a>
                  {/each}
                </div>
              </div>

              <!-- Become a Sponsor -->
              <div class="pt-4 border-t border-gray-700">
                <a href="#" class="block p-4 rounded bg-gray-800 hover:bg-gray-700 transition text-center">
                  <p class="text-sm font-medium text-[#ff3e00]">Become a Sponsor</p>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  :global(html) {
    background-color: rgb(17, 24, 39);
  }
</style>
