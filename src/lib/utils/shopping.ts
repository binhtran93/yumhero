import type { Fraction, WeeklyPlan, Recipe, Ingredient, MealType } from "$lib/types";

export interface ShoppingItem {
    id: string; // unique key (name + unit)
    name: string;
    amount: number;
    unit: string;
    checked: boolean;
    sources: {
        recipeName: string;
        day: string;
        mealType: MealType;
        originalAmount: number; // useful for display "2 (from Pancakes)"
    }[];
}

const gcd = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const next = x % y;
        x = y;
        y = next;
    }
    return x || 1;
};

export const normalizeFraction = (fraction: Fraction): Fraction | null => {
    if (!Number.isFinite(fraction.n) || !Number.isFinite(fraction.d) || fraction.d === 0) {
        return null;
    }
    if (!Number.isInteger(fraction.n) || !Number.isInteger(fraction.d)) {
        return null;
    }

    const sign = fraction.d < 0 ? -1 : 1;
    const n = fraction.n * sign;
    const d = Math.abs(fraction.d);
    const divisor = gcd(n, d);
    return { n: n / divisor, d: d / divisor };
};

const numberToFraction = (value: number): Fraction | null => {
    if (!Number.isFinite(value)) return null;
    if (Number.isInteger(value)) return { n: value, d: 1 };

    const sign = value < 0 ? -1 : 1;
    const abs = Math.abs(value);
    let str = abs.toString();

    if (str.includes("e") || str.includes("E")) {
        str = abs.toFixed(12).replace(/0+$/, "").replace(/\.$/, "");
    }

    const decimalIndex = str.indexOf(".");
    if (decimalIndex === -1) return { n: sign * Number(str), d: 1 };

    const decimals = str.length - decimalIndex - 1;
    const denominator = 10 ** decimals;
    const numerator = Math.round(abs * denominator) * sign;
    return normalizeFraction({ n: numerator, d: denominator });
};

const isFractionLike = (value: unknown): value is Fraction => {
    return Boolean(
        value &&
            typeof value === 'object' &&
            'n' in value &&
            'd' in value
    );
};

const parseFraction = (frac: string): Fraction | null => {
    const parts = frac.split("/");
    if (parts.length !== 2) return null;

    const num = Number(parts[0].trim());
    const den = Number(parts[1].trim());
    if (!Number.isInteger(num) || !Number.isInteger(den) || den === 0) {
        return null;
    }
    return normalizeFraction({ n: num, d: den });
};

const normalizeUnicodeFractions = (value: string): string => {
    return value
        .replace(/½/g, " 1/2")
        .replace(/⅓/g, " 1/3")
        .replace(/⅔/g, " 2/3")
        .replace(/¼/g, " 1/4")
        .replace(/¾/g, " 3/4")
        .replace(/⅕/g, " 1/5")
        .replace(/⅖/g, " 2/5")
        .replace(/⅗/g, " 3/5")
        .replace(/⅘/g, " 4/5")
        .replace(/⅙/g, " 1/6")
        .replace(/⅚/g, " 5/6")
        .replace(/⅐/g, " 1/7")
        .replace(/⅛/g, " 1/8")
        .replace(/⅜/g, " 3/8")
        .replace(/⅝/g, " 5/8")
        .replace(/⅞/g, " 7/8")
        .replace(/⅑/g, " 1/9")
        .replace(/⅒/g, " 1/10")
        .replace(/\s+/g, " ")
        .trim();
};

// Parse string/number/fraction input. Fractions like "4/3" are preserved structurally.
export const parseAmountValue = (amountStr: string | number | Fraction | null | undefined): Fraction | null => {
    if (amountStr === null || amountStr === undefined) return null;
    if (typeof amountStr === 'number') return numberToFraction(amountStr);
    if (isFractionLike(amountStr)) return normalizeFraction(amountStr);

    // Remove non-numeric chars except / . and space and -
    const cleanStr = normalizeUnicodeFractions(amountStr.trim());
    if (!cleanStr) return null;

    // Handle range "1-2" -> take average? or max? usually max for shopping. Let's take max.
    if (cleanStr.includes("-")) {
        const parts = cleanStr.split("-");
        const max = parts[parts.length - 1];
        return parseAmountValue(max);
    }

    try {
        // Handle mixed fractions "1 1/2"
        if (cleanStr.includes(" ")) {
            const parts = cleanStr.split(/\s+/);
            // If strictly "1 1/2" -> 3 parts? No, split by space.
            // Check if parts are valid
            if (parts.length === 2) {
                const whole = Number(parts[0]);
                const frac = parseFraction(parts[1]);
                if (Number.isInteger(whole) && frac) {
                    const sign = whole < 0 ? -1 : 1;
                    const absWhole = Math.abs(whole);
                    return normalizeFraction({
                        n: sign * (absWhole * frac.d + frac.n),
                        d: frac.d
                    });
                }
            }
        }

        // Handle simple fraction "1/2"
        if (cleanStr.includes("/")) {
            return parseFraction(cleanStr);
        }

        const float = parseFloat(cleanStr);
        return isNaN(float) ? null : numberToFraction(float);
    } catch (e) {
        console.warn("Failed to parse amount:", amountStr);
        return null;
    }
};

// Numeric view for calculations.
export const amountToNumber = (amount: Fraction | null | undefined): number | null => {
    if (amount === null || amount === undefined) return null;
    if (typeof amount === 'number') return amount;
    const fraction = normalizeFraction(amount);
    if (!fraction) return null;
    return fraction.n / fraction.d;
};

// Backward-compatible parse helper for numeric calculations.
export const parseAmount = (amount: string | number | Fraction | null | undefined): number | null => {
    return amountToNumber(parseAmountValue(amount));
};

// Use this to display back to user if needed, or simple toFixed(2)
export const formatAmount = (amount: number | Fraction | null | undefined): string => {
    if (amount === null || amount === undefined) return "";

    if (typeof amount === 'number') {
        if (amount === 0) return "0";
        const rounded = Math.round(amount * 100) / 100;
        return parseFloat(rounded.toFixed(2)).toString();
    }

    const fraction = normalizeFraction(amount);
    if (!fraction) return "";
    if (fraction.d === 1) return fraction.n.toString();

    const sign = fraction.n < 0 ? "-" : "";
    const absN = Math.abs(fraction.n);
    const whole = Math.floor(absN / fraction.d);
    const remainder = absN % fraction.d;

    if (remainder === 0) {
        return `${sign}${whole}`;
    }
    if (whole === 0) {
        return `${sign}${remainder}/${fraction.d}`;
    }
    return `${sign}${whole} ${remainder}/${fraction.d}`;
};


// Normalize units to try to merge "g" and "grams", "cup" and "cups"
const normalizeUnit = (unit: string): string => {
    const u = unit.toLowerCase().trim();
    if (u === "g" || u === "gram" || u === "grams") return "g";
    if (u === "kg" || u === "kilogram" || u === "kilograms") return "kg";
    if (u === "ml" || u === "milliliter" || u === "milliliters") return "ml";
    if (u === "l" || u === "liter" || u === "liters") return "l";
    if (u === "lb" || u === "lbs" || u === "pound" || u === "pounds") return "lb";
    if (u === "oz" || u === "ounce" || u === "ounces") return "oz";
    if (u === "tbsp" || u === "tablespoon" || u === "tablespoons") return "tbsp";
    if (u === "tsp" || u === "teaspoon" || u === "teaspoons") return "tsp";
    if (u === "cup" || u === "cups") return "cup";
    if (u === "pc" || u === "pcs" || u === "piece" || u === "pieces") return "pc";
    return u; // Return original if not matched
};
