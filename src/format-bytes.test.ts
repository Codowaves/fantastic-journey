import { describe, it, expect } from "vitest";
import { formatBytes } from "./format-bytes";

describe("formatBytes", () => {
  it("formats zero bytes", () => {
    expect(formatBytes(0)).toBe("0 B");
  });

  it("formats sub-KiB values in bytes", () => {
    expect(formatBytes(1)).toBe("1 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("formats KiB values", () => {
    expect(formatBytes(1024)).toBe("1 KiB");
    expect(formatBytes(1536)).toBe("1.5 KiB");
    expect(formatBytes(2048)).toBe("2 KiB");
  });

  it("formats MiB values", () => {
    expect(formatBytes(1024 * 1024)).toBe("1 MiB");
    expect(formatBytes(1.5 * 1024 * 1024)).toBe("1.5 MiB");
    expect(formatBytes(2.25 * 1024 * 1024)).toBe("2.3 MiB");
  });

  it("formats GiB values", () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe("1 GiB");
    expect(formatBytes(1.5 * 1024 * 1024 * 1024)).toBe("1.5 GiB");
  });

  it("formats TiB values", () => {
    expect(formatBytes(1024 * 1024 * 1024 * 1024)).toBe("1 TiB");
    expect(formatBytes(2.5 * 1024 * 1024 * 1024 * 1024)).toBe("2.5 TiB");
  });

  it("trims trailing zeros", () => {
    expect(formatBytes(1024)).toBe("1 KiB");
    expect(formatBytes(2048)).toBe("2 KiB");
    expect(formatBytes(1024 * 1024)).toBe("1 MiB");
  });

  it("respects custom decimals parameter", () => {
    expect(formatBytes(1536, 0)).toBe("2 KiB");
    expect(formatBytes(1536, 2)).toBe("1.5 KiB");
    expect(formatBytes(1234567, 3)).toBe("1.177 MiB");
  });

  it("throws RangeError for negative bytes", () => {
    expect(() => formatBytes(-1)).toThrow(RangeError);
    expect(() => formatBytes(-1)).toThrow("bytes must be non-negative");
  });

  it("throws RangeError for non-finite bytes", () => {
    expect(() => formatBytes(Infinity)).toThrow(RangeError);
    expect(() => formatBytes(-Infinity)).toThrow(RangeError);
    expect(() => formatBytes(NaN)).toThrow(RangeError);
    expect(() => formatBytes(Infinity)).toThrow(
      "bytes must be a finite number",
    );
  });
});
