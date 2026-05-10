// Test-coverage scanner bait — non-trivial logic with NO `payment.test.ts`
// next to it. The scanner files an issue per uncovered file.

/**
 * Represents a monetary value with amount and currency.
 */
export interface Money {
  /** The numeric amount of money */
  amount: number;
  /** The currency code (e.g., "USD", "EUR") */
  currency: string;
}

/**
 * Applies a percentage discount to a price.
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
 * Calculates the total price of items including tax.
 * @param items - Array of Money items to sum
 * @param taxRate - Tax rate as a decimal (e.g., 0.08 for 8%)
 * @returns A Money object with the subtotal plus tax, using the first item's currency
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
 * Checks if an order is eligible for refund based on the order date.
 * @param orderDate - The date when the order was placed
 * @param returnWindowDays - Number of days within which a refund is allowed (default: 30)
 * @returns True if the order is within the return window, false otherwise
 */
export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
