<script>
  let isMenuOpen = false;
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      <div class="flex items-center">
        <a href="/" class="flex items-center">
          <img src="/images/logo.svg" alt="Local First Software" class="h-8 w-auto" />
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:block">
        <div class="flex items-center space-x-4">
          <a href="#start-here" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Start Here</a>
          <a href="#apps" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Apps</a>
          <a href="/blog/first-post" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Blog</a>
        </div>
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button 
          on:click={() => isMenuOpen = !isMenuOpen}
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {#if isMenuOpen}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if isMenuOpen}
    <div class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <a href="#start-here" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Start Here</a>
        <a href="#apps" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Apps</a>
        <a href="/blog/first-post" class="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Blog</a>
      </div>
    </div>
  {/if}
</nav>
