<script lang="ts">
    import PricingTable from "$lib/components/PricingTable.svelte";
</script>

<section id="pricing" class="py-20 md:py-32 overflow-hidden">
    <div class="max-w-7xl mx-auto px-6 lg:px-12">
        <div class="text-center mb-24">
            <h2 class="text-3xl md:text-5xl font-bold text-app-text mb-6">
                Simple & Transparent
            </h2>
            <p class="text-lg text-app-text-muted max-w-2xl mx-auto">
                No hidden fees. No upsells. One plan for all your kitchen needs.
            </p>
        </div>

        <PricingTable />
    </div>
</section>
