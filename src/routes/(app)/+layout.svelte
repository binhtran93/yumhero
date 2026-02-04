<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import { user, loading } from "$lib/stores/auth";
    import { isSubscribed } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let { children } = $props();

    $effect(() => {
        if (!$loading) {
            if (!$user) {
                goto("/login");
            } else if (!$isSubscribed) {
                goto("/subscribe");
            }
        }
    });
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
