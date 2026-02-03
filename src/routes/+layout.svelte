<script lang="ts">
	import "../app.css";
	import { theme } from "$lib/stores/theme";
	import { user } from "$lib/stores/auth";
	import SEO from "$lib/components/SEO.svelte";

	let { children } = $props();
	let mounted = $state(false);

	$effect(() => {
		mounted = true;
	});
</script>

<SEO />

{#if mounted}
	{@render children()}
{/if}
