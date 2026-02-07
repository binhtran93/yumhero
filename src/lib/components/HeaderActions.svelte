<script lang="ts">
    import { headerActions } from "$lib/stores/ui";
    import { type Snippet } from "svelte";

    let { children }: { children: Snippet } = $props();

    $effect(() => {
        $headerActions = children;
        return () => {
            $headerActions = null;
        };
    });
</script>
