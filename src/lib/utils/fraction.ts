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
        const x = Math.abs(value);
        const tolerance = 1e-9;
        const maxDenominator = 10000;

        let hPrev = 0;
        let h = 1;
        let kPrev = 1;
        let k = 0;
        let b = x;

        while (true) {
            const a = Math.floor(b);
            const hNext = a * h + hPrev;
            const kNext = a * k + kPrev;

            if (kNext > maxDenominator) break;

            const approx = hNext / kNext;
            hPrev = h;
            h = hNext;
            kPrev = k;
            k = kNext;

            if (Math.abs(x - approx) <= tolerance) break;

            const frac = b - a;
            if (frac <= tolerance) break;
            b = 1 / frac;
        }

        if (k === 0) return null;
        return Fraction.normalize({ n: sign * h, d: k });
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
