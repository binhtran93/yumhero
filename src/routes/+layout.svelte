<script lang="ts">
	import "../app.css";
	import { afterNavigate } from "$app/navigation";
	import { theme } from "$lib/stores/theme";
	import { user } from "$lib/stores/auth";
	import { setAnalyticsUid, trackPageView } from "$lib/analytics";
	import SEO from "$lib/components/SEO.svelte";

	let { children } = $props();
	let mounted = $state(false);

	$effect(() => {
		mounted = true;
	});

	afterNavigate(() => {
		trackPageView(window.location.pathname);
	});

	$effect(() => {
		setAnalyticsUid($user?.uid ?? null);
	});
</script>

<SEO />

{#if mounted}
	{@render children()}
{/if}
