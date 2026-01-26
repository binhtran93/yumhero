<script lang="ts">
    import { X, Mail, ArrowRight, Check } from "lucide-svelte";
    import {
        signInWithGoogle,
        sendMagicLink,
        loading,
        user,
    } from "$lib/stores/auth";
    import { fade, scale } from "svelte/transition";
    import { quintOut } from "svelte/easing";

    interface Props {
        isOpen: boolean;
        onClose: () => void;
    }

    let { isOpen, onClose }: Props = $props();

    let email = $state("");
    let message = $state("");
    let error = $state("");
    let emailSent = $state(false);
    let isLoading = $state(false);

    // Reset state when modal opens
    $effect(() => {
        if (isOpen) {
            email = "";
            message = "";
            error = "";
            emailSent = false;
            isLoading = false;
        }
    });

    // Close when user logs in
    $effect(() => {
        if ($user && isOpen) {
            onClose();
        }
    });

    const handleGoogleLogin = async () => {
        isLoading = true;
        error = "";
        try {
            await signInWithGoogle();
            // handling is done in effect via user store update
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
</script>

{#if isOpen}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <!-- Soft Backdrop -->
        <div
            class="absolute inset-0 bg-stone-900/60 backdrop-blur-sm transition-opacity"
            onclick={onClose}
            onkeydown={(e) => e.key === "Escape" && onClose()}
            role="button"
            tabindex="0"
            transition:fade={{ duration: 200 }}
        ></div>

        <!-- Modal Content -->
        <div
            class="relative z-10 w-full max-w-md bg-bg-surface border border-border-strong shadow-2xl flex flex-col rounded-3xl overflow-hidden"
            transition:scale={{ duration: 300, easing: quintOut, start: 0.95 }}
        >
            <!-- Header -->
            <div class="p-6 pb-2 flex items-start justify-between">
                <div>
                    <h2
                        class="text-2xl font-display font-bold text-text-primary"
                    >
                        Welcome Back!
                    </h2>
                    <p class="text-text-secondary text-sm mt-1">
                        Sign in to sync your meal plans.
                    </p>
                </div>
                <button
                    onclick={onClose}
                    class="p-2 -mr-2 -mt-2 text-text-secondary hover:text-text-primary hover:bg-bg-surface-hover rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            <div class="p-6 pt-4 space-y-6">
                <!-- Error/Success Messages -->
                {#if error}
                    <div
                        class="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center gap-2"
                        transition:fade
                    >
                        <div class="w-1 h-full bg-red-500 rounded-full"></div>
                        {error}
                    </div>
                {/if}
                {#if message}
                    <div
                        class="p-3 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2"
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
                        <g
                            transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"
                        >
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

                <div class="relative flex py-2 items-center">
                    <div class="flex-grow border-t border-border-default"></div>
                    <span
                        class="flex-shrink-0 mx-4 text-xs font-bold text-text-secondary uppercase tracking-wider"
                        >Or via email</span
                    >
                    <div class="flex-grow border-t border-border-default"></div>
                </div>

                {#if !emailSent}
                    <form onsubmit={handleMagicLink} class="space-y-4">
                        <div class="relative">
                            <Mail
                                class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
                                size={18}
                            />
                            <input
                                type="email"
                                bind:value={email}
                                placeholder="you@example.com"
                                required
                                disabled={isLoading}
                                class="w-full pl-11 pr-4 py-3 bg-bg-accent-subtle border border-border-default rounded-xl focus:outline-none focus:border-action-primary focus:ring-2 focus:ring-action-primary/10 text-text-primary placeholder:text-text-secondary/50 transition-all font-medium"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            class="w-full bg-action-primary text-white font-bold py-3 rounded-xl shadow-lg shadow-action-primary/20 hover:bg-action-primary/90 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
                        <p class="text-text-primary font-medium mb-4">
                            We sent a magic link to <span
                                class="text-action-primary font-bold"
                                >{email}</span
                            >
                        </p>
                        <button
                            class="text-sm font-bold text-text-secondary hover:text-action-primary underline decoration-2 decoration-transparent hover:decoration-current transition-all"
                            onclick={() => (emailSent = false)}
                        >
                            Use a different email
                        </button>
                    </div>
                {/if}
            </div>

            <div
                class="p-4 bg-bg-accent-subtle text-center text-xs text-text-secondary border-t border-border-default"
            >
                By signing in, you agree to our Terms of Service and Privacy
                Policy.
            </div>
        </div>
    </div>
{/if}
