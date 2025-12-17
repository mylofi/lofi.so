<!-- EventBanner.svelte -->
<script lang="ts">
	import { isBannerVisible, dismissBanner } from '$lib/stores/bannerStore';
	import { onMount } from 'svelte';
	import type { EventData } from '$lib/server/kv';
	import { formatEventDate } from '$lib/utils/date';

	export let eventData: EventData | null = null;

	$: startTimeDate = eventData?.startTimeISO ? new Date(eventData.startTimeISO) : null;

	// Check if event date is in the future
	$: isUpcomingEvent = startTimeDate
		? startTimeDate.getTime() > Date.now()
		: eventData?.date
			? new Date(eventData.date) > new Date()
			: false;
	$: shouldShowBanner = $isBannerVisible && eventData?.eventNumber && isUpcomingEvent;

	$: formattedDate = startTimeDate
		? startTimeDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })
		: formatEventDate(eventData);
	$: formattedTime = startTimeDate
		? startTimeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
		: eventData?.time
			? eventData.time.split(':')[0] + ' ' + eventData.timezone
			: '';
	$: title = eventData?.title || 'Meetup';

	onMount(() => {
		// Set initial banner state based on event data
		if (!eventData?.eventNumber || !isUpcomingEvent) {
			document.documentElement.dataset.banner = 'false';
		} else {
			document.documentElement.dataset.banner = $isBannerVisible ? 'true' : 'false';
		}

		const unsubscribe = isBannerVisible.subscribe((visible) => {
			if (visible !== undefined && eventData?.eventNumber && isUpcomingEvent) {
				document.documentElement.dataset.banner = visible ? 'true' : 'false';
			} else {
				document.documentElement.dataset.banner = 'false';
			}
		});

		return unsubscribe;
	});
</script>

<div class="contents">
	{#if shouldShowBanner && eventData}
		<div
			class="fixed left-0 right-0 top-0 z-50 h-9 bg-primary text-white transition-all duration-300"
		>
			<div
				class="mx-auto flex h-full max-w-7xl items-center justify-center px-4 text-center sm:px-6 lg:px-8"
			>
				<div class="flex flex-wrap items-center justify-center gap-x-1 xs:gap-x-2 gap-y-1 text-[10px] xs:text-xs sm:text-sm lg:text-base">
					<div class="flex items-center gap-1">
						<span class="hidden sm:inline">🎉</span>
						<span>
							<strong>LoFi {title}</strong> - {formattedDate} @ {formattedTime}
						</span>
					</div>

					<div class="flex items-center gap-0.5 xs:gap-1">
						<a
							href={eventData.registrationUrl}
							class="flex items-center gap-0.5 xs:gap-1 rounded bg-white/20 px-1 xs:px-2 py-0.5 text-[10px] xs:text-xs font-medium hover:bg-white/30"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="currentColor"
								class="h-2 w-2 xs:h-3 xs:w-3"
							>
								<path
									d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"
								/>
							</svg>
							<span class="hidden sm:inline">Join</span>
						</a>
						<a
							href={eventData.calendarUrl}
							class="flex items-center gap-0.5 xs:gap-1 rounded bg-white/20 px-1 xs:px-2 py-0.5 text-[10px] xs:text-xs font-medium hover:bg-white/30"
							target="_blank"
							rel="noopener noreferrer"
						>
							<svg class="h-2 w-2 xs:h-3 xs:w-3" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"
								/>
							</svg>
							<span class="hidden sm:inline">Add to Calendar</span>
						</a>
					</div>

					<!-- Conference addition
					<div class="flex items-center gap-0.5 xs:gap-1 ml-0.5 xs:ml-1 pl-0.5 xs:pl-1 border-l border-white/30">
						<a
							href="https://syncconf.dev/"
							class="flex items-center gap-0.5 xs:gap-1 rounded-lg bg-gradient-to-r from-blue-50/30 to-cyan-50/30 backdrop-blur-sm border border-blue-200/40 hover:from-blue-100/40 hover:to-cyan-100/40 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300 group px-1 xs:px-1.5 py-0.5 text-[10px] xs:text-xs font-medium ml-2"
							target="_blank"
							rel="noopener noreferrer"
						>
							<span class="bg-gradient-to-r from-blue-200 to-cyan-300 bg-clip-text text-transparent font-semibold animate-pulse group-hover:animate-none">
								<span class="inline xs:hidden text-[10px]">SyncConf</span>
								<span class="hidden xs:inline sm:hidden text-xs">SyncConf 2025</span>
								<span class="hidden sm:inline text-sm">SyncConf 2025 is Here</span>
							</span>
							<svg class="h-2 w-2 xs:h-3 xs:w-3 text-blue-200 group-hover:text-blue-300 transition-colors duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M7 17L17 7M17 7H7M17 7V17"/>
							</svg>
						</a>
					</div>-->
				</div>

				<button
					on:click={dismissBanner}
					class="absolute right-4 rounded p-1 hover:bg-white/20"
					aria-label="Dismiss banner"
				>
					<svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
						<path
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
						/>
					</svg>
				</button>
			</div>
		</div>
	{/if}
</div>

<!-- spacer div that adjusts based on banner visibility -->
<div
	class="transition-all duration-300"
	class:h-9={shouldShowBanner}
	class:h-0={!shouldShowBanner}
></div>
