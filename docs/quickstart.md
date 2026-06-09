# Quickstart

Get up and running with fantastic-journey in three steps.

## Quickstart

```sh
git clone <repo-url> fantastic-journey
cd fantastic-journey
bun install
bun run typecheck
bun run lint
bun run test
```

`bun install` resolves all dev dependencies (TypeScript, ESLint, Vitest). The
three follow-up commands mirror what CI runs on every PR — typecheck, lint,
and the test suite — so a green run locally means a green PR.
