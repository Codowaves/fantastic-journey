# fantastic-journey

A test repository for [Codowave](https://codowave.com) — the autonomous
software-development agent. This repo intentionally contains code with
known issues across several categories (security, missing tests,
undocumented APIs, TODO debt) so the various Codowave scanners and the
pair pipeline have realistic signal to act on.

## Structure

| Path | What's there | Which scanner / stage exercises it |
|------|--------------|-------------------------------------|
| `src/payment.ts` | Money utilities, no tests | Test-coverage scanner |
| `src/email.ts` | Email helpers, no tests | Test-coverage scanner |
| `src/api/v1.ts` | Public Order API, no JSDoc | Documenter scanner |
| `src/legacy/old-hash.ts` | md5 + hardcoded key + timing-unsafe compare | Security scanner |
| `src/wip/notes.ts` | TODO / FIXME / HACK / console.log / debugger | Bug-scan |
| Whole repo + this README | LLM-readable orientation | Feature suggestor |
| `.github/workflows/ci.yml` | Typecheck + lint + test | PR processor, ciPoller, ciWorker |

## Running locally

```sh
bun install
bun run typecheck
bun run lint
bun run test
```

CI runs the same three on every PR.

## Codowave triggers

The autonomous runner watches for issues carrying the
`codowave:ready` label and queues them for the pair pipeline
(worker → reviewer → tester → documenter → auditor). The
`scenario/*` labels pick which subsystem each issue is meant to
exercise — see the seed script in the dashboard's setup kit for
the full taxonomy.

## License

MIT — see `LICENSE`.
