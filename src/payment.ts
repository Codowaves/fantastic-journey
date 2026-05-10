// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary value with amount and currency.
 */
export interface Money {
  /** The numeric amount in the currency's base unit */
  amount: number;
  /** The ISO 4217 currency code (e.g., "USD", "EUR") */
  currency: string;
}

/**
 * Applies a percentage discount to a price.
 *
 * @param price - The original price to discount
 * @param percentOff - The discount percentage (0-100)
 * @returns A new Money object with the discounted amount
 * @throws {RangeError} If percentOff is not between 0 and 100
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
 * Calculates the total price including tax for a list of items.
 * Uses the currency from the first item; assumes all items share the same currency.
 *
 * @param items - Array of Money objects to sum
 * @param taxRate - The tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns A new Money object with the taxed total, or zero USD if items is empty
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
 * Checks if an order is still within the refund eligibility window.
 *
 * @param orderDate - The date when the order was placed
 * @param returnWindowDays - The number of days after order date during which refunds are allowed (default: 30)
 * @returns True if the order is still within the return window, false otherwise
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
