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

const EXTRA_UNIT_TOKENS = [
    'tsp.',
    'tbsp.',
    'c.',
    'oz.',
    'fl',
    'fl.',
    'floz',
    'fluid',
    'fluid-ounce',
    'fluid-ounces',
    'pinch',
    'pinches',
    'dash',
    'dashes',
    'clove',
    'cloves',
    'slice',
    'slices',
    'can',
    'cans',
    'package',
    'packages',
    'pack',
    'packs',
    'stick',
    'sticks'
] as const;

export const KNOWN_UNIT_TOKENS = new Set<string>([
    ...Object.keys(UNIT_ALIASES),
    ...EXTRA_UNIT_TOKENS
]);

export const isKnownUnitToken = (value: string): boolean => {
    const normalized = value.toLowerCase().trim();
    return KNOWN_UNIT_TOKENS.has(normalized) || KNOWN_UNIT_TOKENS.has(normalizeUnit(normalized));
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
