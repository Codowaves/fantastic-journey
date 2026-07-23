export interface Expense {
  id: string;
  employee: string;
  category: string;
  /** Amount in whole cents (integer). Money is never stored as a float. */
  amountCents: number;
  /** ISO 4217 currency code. The seed only ever stores USD. */
  currency: string;
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
