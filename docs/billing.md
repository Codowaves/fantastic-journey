# BillingClient

`BillingClient` wraps Stripe subscription operations through our internal billing proxy, keeping Stripe credentials and webhook-specific behavior out of application callers. Use it to read the customer's current plan, move a customer to a paid or higher-tier plan, and cancel an active subscription while letting the proxy enforce our Stripe account configuration and audit trail.

## `getCurrentPlan`

```ts
getCurrentPlan(request: {
  customerId: string;
}): Promise<{
  customerId: string;
  planId: string;
  status: "trialing" | "active" | "past_due" | "canceled";
  trialEndsAt?: string;
  currentPeriodEndsAt?: string;
  cancelAtPeriodEnd: boolean;
}>;
```

### Request

- `customerId`: Internal customer identifier mapped to the Stripe customer by the billing proxy.

### Response

- `customerId`: The customer whose plan was loaded.
- `planId`: The active plan identifier returned by the proxy.
- `status`: Current subscription state.
- `trialEndsAt`: ISO timestamp for the trial end, when the customer is still trialing.
- `currentPeriodEndsAt`: ISO timestamp for the end of the current billing period, when available.
- `cancelAtPeriodEnd`: Whether cancellation has already been scheduled for the period end.

### Example

```ts
const plan = await billingClient.getCurrentPlan({
  customerId: "cus_123",
});

if (plan.status === "trialing") {
  console.log(`Trial ends at ${plan.trialEndsAt}`);
}
```

## `upgradePlan`

```ts
upgradePlan(request: {
  customerId: string;
  planId: string;
  effectiveAt?: "now" | "period_end";
  idempotencyKey?: string;
}): Promise<{
  customerId: string;
  previousPlanId: string;
  planId: string;
  status: "trialing" | "active" | "past_due";
  effectiveAt: string;
  currentPeriodEndsAt?: string;
}>;
```

### Request

- `customerId`: Internal customer identifier mapped to the Stripe customer by the billing proxy.
- `planId`: Target plan identifier.
- `effectiveAt`: Optional timing for the change. Use `now` for immediate upgrades and `period_end` for scheduled changes.
- `idempotencyKey`: Optional caller-generated key for retry-safe upgrade requests.

### Response

- `customerId`: The customer whose plan was changed.
- `previousPlanId`: Plan identifier before the upgrade request.
- `planId`: New or scheduled target plan identifier.
- `status`: Subscription state after the proxy processes the request.
- `effectiveAt`: ISO timestamp for when the plan change takes effect.
- `currentPeriodEndsAt`: ISO timestamp for the end of the active billing period, when available.

### Example

```ts
const upgraded = await billingClient.upgradePlan({
  customerId: "cus_123",
  planId: "pro",
  effectiveAt: "now",
  idempotencyKey: "upgrade-cus_123-pro-2026-05-27",
});

console.log(`Customer moved from ${upgraded.previousPlanId} to ${upgraded.planId}`);
```

## `cancelPlan`

```ts
cancelPlan(request: {
  customerId: string;
  cancelAtPeriodEnd?: boolean;
  reason?: string;
}): Promise<{
  customerId: string;
  planId: string;
  status: "active" | "canceled";
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  currentPeriodEndsAt?: string;
}>;
```

### Request

- `customerId`: Internal customer identifier mapped to the Stripe customer by the billing proxy.
- `cancelAtPeriodEnd`: Optional cancellation timing. Set `true` to keep access until the paid period ends, or `false` to cancel immediately.
- `reason`: Optional cancellation reason passed to the billing proxy for audit and support workflows.

### Response

- `customerId`: The customer whose plan was canceled or scheduled for cancellation.
- `planId`: Plan identifier being canceled.
- `status`: `canceled` for immediate cancellation, or `active` when cancellation is scheduled at period end.
- `cancelAtPeriodEnd`: Whether the cancellation is scheduled for the period end.
- `canceledAt`: ISO timestamp for immediate cancellation, when applicable.
- `currentPeriodEndsAt`: ISO timestamp for the end of the active billing period, when applicable.

### Example

```ts
const cancellation = await billingClient.cancelPlan({
  customerId: "cus_123",
  cancelAtPeriodEnd: true,
  reason: "customer_requested",
});

if (cancellation.cancelAtPeriodEnd) {
  console.log(`Access remains until ${cancellation.currentPeriodEndsAt}`);
}
```

## Common Pitfalls

- Trial to paid transitions: upgrades during a trial can either end the trial immediately or schedule paid access for the trial end, depending on `effectiveAt`. Be explicit so the proxy applies the intended Stripe behavior.
- Downgrades: `upgradePlan` is intended for moving to a higher paid tier. Use the downgrade flow exposed by the billing proxy instead of forcing a lower `planId` through this helper.
- Missing webhook secrets: local and deployed environments must configure the Stripe webhook secret used by the internal proxy. Without it, subscription state changes may succeed in Stripe but fail to reconcile back into the application.
