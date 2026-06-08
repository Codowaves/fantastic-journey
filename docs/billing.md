# Billing Flow

Payments flow through `src/payment.ts` as plain `Money` values
(`{ amount: number, currency: string }`). There is no network call — the
helpers below transform and validate amounts before they reach any
external processor.

## Stages

1. **Pricing** — `applyDiscount(price, percentOff)` reduces a `Money`
   value by a percentage (0–100) and returns a new `Money` in the same
   currency.
2. **Totaling** — `totalWithTax(items, taxRate)` sums an array of
   `Money` items, applies the tax rate, rounds to two decimal places,
   and returns a single `Money` in the first item's currency. An empty
   list returns `{ amount: 0, currency: "USD" }`.
3. **Refund check** — `isRefundEligible(orderDate, returnWindowDays?)`
   returns `true` when the order was placed less than
   `returnWindowDays` days ago (default 30).
4. **Capture** — `processPayment(payment)` validates that `amount` is a
   positive finite number, throwing `RangeError` otherwise, and
   returns the same `Money` value.

## Typical sequence

```ts
const discounted = applyDiscount(price, 10);
const cart       = [discounted, shipping];
const total      = totalWithTax(cart, 0.08);
const charged    = processPayment(total);
```

## Notes

- All money values use `number` — callers handling large totals should
  be aware of floating-point precision limits.
- `totalWithTax` assumes every item shares the first item's currency;
  mixing currencies is not supported.
- `processPayment` is the only stage that throws — pricing, totaling,
  and refund checks are total functions.
