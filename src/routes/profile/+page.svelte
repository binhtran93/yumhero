<script lang="ts">
    import {
        signInWithGoogle,
        sendMagicLink,
        signOut,
        user,
    } from "$lib/stores/auth";
    import {
        Mail,
        ArrowRight,
        Check,
        Trash2,
        LogOut,
        User,
        Sun,
        Moon,
    } from "lucide-svelte";
    import { fade } from "svelte/transition";
    import Avatar from "$lib/components/Avatar.svelte";
    import { theme } from "$lib/stores/theme";
    import { sidebarExpanded } from "$lib/stores/ui";

    let email = $state("");
    let message = $state("");
    let error = $state("");
    let emailSent = $state(false);
    let isLoading = $state(false);

    const handleGoogleLogin = async () => {
        isLoading = true;
        error = "";
        try {
            await signInWithGoogle();
        } catch (e: any) {
            error = e.message;
            isLoading = false;
        }
    };

    const handleMagicLink = async (e: Event) => {
        e.preventDefault();
        if (!email) {
            error = "Please enter your email address.";
            return;
        }
        isLoading = true;
        error = "";
        try {
            await sendMagicLink(email);
            message = "Magic link sent! Check your inbox.";
            emailSent = true;
        } catch (e: any) {
            error = e.message;
        } finally {
            isLoading = false;
        }
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const handleDeleteAccount = () => {
        // Placeholder for delete account logic
        toasts.info("Delete account functionality coming soon.");
    };
    import Header from "$lib/components/Header.svelte";
    import { toasts } from "$lib/stores/toasts";
</script>

<!-- Header -->
<Header title="Profile" />

<div class="p-4 md:p-8 max-w-2xl mx-auto">
    {#if $user}
        <!-- User Authenticated View -->
        <div
            class="bg-app-surface p-5 md:p-8 rounded-2xl border border-app-border shadow-sm space-y-6 md:space-y-8"
            transition:fade
        >
            <div
                class="flex flex-col items-center justify-center text-center gap-3 md:gap-4"
            >
                <Avatar
                    src={$user.photoURL}
                    name={$user.displayName || $user.email}
                    size="lg"
                />
                <div>
                    <h2 class="text-xl md:text-2xl font-bold text-app-text">
                        {$user.displayName || "User"}
                    </h2>
                    <p class="text-sm md:text-base text-app-text-muted">
                        {$user.email}
                    </p>
                </div>
            </div>

            <div class="border-t border-app-border my-4 md:my-6"></div>

            <!-- Settings Section -->
            <div class="space-y-6">
                <div class="flex items-center gap-2 px-1">
                    <h3
                        class="text-sm font-bold text-app-text-muted uppercase tracking-wider"
                    >
                        Settings
                    </h3>
                </div>

                <div class="space-y-3">
                    <!-- Current Plan -->
                    <div
                        class="flex items-center justify-between p-3 md:p-4 bg-app-bg rounded-xl border border-app-border/50"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 bg-app-primary/10 rounded-lg text-app-primary"
                            >
                                <User size={20} />
                            </div>
                            <div>
                                <p class="text-sm font-bold text-app-text">
                                    Current Plan
                                </p>
                                <p class="text-xs text-app-text-muted">
                                    Free Trial
                                </p>
                            </div>
                        </div>
                        <span
                            class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full"
                            >Active</span
                        >
                    </div>

                    <!-- Appearance / Theme Toggle -->
                    <div
                        class="flex items-center justify-between p-3 md:p-4 bg-app-bg rounded-xl border border-app-border/50"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="p-2 bg-app-primary/10 rounded-lg text-app-primary"
                            >
                                {#if $theme === "dark"}
                                    <Sun size={20} />
                                {:else}
                                    <Moon size={20} />
                                {/if}
                            </div>
                            <div>
                                <p class="text-sm font-bold text-app-text">
                                    Appearance
                                </p>
                                <p class="text-xs text-app-text-muted">
                                    {$theme === "dark"
                                        ? "Dark Mode"
                                        : "Light Mode"}
                                </p>
                            </div>
                        </div>
                        <button
                            onclick={() =>
                                ($theme = $theme === "dark" ? "light" : "dark")}
                            class="px-4 py-1.5 bg-app-surface border border-app-border text-app-text text-sm font-bold rounded-lg hover:bg-app-surface-hover transition-colors shadow-sm"
                        >
                            Switch to {$theme === "dark" ? "Light" : "Dark"}
                        </button>
                    </div>
                </div>
            </div>

            <div class="border-t border-app-border my-4 md:my-6"></div>

            <!-- Actions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <button
                    onclick={handleSignOut}
                    class="flex items-center justify-center gap-2 p-3 rounded-xl border border-app-border text-app-text-muted hover:bg-app-surface-hover hover:text-app-text transition-colors font-medium text-sm md:text-base"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
                <button
                    onclick={handleDeleteAccount}
                    class="flex items-center justify-center gap-2 p-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-sm md:text-base"
                >
                    <Trash2 size={18} />
                    Delete Account
                </button>
            </div>
        </div>
    {:else}
        <!-- Guest Login View -->
        <div
            class="bg-app-surface p-5 md:p-8 rounded-2xl border border-app-border shadow-sm max-w-md mx-auto"
            transition:fade
        >
            <h2 class="text-xl font-bold text-app-text mb-6 text-center">
                Sign In to YumHero
            </h2>

            <!-- Error/Success Messages -->
            {#if error}
                <div
                    class="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center gap-2"
                    transition:fade
                >
                    <div class="w-1 h-full bg-red-500 rounded-full"></div>
                    {error}
                </div>
            {/if}
            {#if message}
                <div
                    class="mb-6 p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2"
                    transition:fade
                >
                    <Check size={16} />
                    {message}
                </div>
            {/if}

            <!-- Google Button -->
            <button
                onclick={handleGoogleLogin}
                disabled={isLoading}
                class="w-full relative flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-200 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
                <svg
                    class="h-5 w-5"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path
                            fill="#4285F4"
                            d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                        />
                        <path
                            fill="#34A853"
                            d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.059 -13.144 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.424 63.239 -14.754 63.239 Z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                        />
                        <path
                            fill="#EA4335"
                            d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.424 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                        />
                    </g>
                </svg>
                Continue with Google
            </button>

            <div class="relative flex py-4 items-center">
                <div class="flex-grow border-t border-app-border"></div>
                <span
                    class="flex-shrink-0 mx-4 text-xs font-bold text-app-text-muted uppercase tracking-wider"
                    >Or via email</span
                >
                <div class="flex-grow border-t border-app-border"></div>
            </div>

            {#if !emailSent}
                <form onsubmit={handleMagicLink} class="space-y-4">
                    <div class="relative">
                        <Mail
                            class="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted"
                            size={18}
                        />
                        <input
                            type="email"
                            bind:value={email}
                            placeholder="you@example.com"
                            required
                            disabled={isLoading}
                            class="w-full pl-11 pr-4 py-3 bg-app-surface-deep border border-app-border rounded-xl focus:outline-none focus:border-app-primary focus:ring-2 focus:ring-app-primary/10 text-app-text placeholder:text-app-text-muted/50 transition-all font-medium"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        class="w-full bg-app-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-app-primary/20 hover:bg-app-primary/90 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {#if isLoading}
                            <div
                                class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"
                            ></div>
                        {:else}
                            Send Magic Link <ArrowRight size={18} />
                        {/if}
                    </button>
                </form>
            {:else}
                <div class="text-center py-4">
                    <p class="text-app-text font-medium mb-4">
                        We sent a magic link to <span
                            class="text-app-primary font-bold">{email}</span
                        >
                    </p>
                    <button
                        class="text-sm font-bold text-app-text-muted hover:text-app-primary underline decoration-2 decoration-transparent hover:decoration-current transition-all"
                        onclick={() => (emailSent = false)}
                    >
                        Use a different email
                    </button>
                </div>
            {/if}

            <div class="mt-6 text-center text-xs text-app-text-muted">
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
            </div>
        </div>
    {/if}
</div>
