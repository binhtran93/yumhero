<script lang="ts">
    interface Props {
        title?: string;
        description?: string;
        image?: string;
        url?: string;
        type?: "website" | "article";
        noindex?: boolean;
        jsonLd?: Record<string, unknown> | null;
    }

    let {
        title = "YumHero",
        description = "Your personal meal planning hero. Plan weekly meals, manage recipes, track ingredients, and reduce food waste.",
        image = "/icons/icon-512x512.png",
        url = "",
        type = "website",
        noindex = false,
        jsonLd = null,
    }: Props = $props();

    let fullTitle = $derived(
        title === "YumHero" ? title : `${title} | YumHero`,
    );
    const siteName = "YumHero";
</script>

<svelte:head>
    <title>{fullTitle}</title>
    <meta name="description" content={description} />

    <!-- Canonical URL -->
    {#if url}
        <link rel="canonical" href={url} />
    {/if}

    <!-- Robots -->
    {#if noindex}
        <meta name="robots" content="noindex, nofollow" />
    {/if}

    <!-- Open Graph -->
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content={type} />
    <meta property="og:site_name" content={siteName} />
    {#if url}
        <meta property="og:url" content={url} />
    {/if}
    {#if image}
        <meta property="og:image" content={image} />
    {/if}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={fullTitle} />
    <meta name="twitter:description" content={description} />
    {#if image}
        <meta name="twitter:image" content={image} />
    {/if}

    <!-- Structured Data (JSON-LD) -->
    {#if jsonLd}
        {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
    {/if}
</svelte:head>
