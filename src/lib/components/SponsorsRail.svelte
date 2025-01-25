<script lang="ts">
  export let nextEvent: { url: string; name: string; date: string; time: string; };
  export let sponsors: { url: string; image: string; name: string; tier: string; }[];

  // Group sponsors by tier
  $: sponsorsByTier = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) {
      acc[sponsor.tier] = [];
    }
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {} as Record<string, typeof sponsors>);

  const tierHeights = {
    Partner: 200,
    Platinum: 160,
    Gold: 120
  };

  const tierOrder = ['Partner', 'Platinum', 'Gold'];
</script>

<!-- Right Sidebar - Sponsors -->
<div class="hidden xl:block">
  <div class="absolute z-20 top-24 bottom-0 right-[max(0px,calc(50%-45rem))] w-[19.5rem] px-8">
    <div class="sticky top-24 overflow-y-auto" style="max-height: calc(100vh - 6rem);">
      <!-- Next Event -->
      <div class="mb-4 rounded-lg bg-gradient-to-b from-[#ff3e00]/10 to-gray-800/50 backdrop-blur-sm overflow-hidden">
        <a href={nextEvent.url} class="block group">
          <div class="p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span class="text-sm font-medium text-primary">Next Event</span>
            </div>
            <h3 class="text-lg font-semibold mb-2 group-hover:text-primary transition">{nextEvent.name}</h3>
            <p class="text-sm text-gray-400">{nextEvent.date} • {nextEvent.time}</p>
          </div>
        </a>
      </div>

      <!-- Sponsors Stack -->
      <div class="space-y-6 [&_img]:transition-all [&_img]:duration-300">
        {#each tierOrder as tier}
          {#if sponsorsByTier[tier]?.length}
            <div class="space-y-1.5">
              <h4 class="text-sm font-medium text-gray-400 mb-2">{tier}</h4>
              {#each sponsorsByTier[tier] as sponsor}
                <a 
                  href={sponsor.url}
                  class="block rounded-lg bg-gray-800/50 hover:bg-white transition-colors overflow-hidden group"
                  style="height: {tierHeights[sponsor.tier]}px"
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
          {/if}
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  .overflow-y-auto {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
</style> 