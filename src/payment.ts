// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * A monetary amount denominated in a specific ISO 4217 currency code.
 */
export interface Money {
  /** Numeric amount in the smallest practical unit implied by `currency` (e.g. dollars for "USD"). */
  amount: number;
  /** ISO 4217 currency code, e.g. "USD", "EUR". */
  currency: string;
}

/**
 * Returns a new `Money` with `amount` reduced by `percentOff` and rounded to two decimal places.
 *
 * @param price - The original price to discount.
 * @param percentOff - Discount percentage in the inclusive range [0, 100].
 * @returns A `Money` with the discounted amount and the same currency.
 * @throws {RangeError} If `percentOff` is outside [0, 100].
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
 * Sums the given items and adds tax, rounding the result to two decimal places.
 *
 * @param items - Line items to total; all must share the same currency. Empty arrays return `{ amount: 0, currency: "USD" }`.
 * @param taxRate - Tax rate as a decimal fraction (e.g. 0.07 for 7%).
 * @returns A `Money` representing the tax-inclusive total in the items' currency.
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
 * Checks whether an order placed on `orderDate` is still within the return window.
 *
 * @param orderDate - The date the order was placed.
 * @param returnWindowDays - Length of the return window in days. Defaults to 30.
 * @returns `true` if the order is still within the return window, `false` otherwise.
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}

/**
 * Validates a payment amount and returns it unchanged.
 *
 * @param payment - The payment to validate.
 * @returns The input `Money` if it passes validation.
 * @throws {RangeError} If `payment.amount` is not a positive finite number.
 */
export function processPayment(payment: Money): Money {
  if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
    throw new RangeError("Payment amount must be a positive finite number");
  }
  return payment;
}
