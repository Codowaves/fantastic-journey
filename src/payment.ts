// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary value with an amount and currency code.
 */
export interface Money {
  /** The numeric amount in the smallest currency unit (e.g., cents for USD). */
  amount: number;
  /** ISO 4217 currency code (e.g., "USD", "EUR"). */
  currency: string;
}

/**
 * Applies a percentage discount to a price.
 * @param price The original price to discount.
 * @param percentOff Discount percentage (0-100).
 * @returns The discounted price with the same currency.
 * @throws {RangeError} If percentOff is not between 0 and 100.
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
 * Calculates the total of multiple items with tax applied.
 * @param items Array of items to sum (assumes all items share the same currency as the first item).
 * @param taxRate Tax rate as a decimal (e.g., 0.08 for 8% tax).
 * @returns The total amount including tax; defaults to USD with 0 amount if items array is empty.
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
 * Checks if an order is eligible for refund based on the order date and return window.
 * @param orderDate The date when the order was placed.
 * @param returnWindowDays Number of days from order date within which refunds are accepted (default: 30).
 * @returns True if the order is still within the return window, false otherwise.
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
 * Validates and processes a payment.
 * @param payment The payment to process.
 * @returns The validated payment.
 * @throws {RangeError} If the payment amount is not a positive finite number.
 */
export function processPayment(payment: Money): Money {
  if (!Number.isFinite(payment.amount) || payment.amount <= 0) {
    throw new RangeError("Payment amount must be a positive finite number");
  }
  return payment;
}
