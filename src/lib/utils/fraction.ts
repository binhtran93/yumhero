export interface Fraction {
    n: number;
    d: number;
}

const FRACTION_EPSILON = 1e-12;

const fractionGcd = (a: number, b: number): number => {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
        const next = x % y;
        x = y;
        y = next;
    }
    return x || 1;
};

export const Fraction = {
    is(value: unknown): value is Fraction {
        return Boolean(
            value &&
                typeof value === 'object' &&
                'n' in value &&
                'd' in value &&
                Number.isInteger((value as Fraction).n) &&
                Number.isInteger((value as Fraction).d)
        );
    },
    normalize(value: Fraction | null | undefined): Fraction | null {
        if (!value) return null;
        if (!Number.isFinite(value.n) || !Number.isFinite(value.d) || value.d === 0) {
            return null;
        }
        if (!Number.isInteger(value.n) || !Number.isInteger(value.d)) {
            return null;
        }

        const sign = value.d < 0 ? -1 : 1;
        const n = value.n * sign;
        const d = Math.abs(value.d);
        const divisor = fractionGcd(n, d);
        return { n: n / divisor, d: d / divisor };
    },
    fromNumber(value: number): Fraction | null {
        if (!Number.isFinite(value)) return null;
        if (Number.isInteger(value)) return { n: value, d: 1 };

        const sign = value < 0 ? -1 : 1;
        const abs = Math.abs(value);
        let str = abs.toString();

        if (str.includes('e') || str.includes('E')) {
            str = abs.toFixed(12).replace(/0+$/, '').replace(/\.$/, '');
        }

        const decimalIndex = str.indexOf('.');
        if (decimalIndex === -1) return { n: sign * Number(str), d: 1 };

        const decimals = str.length - decimalIndex - 1;
        const denominator = 10 ** decimals;
        const numerator = Math.round(abs * denominator) * sign;
        return Fraction.normalize({ n: numerator, d: denominator });
    },
    toNumber(value: Fraction | null | undefined): number | null {
        const normalized = Fraction.normalize(value);
        if (!normalized) return null;
        return normalized.n / normalized.d;
    },
    add(left: Fraction, right: Fraction): Fraction | null {
        const l = Fraction.normalize(left);
        const r = Fraction.normalize(right);
        if (!l || !r) return null;
        return Fraction.normalize({ n: l.n * r.d + r.n * l.d, d: l.d * r.d });
    },
    subtract(left: Fraction, right: Fraction): Fraction | null {
        const l = Fraction.normalize(left);
        const r = Fraction.normalize(right);
        if (!l || !r) return null;
        return Fraction.normalize({ n: l.n * r.d - r.n * l.d, d: l.d * r.d });
    },
    multiply(left: Fraction, right: Fraction): Fraction | null {
        const l = Fraction.normalize(left);
        const r = Fraction.normalize(right);
        if (!l || !r) return null;
        return Fraction.normalize({ n: l.n * r.n, d: l.d * r.d });
    },
    divide(left: Fraction, right: Fraction): Fraction | null {
        const l = Fraction.normalize(left);
        const r = Fraction.normalize(right);
        if (!l || !r || r.n === 0) return null;
        return Fraction.normalize({ n: l.n * r.d, d: l.d * r.n });
    },
    eq(left: Fraction, right: Fraction): boolean {
        const l = Fraction.normalize(left);
        const r = Fraction.normalize(right);
        if (!l || !r) return false;
        return Math.abs(l.n * r.d - r.n * l.d) < FRACTION_EPSILON;
    },
    toMixedString(value: Fraction | null | undefined): string {
        const fraction = Fraction.normalize(value);
        if (!fraction) return '';
        if (fraction.d === 1) return fraction.n.toString();

        const sign = fraction.n < 0 ? '-' : '';
        const absN = Math.abs(fraction.n);
        const whole = Math.floor(absN / fraction.d);
        const remainder = absN % fraction.d;

        if (remainder === 0) return `${sign}${whole}`;
        if (whole === 0) return `${sign}${remainder}/${fraction.d}`;
        return `${sign}${whole} ${remainder}/${fraction.d}`;
    },
    format(value: number | Fraction | null | undefined): string {
        if (value === null || value === undefined) return '';
        if (typeof value === 'number') {
            if (value === 0) return '0';
            const fraction = Fraction.fromNumber(value);
            if (!fraction) return '';
            return Fraction.toMixedString(fraction);
        }
        return Fraction.toMixedString(value);
    }
};
