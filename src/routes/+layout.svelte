<script lang="ts">
	import "../app.css";
	import { theme } from "$lib/stores/theme";
	import { user } from "$lib/stores/auth";
	import { initializeDefaults } from "$lib/stores/userData";
	import Navbar from "$lib/components/Navbar.svelte";

	$effect(() => {
		if ($user) {
			initializeDefaults();
		}
	});

	let { children } = $props();
</script>

<div
	class="h-screen w-screen bg-canvas text-text-primary overflow-hidden flex flex-col md:flex-row font-display transition-all duration-300"
>
	<Navbar />
	<main class="flex-1 overflow-hidden h-full order-first md:order-last">
		{@render children()}
	</main>
</div>
