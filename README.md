# team-expenses — Codowave benchmark arena

> ⚠️ **This repository is a disposable benchmark arena. Do not depend on it.**
> Its `main` branch is force-reset to the `bench-baseline-v1` tag on every
> benchmark run, and any issues/PRs it holds are opened and closed by the
> harness. If you want the source of truth for Codowave, this is not it.

This is a tiny but real **team-expenses** REST service. It exists so Codowave's
agent-quality benchmark (`eval/bench/` in the [codowave](https://github.com/CodowaveAI)
repo) has a realistic project to file issues against and measure how well the
agent resolves them.

## The app

A small Express + TypeScript (strict) service with an in-memory store:

| Path                   | What it does                       |
| ---------------------- | ---------------------------------- |
| `GET /health`          | Liveness check                     |
| `GET /expenses`        | List all expenses                  |
| `POST /expenses`       | Create an expense (validated)      |
| `GET /expenses/:id`    | Fetch one expense (404 if unknown) |
| `DELETE /expenses/:id` | Delete one expense                 |

Money is stored as integer cents. Pure logic lives in `src/lib/` (`money`,
`validation`, `dates`, `ids`); the store is `src/store.ts`; the HTTP layer is
`src/app.ts`.

## Develop

```sh
npm ci
npm run format:check   # prettier
npm run lint           # eslint
npm run typecheck      # tsc --noEmit (strict)
npm test               # vitest
npm start              # boot the server on :3000
```

CI (`.github/workflows/ci.yml`) runs install → format → lint → typecheck → test
on Node 22, and is green on the baseline. The whole run finishes in ~1–2 min.

## Note for benchmark maintainers

The baseline intentionally ships with a handful of subtle, latent defects that
the benchmark's Tier-1/Tier-4 tasks ask the agent to fix. They are covered by
**hidden** acceptance tests kept outside this repo, so the seed suite here is
green even though those defects are present. See `eval/bench/README.md`.
