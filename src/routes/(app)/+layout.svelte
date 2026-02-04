<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import { user, loading as authLoading } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
    } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";
    import { onMount } from "svelte";

    let { children } = $props();

    $effect(() => {
        if (!$authLoading) {
            if (!$user) {
                goto("/login", { replaceState: true });
            } else if (!$subscriptionLoading && !$isSubscribed) {
                goto("/subscribe", { replaceState: true });
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
