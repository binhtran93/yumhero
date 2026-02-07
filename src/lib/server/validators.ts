export function toNonEmptyString(value: unknown, fieldName: string): string {
    if (typeof value !== 'string') {
        throw new Error(`${fieldName} must be a string`);
    }

    const trimmed = value.trim();
    if (!trimmed) {
        throw new Error(`${fieldName} is required`);
    }

    return trimmed;
}

export function toNumber(value: unknown, fieldName: string): number {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        throw new Error(`${fieldName} must be a valid number`);
    }

    return value;
}
