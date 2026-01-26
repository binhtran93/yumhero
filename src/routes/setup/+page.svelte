<script lang="ts">
    import { Moon, Sun, User, Bell, Shield } from "lucide-svelte";
    import { theme } from "$lib/stores/theme";

    const toggleTheme = () => {
        $theme = $theme === "light" ? "dark" : "light";
    };
</script>

<div class="p-8 max-w-2xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold font-display text-text-primary mb-2">
            Settings
        </h1>
        <p class="text-text-secondary">
            Manage your preferences and account settings.
        </p>
    </div>

    <div class="space-y-6">
        <!-- Appearance -->
        <section
            class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm"
        >
            <h2
                class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"
            >
                <Sun size={20} />
                Appearance
            </h2>
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-medium text-text-primary">Theme Mode</p>
                    <p class="text-sm text-text-secondary">
                        Switch between light and dark mode
                    </p>
                </div>
                <button
                    class="p-2 rounded-lg bg-bg-default border border-border-default hover:bg-bg-surface-hover transition-colors flex items-center gap-2"
                    onclick={toggleTheme}
                >
                    {#if $theme === "light"}
                        <Sun size={18} />
                        <span>Light</span>
                    {:else}
                        <Moon size={18} />
                        <span>Dark</span>
                    {/if}
                </button>
            </div>
        </section>

        <!-- Account -->
        <section
            class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm"
        >
            <h2
                class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"
            >
                <User size={20} />
                Account
            </h2>
            <div class="space-y-4">
                <div
                    class="flex items-center justify-between py-2 border-b border-border-default/50"
                >
                    <p class="text-text-primary">Profile Information</p>
                    <button
                        class="text-sm text-action-primary font-medium hover:underline"
                        >Edit</button
                    >
                </div>
                <div class="flex items-center justify-between py-2">
                    <p class="text-text-primary">Sign Out</p>
                    <button
                        class="text-sm text-red-500 font-medium hover:underline"
                        >Log Out</button
                    >
                </div>
            </div>
        </section>

        <!-- Notifications -->
        <section
            class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm opacity-60"
        >
            <h2
                class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2"
            >
                <Bell size={20} />
                Notifications
            </h2>
            <p class="text-sm text-text-secondary">Coming soon...</p>
        </section>
    </div>
</div>
