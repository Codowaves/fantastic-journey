import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const editorconfigPath = resolve(process.cwd(), ".editorconfig");

function readEditorconfig(): string {
  return readFileSync(editorconfigPath, "utf8");
}

describe(".editorconfig", () => {
  it("exists at the repository root", () => {
    expect(existsSync(editorconfigPath)).toBe(true);
  });

  it("declares the file as the root config so parent lookups stop here", () => {
    expect(readEditorconfig()).toMatch(/^root\s*=\s*true\s*$/m);
  });

  it("applies every formatting rule to all files via a [*] section", () => {
    const contents = readEditorconfig();
    const wildcard = contents.indexOf("[*]");
    expect(wildcard).toBeGreaterThanOrEqual(0);

    const section = contents.slice(wildcard);
    expect(section).toMatch(/^indent_style\s*=\s*space\s*$/m);
    expect(section).toMatch(/^indent_size\s*=\s*2\s*$/m);
    expect(section).toMatch(/^end_of_line\s*=\s*lf\s*$/m);
    expect(section).toMatch(/^trim_trailing_whitespace\s*=\s*true\s*$/m);
    expect(section).toMatch(/^insert_final_newline\s*=\s*true\s*$/m);
  });

  it("practises what it preaches: LF endings and a single final newline", () => {
    const contents = readEditorconfig();
    expect(contents).not.toContain("\r");
    expect(contents.endsWith("\n")).toBe(true);
    expect(contents.endsWith("\n\n")).toBe(false);
  });
});
