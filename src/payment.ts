// Re-export money utilities from src/money/ for backward compatibility
export { type Money, applyDiscount, totalWithTax } from "./money/index.js";

export function isRefundEligible(orderDate: Date, returnWindowDays = 30): boolean {
  const now = Date.now();
  const orderMs = orderDate.getTime();
  return now - orderMs < returnWindowDays * 24 * 60 * 60 * 1000;
}
