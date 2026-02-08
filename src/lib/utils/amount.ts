import { Fraction, type Fraction as FractionType } from '$lib/utils/fraction';

const normalizeUnicodeFractions = (value: string): string => {
    return value
        .replace(/½/g, ' 1/2')
        .replace(/⅓/g, ' 1/3')
        .replace(/⅔/g, ' 2/3')
        .replace(/¼/g, ' 1/4')
        .replace(/¾/g, ' 3/4')
        .replace(/⅕/g, ' 1/5')
        .replace(/⅖/g, ' 2/5')
        .replace(/⅗/g, ' 3/5')
        .replace(/⅘/g, ' 4/5')
        .replace(/⅙/g, ' 1/6')
        .replace(/⅚/g, ' 5/6')
        .replace(/⅐/g, ' 1/7')
        .replace(/⅛/g, ' 1/8')
        .replace(/⅜/g, ' 3/8')
        .replace(/⅝/g, ' 5/8')
        .replace(/⅞/g, ' 7/8')
        .replace(/⅑/g, ' 1/9')
        .replace(/⅒/g, ' 1/10')
        .replace(/\s+/g, ' ')
        .trim();
};

const parseSimpleFraction = (value: string): FractionType | null => {
    const parts = value.split('/');
    if (parts.length !== 2) return null;

    const n = Number(parts[0].trim());
    const d = Number(parts[1].trim());
    if (!Number.isInteger(n) || !Number.isInteger(d) || d === 0) {
        return null;
    }

    return Fraction.normalize({ n, d });
};

/**
 * Input: string | number | Fraction | null
 * Output: normalized Fraction | null
 */
export const parseAmountValue = (
    value: string | number | FractionType | null | undefined
): FractionType | null => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'number') return Fraction.fromNumber(value);
    if (Fraction.is(value)) return Fraction.normalize(value);

    const raw = normalizeUnicodeFractions(value.trim());
    if (!raw) return null;

    if (raw.includes('-')) {
        const parts = raw.split('-');
        return parseAmountValue(parts[parts.length - 1]);
    }

    if (raw.includes(' ')) {
        const parts = raw.split(/\s+/);
        if (parts.length === 2) {
            const whole = Number(parts[0]);
            const frac = parseSimpleFraction(parts[1]);
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

    if (raw.includes('/')) {
        return parseSimpleFraction(raw);
    }

    const num = parseFloat(raw);
    return Number.isNaN(num) ? null : Fraction.fromNumber(num);
};
