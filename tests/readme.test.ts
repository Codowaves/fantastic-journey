import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const readme = readFileSync(join(here, "..", "README.md"), "utf8");

// Content lines, paired with their original (1-based) line number, blanks dropped.
const contentLines = readme
  .split("\n")
  .map((text, index) => ({ text: text.trim(), lineNumber: index + 1 }))
  .filter((entry) => entry.text.length > 0);

describe("README tagline", () => {
  it("opens with the main title heading", () => {
    expect(contentLines[0]?.text).toBe("# fantastic-journey");
  });

  it("places a tagline on the content line directly beneath the title", () => {
    const title = contentLines[0];
    const tagline = contentLines[1];

    // The tagline is the very next non-blank line after the title (a single
    // blank line separates them, as Markdown requires). If the tagline were
    // removed, contentLines[1] would be the longer description paragraph and
    // these assertions would fail.
    expect(title?.text).toBe("# fantastic-journey");
    expect(tagline).toBeDefined();
    expect(tagline?.lineNumber).toBe(3);
    expect(tagline?.text.startsWith(">")).toBe(true);
    expect(tagline?.text.startsWith("#")).toBe(false);
  });

  it("keeps the tagline to a single short sentence", () => {
    const taglineText = (contentLines[1]?.text ?? "").replace(/^>\s*/, "");

    expect(taglineText.length).toBeGreaterThan(0);
    expect(taglineText.length).toBeLessThanOrEqual(120);

    // One sentence: at most a single terminal punctuation mark, and no line break
    // (guaranteed by the split above, since this is one line of the file).
    const sentenceEnders = taglineText.match(/[.!?]/g) ?? [];
    expect(sentenceEnders.length).toBeLessThanOrEqual(1);
  });
});
