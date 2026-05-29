# README Tagline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a single one-sentence tagline directly beneath the `# fantastic-journey` title in `README.md`, guarded by a vitest test.

**Architecture:** Insert an italic one-line tagline between the H1 and the existing description paragraph. A new `tests/readme.test.ts` reads `README.md` and asserts the tagline's position (line 3), single-line italic format, mention of "Codowave", and single-sentence length — structural assertions, so the prose can be reworded without breaking the test.

**Tech Stack:** Markdown (`README.md`), TypeScript, vitest (`vitest run`), Node `node:fs`/`node:url`/`node:path`.

---

## Context the engineer needs

- **Current README top (exact, lines 1–4):**
  ```
  # fantastic-journey

  A test repository for [Codowave](https://codowave.com) — the autonomous
  software-development agent. This repo intentionally contains code with
  ```
  The tagline goes on a new line between the H1 (line 1) and the description paragraph.

- **Test discovery:** `vitest.config.ts` has `include: ["src/**/*.test.ts", "tests/**/*.test.ts"]`. `tsconfig.json` has `include: ["src/**/*", "tests/**/*"]`. So `tests/readme.test.ts` is auto-discovered by vitest AND typechecked by `tsc --noEmit`. The `tests/` directory does not exist yet — creating the file creates the directory.

- **Why `tests/` and not `src/`:** existing tests are co-located next to their source module (`src/email.test.ts`, `src/logger.test.ts`). A README test has no source module, so it belongs in the already-whitelisted `tests/` directory, not in `src/`.

- **Strict TS gotcha:** `tsconfig.json` sets `"noUncheckedIndexedAccess": true`, so `lines[2]` has type `string | undefined`. Every indexed access in the test MUST be guarded with `?? ""`, or `tsc --noEmit` fails.

- **ESLint:** `.eslintrc.cjs` is permissive (no import-ordering rule; `no-unused-vars` is only a `warning`). `eslint . --ext .ts,.tsx` lints `tests/` too. The test file must have no unused imports to keep output clean, but a warning would not fail CI.

- **CI gate (do not break):** `.github/workflows/ci.yml` job `test` runs typecheck → lint → test via `bun run`. Job `required-check` `needs: [test]` — this is the exact job name Codowave's `ciPoller` polls. All three commands must pass.

- **Chosen tagline text (exact):**
  ```
  _A deliberately flawed sandbox repo that gives Codowave's autonomous agents real signal to act on._
  ```
  One sentence, wrapped in `_underscores_` for Markdown italic, mentions "Codowave".

---

### Task 1: Add the README tagline (TDD)

**Files:**
- Create: `tests/readme.test.ts`
- Modify: `README.md:1-3` (insert tagline after the H1)

- [ ] **Step 1: Write the failing test**

Create `tests/readme.test.ts` with exactly this content:

```ts
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const readme = readFileSync(resolve(here, "..", "README.md"), "utf8");
const lines = readme.split("\n");

describe("README tagline", () => {
  it("keeps the main title as the first line", () => {
    expect(lines[0]).toBe("# fantastic-journey");
  });

  it("places a one-line italic tagline directly beneath the title", () => {
    // line 0: title, line 1: blank, line 2: tagline
    expect(lines[1]).toBe("");
    const tagline = lines[2] ?? "";
    expect(tagline).toMatch(/^_.+_$/); // single line wrapped in italic markers
    expect(tagline).toContain("Codowave");
  });

  it("keeps the tagline to a single sentence", () => {
    const text = (lines[2] ?? "").replace(/^_+|_+$/g, "").trim();
    expect(text).toMatch(/[.!?]$/); // ends with terminal punctuation
    const internalBreaks = text.slice(0, -1).match(/[.!?]\s/g) ?? [];
    expect(internalBreaks.length).toBe(0); // no second sentence
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test tests/readme.test.ts`
Expected: the "one-line italic tagline" and "single sentence" tests FAIL — `lines[2]` is currently the start of the description paragraph (`"A test repository for [Codowave](https://codowave.com) — the autonomous"`), which is not wrapped in `_..._` and is not a complete single sentence. (The "main title as the first line" test passes.)

- [ ] **Step 3: Add the tagline to the README**

In `README.md`, replace this exact block:

```
# fantastic-journey

A test repository for [Codowave](https://codowave.com) — the autonomous
```

with:

```
# fantastic-journey

_A deliberately flawed sandbox repo that gives Codowave's autonomous agents real signal to act on._

A test repository for [Codowave](https://codowave.com) — the autonomous
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test tests/readme.test.ts`
Expected: PASS — all 3 assertions green.

- [ ] **Step 5: Commit**

```bash
git add tests/readme.test.ts README.md
git commit -m "docs(#359): add one-line tagline under README title"
```

---

### Task 2: Verify full CI parity (typecheck + lint + test)

**Files:** none (verification only)

This mirrors exactly what the `test` CI job runs, so green here means green in CI.

- [ ] **Step 1: Typecheck**

Run: `bun run typecheck`
Expected: PASS, no output (exit 0). Confirms `tests/readme.test.ts` satisfies strict mode, including `noUncheckedIndexedAccess`.

- [ ] **Step 2: Lint**

Run: `bun run lint`
Expected: exit 0, no errors. (Warnings, if any, do not fail CI.)

- [ ] **Step 3: Full test suite**

Run: `bun run test`
Expected: PASS — the new `tests/readme.test.ts` plus all existing `src/**/*.test.ts` suites pass.

- [ ] **Step 4: Confirm the rendered result**

Run: `git show HEAD:README.md` and confirm lines 1–3 read:
```
# fantastic-journey

_A deliberately flawed sandbox repo that gives Codowave's autonomous agents real signal to act on._
```
Expected: tagline sits on its own line immediately under the title, separated by one blank line, with the original description paragraph following after a blank line.

---

## Self-Review

**Spec coverage** (issue #359: "Add a single short tagline line directly beneath the main title/heading in README.md. Keep it to one sentence."):
- "single short tagline line" → Task 1 Step 3 inserts one italic line. ✓
- "directly beneath the main title/heading" → inserted immediately after `# fantastic-journey` (asserted: `lines[2]` is the tagline, `lines[1]` is blank). ✓
- "Keep it to one sentence" → Task 1 Step 1 "single sentence" assertion enforces it. ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases"/"similar to" — all code and commands are literal. ✓

**Type consistency:** Test references only `lines`, `here`, `readme` (all defined in the file) and standard Node/vitest APIs. Every `lines[n]` access uses `?? ""` for `noUncheckedIndexedAccess`. ✓

**CI safety:** Task 2 runs the exact typecheck/lint/test trio the `test` job runs, which gates the `required-check` job Codowave polls. ✓
