import type { Currency } from './lib/money';

export interface Expense {
  id: string;
  employee: string;
  category: string;
  /** Amount in whole cents (integer). Money is never stored as a float. */
  amountCents: number;
  /** ISO 4217 currency code, one of `CURRENCIES`. */
  currency: Currency;
  /** ISO calendar date, `YYYY-MM-DD`. */
  date: string;
  note?: string;
}

/** Raw, untrusted request body for creating an expense. */
export interface NewExpenseInput {
  employee?: unknown;
  category?: unknown;
  amountCents?: unknown;
  currency?: unknown;
  date?: unknown;
  note?: unknown;
}
