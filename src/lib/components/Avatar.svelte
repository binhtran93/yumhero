<script lang="ts">
    import { twMerge } from "tailwind-merge";

    interface Props {
        src?: string | null;
        name?: string | null;
        size?: "sm" | "md" | "lg" | "xl";
        className?: string;
    }

    let { src, name, size = "md", className }: Props = $props();

    const getInitials = (name?: string | null) => {
        if (!name) return "?";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    const getColorFromName = (name?: string | null) => {
        if (!name) return "bg-gray-500";

        // Simple hash function to get a deterministic index
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colors = [
            "bg-red-500",
            "bg-orange-500",
            "bg-amber-500",
            "bg-yellow-500",
            "bg-lime-500",
            "bg-green-500",
            "bg-emerald-500",
            "bg-teal-500",
            "bg-cyan-500",
            "bg-sky-500",
            "bg-blue-500",
            "bg-indigo-500",
            "bg-violet-500",
            "bg-purple-500",
            "bg-fuchsia-500",
            "bg-pink-500",
            "bg-rose-500",
        ];

        return colors[Math.abs(hash) % colors.length];
    };

    const sizeClasses = {
        sm: "w-6 h-6 text-xs",
        md: "w-8 h-8 text-sm",
        lg: "w-10 h-10 text-base",
        xl: "w-12 h-12 text-lg",
    };
</script>

<div
    class={twMerge(
        "relative inline-flex items-center justify-center overflow-hidden rounded-full select-none",
        sizeClasses[size],
        !src && getColorFromName(name),
        className,
    )}
>
    {#if src}
        <img
            {src}
            alt={name || "Avatar"}
            class="h-full w-full object-cover"
            referrerpolicy="no-referrer"
        />
    {:else}
        <span class="font-bold text-white leading-none">
            {getInitials(name)}
        </span>
    {/if}
</div>
