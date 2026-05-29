import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const readmePath = fileURLToPath(new URL("../README.md", import.meta.url));
const readme = readFileSync(readmePath, "utf8");

// Collapse the README down to its non-blank lines so we can reason about the
// title and the tagline that sits directly beneath it (issue #359).
const contentLines = readme
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line.length > 0);

const titleLine = contentLines[0] ?? "";
const taglineLine = contentLines[1] ?? "";
const tagline = taglineLine.replace(/^>\s*/, "");

describe("README tagline", () => {
  it("opens with a single-level H1 title", () => {
    expect(titleLine).toMatch(/^# \S/);
    expect(titleLine.startsWith("##")).toBe(false);
  });

  it("places a tagline blockquote directly beneath the title", () => {
    expect(taglineLine.startsWith(">")).toBe(true);
    expect(tagline.length).toBeGreaterThan(0);
  });

  it("keeps the tagline to a single short sentence", () => {
    expect(tagline.length).toBeLessThanOrEqual(120);

    // A single sentence has at most one terminal punctuation mark, and never a
    // sentence break (terminator followed by more text) in the middle.
    const terminators = tagline.match(/[.!?]/g) ?? [];
    expect(terminators.length).toBeLessThanOrEqual(1);
    expect(tagline).not.toMatch(/[.!?]\s+\S/);
  });
});
