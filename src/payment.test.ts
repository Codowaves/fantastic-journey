import { describe, it, expect } from "vitest";
import { validateAmount } from "./payment";

describe("validateAmount", () => {
  it.each([
    { label: "valid amount (positive finite)", value: 10.5 },
    { label: "valid amount (1)", value: 1 },
    { label: "valid amount (very small positive)", value: 0.01 },
  ])("does not throw for $label", ({ value }) => {
    expect(() => validateAmount(value)).not.toThrow();
  });

  it.each([
    { label: "zero", value: 0 },
    { label: "negative", value: -5 },
    { label: "NaN", value: NaN },
    { label: "Infinity", value: Infinity },
    { label: "-Infinity", value: -Infinity },
  ])("throws for $label", ({ value }) => {
    expect(() => validateAmount(value)).toThrow(
      "amount must be a positive, finite number",
    );
  });
});
