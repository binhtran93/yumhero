const UNIT_ALIASES: Record<string, string> = {
    g: 'g',
    gram: 'g',
    grams: 'g',
    kg: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    ml: 'ml',
    milliliter: 'ml',
    milliliters: 'ml',
    l: 'l',
    liter: 'l',
    liters: 'l',
    lb: 'lb',
    lbs: 'lb',
    pound: 'lb',
    pounds: 'lb',
    oz: 'oz',
    ounce: 'oz',
    ounces: 'oz',
    tbsp: 'tbsp',
    tablespoon: 'tbsp',
    tablespoons: 'tbsp',
    tsp: 'tsp',
    teaspoon: 'tsp',
    teaspoons: 'tsp',
    cup: 'cup',
    cups: 'cup',
    pc: 'pc',
    pcs: 'pc',
    piece: 'pc',
    pieces: 'pc'
};

/**
 * Input: unit text
 * Output: canonical unit text for merging/storage
 */
export const normalizeUnit = (unit: string): string => {
    const normalized = unit.toLowerCase().trim();
    return UNIT_ALIASES[normalized] ?? normalized;
};

export const normalizeNullableUnit = (unit: string | null | undefined): string | null => {
    if (!unit) return null;
    const normalized = normalizeUnit(unit);
    return normalized.length === 0 ? null : normalized;
};

export const areMergeableUnits = (left: string | null, right: string | null): boolean => {
    const l = left ? normalizeUnit(left) : '';
    const r = right ? normalizeUnit(right) : '';
    return l === r || !l || !r;
};
