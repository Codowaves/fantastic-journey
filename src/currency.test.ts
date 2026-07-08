import { describe, expect, it } from "vitest";

import { formatEur, formatGbp } from "./currency";

describe("formatEur", () => {
  it("formats whole euros with two decimals", () => {
    expect(formatEur(100)).toBe("€1.00");
  });

  it("formats euros and cents", () => {
    expect(formatEur(1234)).toBe("€12.34");
  });

  it("formats zero as €0.00", () => {
    expect(formatEur(0)).toBe("€0.00");
  });

  it("formats large values", () => {
    expect(formatEur(100000000)).toBe("€1000000.00");
  });

  it("pads single-digit cents with a leading zero", () => {
    expect(formatEur(105)).toBe("€1.05");
  });

  it("formats negative amounts with a leading minus", () => {
    expect(formatEur(-1234)).toBe("€-12.34");
  });

  it("formats single-cent amounts", () => {
    expect(formatEur(1)).toBe("€0.01");
  });

  it("does not throw on common finite inputs", () => {
    expect(() => formatEur(0)).not.toThrow();
    expect(() => formatEur(1)).not.toThrow();
    expect(() => formatEur(-1)).not.toThrow();
    expect(() => formatEur(99)).not.toThrow();
    expect(() => formatEur(100)).not.toThrow();
    expect(() => formatEur(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  describe("error/throw paths", () => {
    it("throws TypeError when cents is NaN", () => {
      expect(() => formatEur(NaN)).toThrow(TypeError);
    });

    it("throws TypeError with the documented message when cents is NaN", () => {
      expect(() => formatEur(NaN)).toThrow("cents must be a finite number");
    });

    it("thrown error has name TypeError when cents is NaN", () => {
      try {
        formatEur(NaN);
        expect.fail("expected formatEur(NaN) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).name).toBe("TypeError");
        expect((err as TypeError).message).toBe(
          "cents must be a finite number",
        );
      }
    });

    it("throws TypeError when cents is null", () => {
      expect(() => formatEur(null as unknown as number)).toThrow(TypeError);
    });

    it("throws TypeError with the documented message when cents is null", () => {
      expect(() => formatEur(null as unknown as number)).toThrow(
        "cents must be a finite number",
      );
    });

    it("thrown error has name TypeError when cents is null", () => {
      try {
        formatEur(null as unknown as number);
        expect.fail("expected formatEur(null) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).name).toBe("TypeError");
        expect((err as TypeError).message).toBe(
          "cents must be a finite number",
        );
      }
    });

    it("throws TypeError when cents is undefined", () => {
      expect(() => formatEur(undefined as unknown as number)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError with the documented message when cents is undefined", () => {
      expect(() => formatEur(undefined as unknown as number)).toThrow(
        "cents must be a finite number",
      );
    });

    it("thrown error has name TypeError when cents is undefined", () => {
      try {
        formatEur(undefined as unknown as number);
        expect.fail("expected formatEur(undefined) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).name).toBe("TypeError");
        expect((err as TypeError).message).toBe(
          "cents must be a finite number",
        );
      }
    });

    it("does not throw when cents is a negative finite number", () => {
      expect(() => formatEur(-1)).not.toThrow();
      expect(() => formatEur(-100)).not.toThrow();
      expect(() => formatEur(-999999)).not.toThrow();
    });

    it("does not throw when cents is negative zero", () => {
      expect(() => formatEur(-0)).not.toThrow();
    });

    it("does not throw when cents is the largest safe integer", () => {
      expect(() => formatEur(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it("does not throw when cents is the smallest safe integer", () => {
      expect(() => formatEur(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });
  });
});

describe("formatGbp", () => {
  it("formats whole pounds with two decimals", () => {
    expect(formatGbp(100)).toBe("£1.00");
  });

  it("formats pounds and pence", () => {
    expect(formatGbp(1234)).toBe("£12.34");
  });

  it("formats zero as £0.00", () => {
    expect(formatGbp(0)).toBe("£0.00");
  });

  it("formats large values", () => {
    expect(formatGbp(100000000)).toBe("£1000000.00");
  });

  it("pads single-digit pence with a leading zero", () => {
    expect(formatGbp(105)).toBe("£1.05");
  });

  it("formats negative amounts with a leading minus", () => {
    expect(formatGbp(-1234)).toBe("£-12.34");
  });

  it("formats single-penny amounts", () => {
    expect(formatGbp(1)).toBe("£0.01");
  });

  it("does not throw on common finite inputs", () => {
    expect(() => formatGbp(0)).not.toThrow();
    expect(() => formatGbp(1)).not.toThrow();
    expect(() => formatGbp(-1)).not.toThrow();
    expect(() => formatGbp(99)).not.toThrow();
    expect(() => formatGbp(100)).not.toThrow();
    expect(() => formatGbp(Number.MAX_SAFE_INTEGER)).not.toThrow();
  });

  describe("error/throw paths", () => {
    it("throws TypeError when cents is NaN", () => {
      expect(() => formatGbp(NaN)).toThrow(TypeError);
    });

    it("throws TypeError with the documented message when cents is NaN", () => {
      expect(() => formatGbp(NaN)).toThrow("cents must be a finite number");
    });

    it("thrown error has name TypeError when cents is NaN", () => {
      try {
        formatGbp(NaN);
        expect.fail("expected formatGbp(NaN) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).name).toBe("TypeError");
        expect((err as TypeError).message).toBe(
          "cents must be a finite number",
        );
      }
    });

    it("throws TypeError when cents is null", () => {
      expect(() => formatGbp(null as unknown as number)).toThrow(TypeError);
    });

    it("throws TypeError with the documented message when cents is null", () => {
      expect(() => formatGbp(null as unknown as number)).toThrow(
        "cents must be a finite number",
      );
    });

    it("thrown error has name TypeError when cents is null", () => {
      try {
        formatGbp(null as unknown as number);
        expect.fail("expected formatGbp(null) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).name).toBe("TypeError");
        expect((err as TypeError).message).toBe(
          "cents must be a finite number",
        );
      }
    });

    it("throws TypeError when cents is undefined", () => {
      expect(() => formatGbp(undefined as unknown as number)).toThrow(
        TypeError,
      );
    });

    it("throws TypeError with the documented message when cents is undefined", () => {
      expect(() => formatGbp(undefined as unknown as number)).toThrow(
        "cents must be a finite number",
      );
    });

    it("thrown error has name TypeError when cents is undefined", () => {
      try {
        formatGbp(undefined as unknown as number);
        expect.fail("expected formatGbp(undefined) to throw");
      } catch (err) {
        expect(err).toBeInstanceOf(TypeError);
        expect((err as TypeError).name).toBe("TypeError");
        expect((err as TypeError).message).toBe(
          "cents must be a finite number",
        );
      }
    });

    it("does not throw when cents is a negative finite number", () => {
      expect(() => formatGbp(-1)).not.toThrow();
      expect(() => formatGbp(-100)).not.toThrow();
      expect(() => formatGbp(-999999)).not.toThrow();
    });

    it("does not throw when cents is negative zero", () => {
      expect(() => formatGbp(-0)).not.toThrow();
    });

    it("does not throw when cents is the largest safe integer", () => {
      expect(() => formatGbp(Number.MAX_SAFE_INTEGER)).not.toThrow();
    });

    it("does not throw when cents is the smallest safe integer", () => {
      expect(() => formatGbp(Number.MIN_SAFE_INTEGER)).not.toThrow();
    });
  });
});
