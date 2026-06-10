// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary amount in a specific currency. `amount` is stored as a
 * plain number (not BigInt) and is expected to be rounded to 2 decimal places
 * by callers; `currency` is an opaque string — no normalization or validation
 * is performed here.
 */
export interface Money {
  amount: number;
  currency: string;
}

/**
 * Returns a new `Money` with `price.amount` reduced by `percentOff` (a value
 * between 0 and 100, inclusive). The result is rounded to 2 decimal places
 * and preserves `price.currency`. Throws `RangeError` if `percentOff` is
 * outside the 0–100 range.
 */
export function applyDiscount(price: Money, percentOff: number): Money {
  if (percentOff < 0 || percentOff > 100) {
    throw new RangeError("percentOff must be 0–100");
  }
  return {
    amount: Math.round(price.amount * (100 - percentOff)) / 100,
    currency: price.currency,
  };
}

/**
 * Sums `items` and adds a proportional `taxRate` (e.g. 0.08 for 8%). The
 * returned `Money` uses the currency of the first item, and the total is
 * rounded to 2 decimal places. Returns a zeroed `USD` amount when `items` is
 * empty.
 */
export function totalWithTax(items: Money[], taxRate: number): Money {
  if (!items.length) {
    return { amount: 0, currency: "USD" };
  }
  const currency = items[0]!.currency;
  const subtotal = items.reduce((sum, m) => sum + m.amount, 0);
  return {
    amount: Math.round(subtotal * (1 + taxRate) * 100) / 100,
    currency,
  };
}

/**
 * Returns whether a purchase made on `orderDate` can still be refunded, given
 * a `returnWindowDays` window (default 30 days) measured from the current
 * time.
 */
export function isRefundEligible(
  orderDate: Date,
  returnWindowDays = 30,
): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}

/**
 * Validates `payment` and returns it unchanged. Throws `RangeError` when
 * `payment.amount` is not a positive finite number (rejects zero, negative,
 * `NaN`, and `Infinity`).
 */
export function processPayment(payment: Money): Money {
  if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
    throw new RangeError("Payment amount must be a positive finite number");
  }
  return payment;
}
