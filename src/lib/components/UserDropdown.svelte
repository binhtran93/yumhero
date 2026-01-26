<script lang="ts">
    import { LogOut } from "lucide-svelte";
    import Avatar from "$lib/components/Avatar.svelte";
    import { user, signOut } from "$lib/stores/auth";
    import { fade, scale } from "svelte/transition";

    let isOpen = $state(false);

    const toggle = (e: MouseEvent) => {
        e.stopPropagation();
        isOpen = !isOpen;
    };

    const close = () => {
        isOpen = false;
    };

    const handleSignOut = async () => {
        await signOut();
        close();
    };
</script>

<svelte:window
    onclick={close}
    onkeydown={(e) => e.key === "Escape" && close()}
/>

<div class="relative">
    <button
        onclick={toggle}
        class="rounded-full transition-transform hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="User Menu"
        aria-expanded={isOpen}
    >
        <Avatar
            src={$user?.photoURL}
            name={$user?.displayName || $user?.email}
            size="md"
        />
    </button>

    {#if isOpen}
        <div
            class="absolute right-0 mt-2 w-48 rounded-xl bg-bg-surface border border-border-default shadow-lg overflow-hidden py-1 z-50 origin-top-right"
            transition:scale={{ duration: 150, start: 0.95 }}
        >
            <div
                class="px-4 py-3 border-b border-border-default bg-bg-surface-hover/50"
            >
                <p class="text-xs text-text-secondary font-medium">
                    Signed in as
                </p>
                <p
                    class="text-sm font-bold text-text-primary truncate"
                    title={$user?.email}
                >
                    {$user?.displayName || $user?.email}
                </p>
            </div>

            <button
                onclick={handleSignOut}
                class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors font-medium"
            >
                <LogOut size={16} />
                Sign out
            </button>
        </div>
    {/if}
</div>
