export const CATEGORIES = ['travel', 'meals', 'lodging', 'supplies', 'software'] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Fraction of an expense the company pays back, as a whole percent, by
 * category. A category missing here reimburses 0%.
 */
export const REIMBURSEMENT_RATES: Record<string, number> = {
  travel: 100,
  meals: 50,
  lodging: 100,
  supplies: 75,
  software: 100,
};

/** Whole cents the company reimburses for `amountCents` at `ratePercent`. */
export function reimbursableCents(amountCents: number, ratePercent: number): number {
  return Math.trunc((amountCents * ratePercent) / 100);
}

/** Reimbursable cents for one expense, using its category's policy rate. */
export function reimbursableForCategory(amountCents: number, category: string): number {
  return reimbursableCents(amountCents, REIMBURSEMENT_RATES[category] ?? 0);
}

export function sumCents(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
