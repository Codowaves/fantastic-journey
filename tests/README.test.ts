import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const readmePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "README.md",
);

describe("README", () => {
  it("has the sync TODO comment as the very first line", () => {
    const firstLine = readFileSync(readmePath, "utf8").split("\n")[0];

    expect(firstLine).toBe(
      "<!-- TODO: keep this README in sync with features -->",
    );
  });
});
