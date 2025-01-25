<!-- Footer -->
<footer class="relative py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
  <div class="absolute left-1/2 bottom-16 -translate-x-1/2 w-[30rem] h-[15rem] bg-primary opacity-30 blur-[8rem] rounded-full animate-glow"></div>
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

<style>
  @keyframes glow {
    0% {
      opacity: 0.1;
      transform: translate(-50%, 0) scale(0.8);
    }
    50% {
      opacity: 0.3;
      transform: translate(-50%, 0) scale(1.1);
    }
    100% {
      opacity: 0.1;
      transform: translate(-50%, 0) scale(0.8);
    }
  }

  :global(.animate-glow) {
    animation: glow 10s ease-in-out infinite;
  }
</style>
