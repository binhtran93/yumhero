<script lang="ts">
	import "../app.css";
	let { children } = $props();
</script>

<div
	class="h-screen w-screen bg-canvas text-text-primary overflow-hidden flex flex-col font-display"
>
	<main class="flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>
