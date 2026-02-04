<script lang="ts">
    import {
        signInWithGoogle,
        sendMagicLink,
        user,
        loading,
    } from "$lib/stores/auth";
    import { goto } from "$app/navigation";
    import {
        Mail,
        ArrowRight,
        Check,
        ShieldCheck,
        Lock,
        ChefHat,
    } from "lucide-svelte";
    import { fade, fly } from "svelte/transition";
    import { onMount } from "svelte";

    let email = $state("");
    let message = $state("");
    let error = $state("");
    let emailSent = $state(false);
    let isLoading = $state(false);

    // Redirect if already logged in
    $effect(() => {
        if ($user && !$loading) {
            goto("/plan", { replaceState: true }); // Redirect to the main app area
        }
    });

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
</script>

<div
    class="min-h-screen bg-app-bg text-app-text font-display flex flex-col justify-center items-center p-6 relative overflow-hidden"
>
    <!-- Background Elements -->

    <div class="absolute inset-0 pointer-events-none overflow-hidden">
        <div
            class="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-app-primary/5 blur-[100px] rounded-full"
        ></div>
        <div
            class="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-emerald-500/5 blur-[100px] rounded-full"
        ></div>
    </div>

    <!-- Main Card -->
    <div
        class="w-full max-w-md bg-app-surface p-8 md:p-10 rounded-3xl border border-app-border shadow-xl relative z-10"
        in:fly={{ y: 20, duration: 600, delay: 100 }}
    >
        <!-- Logo/Header -->
        <div class="text-center mb-8">
            <a
                href="/"
                class="inline-flex items-center justify-center gap-3 mb-2 hover:opacity-80 transition-opacity"
            >
                <div class="p-2 bg-app-primary/10 rounded-xl">
                    <ChefHat size={32} class="text-app-primary" />
                </div>
                <h1 class="text-3xl font-black text-app-text">
                    <span class="text-app-primary">YumHero</span>
                </h1>
            </a>
            <p class="text-app-text-muted">
                Sign in or create an account to get started.
            </p>
        </div>

        <!-- Error/Success Messages -->
        {#if error}
            <div
                class="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center gap-3"
                transition:fade
            >
                <div class="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                {error}
            </div>
        {/if}
        {#if message}
            <div
                class="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm font-medium flex items-center gap-2"
                transition:fade
            >
                <Check size={18} />
                {message}
            </div>
        {/if}

        <!-- Google Button -->
        <button
            onclick={handleGoogleLogin}
            disabled={isLoading}
            class="w-full relative flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-4 rounded-2xl hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
        >
            <svg
                class="h-5 w-5 group-hover:scale-110 transition-transform duration-300"
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
            <span>Continue with Google</span>
        </button>

        <!-- Divider -->
        <div class="relative flex py-6 items-center">
            <div class="flex-grow border-t border-app-border"></div>
            <span
                class="flex-shrink-0 mx-4 text-xs font-bold text-app-text-muted uppercase tracking-wider"
                >Or via email</span
            >
            <div class="flex-grow border-t border-app-border"></div>
        </div>

        {#if !emailSent}
            <form onsubmit={handleMagicLink} class="space-y-4">
                <div class="relative group">
                    <Mail
                        class="absolute left-4 top-1/2 -translate-y-1/2 text-app-text-muted group-focus-within:text-app-primary transition-colors"
                        size={20}
                    />
                    <input
                        type="email"
                        bind:value={email}
                        placeholder="you@example.com"
                        required
                        disabled={isLoading}
                        class="w-full pl-12 pr-4 py-3.5 bg-app-surface-deep border border-app-border rounded-xl focus:outline-none focus:border-app-primary focus:ring-4 focus:ring-app-primary/10 text-app-text placeholder:text-app-text-muted/50 transition-all font-medium"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    class="w-full bg-app-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-app-primary/25 hover:bg-app-primary/90 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
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
            <div
                class="text-center py-6 bg-app-bg/50 rounded-2xl border border-app-border border-dashed"
            >
                <div
                    class="w-12 h-12 bg-app-primary/10 text-app-primary rounded-full flex items-center justify-center mx-auto mb-3"
                >
                    <Mail size={24} />
                </div>
                <p class="text-app-text font-medium mb-1">Check your inbox</p>
                <p class="text-sm text-app-text-muted mb-4">
                    We sent a magic link to <br /><span
                        class="text-app-text font-bold">{email}</span
                    >
                </p>
                <button
                    class="text-xs font-bold text-app-primary hover:text-app-primary/80 transition-colors uppercase tracking-wider"
                    onclick={() => (emailSent = false)}
                >
                    Use a different email
                </button>
            </div>
        {/if}
    </div>

    <!-- Trust/Footer -->
    <div
        class="mt-8 text-center space-y-4 relative z-10"
        in:fly={{ y: 20, duration: 600, delay: 200 }}
    >
        <div
            class="flex items-center justify-center gap-6 text-sm text-app-text-muted"
        >
            <div class="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                <span>Secure Login</span>
            </div>
            <div class="flex items-center gap-1.5">
                <Lock size={14} />
                <span>Encrypted</span>
            </div>
        </div>
        <p
            class="text-xs text-app-text-muted/70 max-w-xs mx-auto leading-relaxed"
        >
            By continuing, you agree to YumHero's
            <a
                href="/terms"
                class="hover:text-app-primary transition-colors hover:underline"
                >Terms of Service</a
            >
            and
            <a
                href="/privacy"
                class="hover:text-app-primary transition-colors hover:underline"
                >Privacy Policy</a
            >.
        </p>
    </div>
</div>
