export function formatServings(servings: number | null | undefined): string {
    if (servings === null || servings === undefined) {
        return "Not sure";
    }

    if (servings % 1 !== 0) {
        return `${Math.floor(servings)} - ${Math.ceil(servings)}`;
    }

    return servings.toString();
}
