<!-- Chat.svelte -->
<script lang="ts">
  import { fly, fade, slide } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { chatStore, type ChatMessage } from '$lib/stores/chatStore';
  import { getChatResponse } from '$lib/utils/gemini';
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import '$lib/styles/scrollbar.css';

  let inputValue = '';
  let chatContainer: HTMLDivElement;
  let inputContainer: HTMLDivElement;
  let chatWrapper: HTMLDivElement;
  let isFullScreen = false;

  const popularQuestions = [
    "Pick a lo-fi tool and give me a project idea to build",
    "What are the core principles of local-first software?",
    "How can I make my web app work offline?",
    "Explain CRDT in simple terms"
  ];

  function setInputValue(question: string) {
    inputValue = question;
    // Focus the input after setting the value
    const input = inputContainer?.querySelector('input');
    if (input) {
      input.focus();
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (!isFullScreen && chatWrapper && !chatWrapper.contains(event.target as Node)) {
      const clickedElement = event.target as HTMLElement;
      const closestAnchor = clickedElement.closest('a');
      
      if (closestAnchor) {
        return;
      }
      
      chatStore.toggleChat();
    }
  }

  function toggleFullScreen() {
    isFullScreen = !isFullScreen;
    document.body.style.overflow = isFullScreen ? 'hidden' : '';
  }

  let clickOutsideCleanup: (() => void) | null = null;

  $: {
    if ($chatStore.isOpen && !clickOutsideCleanup) {
      document.addEventListener('mousedown', handleClickOutside);
      clickOutsideCleanup = () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    } else if (!$chatStore.isOpen && clickOutsideCleanup) {
      clickOutsideCleanup();
      clickOutsideCleanup = null;
    }
  }

  onMount(() => {
    // Ensure we clean up all event listeners when component is destroyed
    return () => {
      if (clickOutsideCleanup) {
        clickOutsideCleanup();
      }
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
      document.body.style.overflow = '';
    };
  });

  let scrollListenerAdded = false;
  
  $: if (chatContainer && !scrollListenerAdded) {
    chatContainer.addEventListener("scroll", handleScroll);
    scrollListenerAdded = true;
  }

  // Auto scroll to bottom when new messages arrive
  let shouldAutoScroll = true;
  let lastMessageCount = 0;
  let lastAIResponseIndex = -1;

  function handleScroll() {
    const threshold = 100;
    const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < threshold;
    
    // Only update shouldAutoScroll when user is actively scrolling
    // not when the scroll event is triggered by our own scrollTop changes
    if ($chatStore.messages.length === lastMessageCount) {
      shouldAutoScroll = isAtBottom;
    }
  }

  function scrollToMessage(index: number) {
    if (!chatContainer) return;
    
    const messageElements = chatContainer.querySelectorAll('.message-item');
    if (messageElements && messageElements[index]) {
      messageElements[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Handle new messages and scrolling
  $: {
    if ($chatStore.messages.length > 0) {
      // If new messages arrived
      if ($chatStore.messages.length !== lastMessageCount) {
        // Check if the new message is from AI
        const newMessageIndex = $chatStore.messages.length - 1;
        const isNewAIMessage = 
          $chatStore.messages[newMessageIndex] && 
          $chatStore.messages[newMessageIndex].role === 'model';
        
        // Update our counter
        lastMessageCount = $chatStore.messages.length;
        
        // If it's a new AI message, save its index
        if (isNewAIMessage) {
          lastAIResponseIndex = newMessageIndex;
        }
        
        // Only scroll if we should auto-scroll or if it's a new AI message
        if ((shouldAutoScroll || isNewAIMessage) && chatContainer) {
          setTimeout(() => {
            if (isNewAIMessage) {
              // Scroll to the new AI message
              scrollToMessage(newMessageIndex);
            } else {
              // Otherwise scroll to bottom
              chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
              });
            }
          }, 100);
        }
      }
    }
  }

  async function handleSubmit() {
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user' as const, text: inputValue };
    chatStore.addMessage(userMessage);
    chatStore.setLoading(true);
    inputValue = '';

    try {
      const response = await getChatResponse(userMessage.text, $chatStore.messages);
      if (response.success) {
        chatStore.addMessage({ role: 'model', text: response.text });
      } else {
        chatStore.addMessage({ 
          role: 'model', 
          text: 'Sorry, I encountered an error. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      chatStore.addMessage({ 
        role: 'model', 
        text: 'Sorry, I encountered an error. Please try again.' 
      });
    } finally {
      chatStore.setLoading(false);
    }
  }

  function formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  function clearChat() {
    chatStore.clearMessages();
  }
</script>

{#if $chatStore.isOpen}
  <div
    bind:this={chatWrapper}
    class="fixed z-50 flex flex-col rounded-lg bg-white shadow-xl transition-all duration-300 ease-in-out dark:bg-gray-800"
    class:bottom-4={!isFullScreen}
    class:right-4={!isFullScreen}
    class:w-96={!isFullScreen}
    class:inset-0={isFullScreen}
    class:rounded-none={isFullScreen}
    transition:fly={{ y: 20, duration: 300, easing: quintOut }}
  >
    <!-- Header -->
    <div class="flex items-center justify-between rounded-t-lg bg-primary p-4 text-white" class:rounded-none={isFullScreen}>
      <div class="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
        </svg>
        <span class="font-medium">Lo-fi AI</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          on:click={toggleFullScreen}
          class="rounded p-1 hover:bg-white/10"
          title={isFullScreen ? "Exit full screen" : "Full screen"}
        >
          {#if isFullScreen}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
            </svg>
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8V5a2 2 0 012-2h3m10 0h3a2 2 0 012 2v3m0 10v3a2 2 0 01-2 2h-3m-10 0H5a2 2 0 01-2-2v-3" />
            </svg>
          {/if}
        </button>
        <button
          on:click={() => chatStore.toggleChat()}
          class="rounded p-1 hover:bg-white/10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Messages -->
    <div
      bind:this={chatContainer}
      class="custom-scrollbar flex flex-col gap-4 overflow-y-auto p-4 scroll-smooth"
      style={isFullScreen ? "height: calc(100vh - 132px);" : "height: 400px;"}
    >
      {#if $chatStore.messages.length === 0}
        <div class="flex h-full flex-col items-center justify-center text-center gap-3 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
          </svg>
          <div class="max-w-sm">
            <h3 class="text-lg font-medium mb-2">Welcome to Lo-fi AI!</h3>
            <p class="text-sm mb-6">Ask me anything about local-first development, web technologies, or just chat about building better software.</p>
            
            <div class="flex flex-col gap-2">
              <p class="text-sm font-medium">Popular questions to get started:</p>
              <div class="flex flex-col gap-2">
                {#each popularQuestions as question}
                  <button
                    on:click={() => setInputValue(question)}
                    class="text-left text-sm px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    {question}
                  </button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      {#each $chatStore.messages as message, index (message.timestamp)}
        <div
          class="flex flex-col gap-1 message-item"
          transition:slide={{ duration: 300 }}
        >
          <div class="flex items-start gap-2">
            <!-- Avatar -->
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              {#if message.role === 'model'}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600 dark:text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              {/if}
            </div>

            <!-- Message content -->
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <span class="font-medium">
                  {message.role === 'model' ? 'lo-fi bot' : 'You'}
                </span>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              <div 
                class="prose prose-sm mt-1 max-w-none dark:prose-invert"
                class:whitespace-pre-wrap={message.role === 'user'}
              >
                {#if message.role === 'model'}
                  {@html marked(message.text)}
                {:else}
                  {message.text}
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/each}

      {#if $chatStore.isLoading}
        <div class="flex items-center gap-2" transition:fade>
          <div class="flex gap-1">
            <div class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 0ms" />
            <div class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 150ms" />
            <div class="h-2 w-2 animate-bounce rounded-full bg-primary" style="animation-delay: 300ms" />
          </div>
          <span class="text-sm text-gray-500 dark:text-gray-400">AI is typing...</span>
        </div>
      {/if}
    </div>

    <!-- Input -->
    <div
      bind:this={inputContainer}
      class="border-t border-gray-200 p-4 dark:border-gray-700"
    >
      <form
        on:submit|preventDefault={handleSubmit}
        class="flex items-center gap-2"
      >
        {#if $chatStore.messages.length > 0}
          <button
            type="button"
            on:click={clearChat}
            class="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Clear chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        {/if}
        <input
          type="text"
          bind:value={inputValue}
          placeholder="Ask about local-first development..."
          class="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-primary"
        />
        <button
          type="submit"
          class="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white transition hover:bg-primary/90 disabled:opacity-50"
          disabled={$chatStore.isLoading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </form>
    </div>
  </div>
{/if}

<!-- Chat toggle button -->
<button
  on:click={() => chatStore.toggleChat()}
  class="fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:bg-primary/90"
  class:hidden={$chatStore.isOpen}
  transition:fade
>
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
  </svg>
</button> 