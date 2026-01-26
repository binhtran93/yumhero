<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="h-screen w-screen bg-canvas text-text-primary overflow-hidden flex flex-col font-display">
	<header class="h-12 border-b border-border-subtle bg-surface flex items-center px-6 justify-between flex-shrink-0">
		<div class="flex items-center gap-4">
			<h1 class="text-sm font-bold tracking-tight uppercase">YumHero <span class="text-text-secondary font-normal ml-2">Weekly Planner</span></h1>
		</div>
		<div class="text-xs text-text-secondary font-mono">
			Week 42 • 2026
		</div>
	</header>
	<main class="flex-1 overflow-hidden">
		{@render children()}
	</main>
</div>
