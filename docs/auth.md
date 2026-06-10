# Auth rate limiting

Auth endpoints are throttled per caller to prevent brute-force attacks
against magic-link tokens, passwords, and SAML assertions. The limiter
lives in `src/rateLimit.ts` and is wired into every auth route in
`src/api/v1.ts`.

## Routes

| Route                          | Keyed by                                         | Default limit | Env var                  |
| ------------------------------ | ------------------------------------------------ | ------------- | ------------------------ |
| `POST /auth/password`          | `(ip, workspaceId, userId)`                      | 10 rpm        | `AUTH_PASSWORD_RPM`      |
| `POST /auth/magic-link`        | `(ip, workspaceId)`                              | 10 rpm        | `MAGIC_LINK_REQUEST_RPM` |
| `GET /auth/magic-link/verify`  | `(ip)`                                           | 20 rpm        | `MAGIC_LINK_VERIFY_RPM`  |
| `POST /auth/saml`              | `(ip, workspaceId)`                              | 10 rpm        | `AUTH_SAML_RPM`          |

Limits are requests-per-minute and refill continuously (token-bucket).
Each route has its own independent bucket scoped by the identity tuple
shown above, so a noisy IP on workspace `ws_A` does not affect traffic
to `ws_B`, and a noisy user does not affect other users in the same
workspace.

## 429 response

When a caller exceeds the limit, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: <seconds>
Content-Type: application/json

{
  "error": "Too many requests",
  "retryAfterSeconds": <seconds>
}
```

`Retry-After` and `retryAfterSeconds` reflect the same value — the
estimated wall-clock seconds until at least one token is available
again. Clients should honor the header and back off.

## Audit log

Every throttled request is recorded as an `auth_event` with
`kind: "rate_limited"` and a `reason` matching the route (e.g.
`"auth_password"`). These events are visible via
`GET /api/auth-events` alongside other auth attempts, so operators can
spot brute-force patterns.

## Tuning

Override any default at process start by exporting the matching env
var, e.g. `AUTH_PASSWORD_RPM=5`. Invalid or non-positive values fall
back to the built-in default so a typo can never disable throttling.
