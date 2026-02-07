<script lang="ts">
    import Navbar from "$lib/components/Navbar.svelte";
    import Sidebar from "$lib/components/Sidebar.svelte";
    import ToastContainer from "$lib/components/ToastContainer.svelte";
    import { user, loading as authLoading } from "$lib/stores/auth";
    import {
        isSubscribed,
        subscriptionLoading,
    } from "$lib/stores/subscription";
    import { goto } from "$app/navigation";

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
    class="h-screen w-screen bg-app-bg text-app-text overflow-hidden flex flex-col font-display transition-all duration-300"
>
    <!-- Navbar: Sticky Top on Desktop, Fixed Bottom on Mobile -->
    <Navbar />

    <!-- Main Workspace: Sidebar + Content -->
    <div class="flex-1 flex overflow-hidden relative w-full">
        <Sidebar />

        <main class="flex-1 overflow-hidden h-full w-full pb-16 md:pb-0">
            {@render children()}
        </main>
    </div>

    <ToastContainer />
</div>
