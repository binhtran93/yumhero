<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";

    let { children } = $props();
</script>

<div
    class="h-screen w-screen bg-app-bg text-app-text overflow-hidden flex flex-col md:flex-row font-display transition-all duration-300"
>
    <Navbar />
    <main class="flex-1 overflow-hidden h-full order-first md:order-last">
        {@render children()}
    </main>
    <ToastContainer />
</div>
