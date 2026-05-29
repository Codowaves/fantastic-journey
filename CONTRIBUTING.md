# Contributing

Thanks for contributing to **fantastic-journey**! This guide covers how to set
up the project locally and run the test suite.

## Prerequisites

- [Node.js](https://nodejs.org) 20 or newer (CI runs on Node 20).
- [pnpm](https://pnpm.io) — the project is managed with pnpm and ships a
  `pnpm-lock.yaml`. The easiest way to get it is via Corepack:

  ```sh
  corepack enable
  ```

## Install dependencies

```sh
pnpm install
```

## Run the test suite

Tests run on [Vitest](https://vitest.dev).

```sh
pnpm test
```

To re-run tests automatically as you edit files, use watch mode:

```sh
pnpm test:watch
```

## Other checks

Before opening a pull request, make sure the same checks CI runs pass locally:

```sh
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint . --ext .ts,.tsx
pnpm test        # vitest run --passWithNoTests
```

CI runs typecheck, lint, and test on every pull request, so green locally means
green in CI.
