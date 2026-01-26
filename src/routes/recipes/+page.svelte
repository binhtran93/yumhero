<script lang="ts">
    import Header from "$lib/components/Header.svelte";
</script>

<!-- Header -->
<Header title="Recipes" />

<div class="p-8 max-w-4xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
            class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm flex flex-col items-center justify-center text-center h-64 gap-4 bg-dashed border-dashed border-2"
        >
            <div
                class="w-12 h-12 rounded-full bg-accent-breakfast/10 flex items-center justify-center text-accent-breakfast"
            >
                <span class="text-2xl">+</span>
            </div>
            <p class="font-medium text-text-primary">Add New Recipe</p>
        </div>

        <!-- Placeholders -->
        {#each Array(5) as _, i}
            <div
                class="bg-bg-surface p-6 rounded-2xl border border-border-default shadow-sm hover:shadow-md transition-shadow"
            >
                <div
                    class="w-full h-32 bg-bg-surface-hover rounded-xl mb-4"
                ></div>
                <div
                    class="h-6 w-3/4 bg-bg-surface-hover rounded-full mb-2"
                ></div>
                <div class="h-4 w-1/2 bg-bg-surface-hover rounded-full"></div>
            </div>
        {/each}
    </div>
</div>
