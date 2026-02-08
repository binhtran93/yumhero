import { Fraction, type Fraction as FractionType } from "$lib/utils/fraction";
import type { MealType } from "$lib/types";

const parseFraction = (frac: string): FractionType | null => {
    const parts = frac.split("/");
    if (parts.length !== 2) return null;

    const num = Number(parts[0].trim());
    const den = Number(parts[1].trim());
    if (!Number.isInteger(num) || !Number.isInteger(den) || den === 0) {
        return null;
    }
    return Fraction.normalize({ n: num, d: den });
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
export const parseAmountValue = (amountStr: string | number | FractionType | null | undefined): FractionType | null => {
    if (amountStr === null || amountStr === undefined) return null;
    if (typeof amountStr === 'number') return Fraction.fromNumber(amountStr);
    if (Fraction.is(amountStr)) return Fraction.normalize(amountStr);

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
                    return Fraction.normalize({
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
        return isNaN(float) ? null : Fraction.fromNumber(float);
    } catch (e) {
        console.warn("Failed to parse amount:", amountStr);
        return null;
    }
};
