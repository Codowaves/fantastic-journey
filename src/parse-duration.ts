/**
 * Parses a human-readable duration string (e.g. `"1h30m"`, `"2.5d"`) into a
 * total count of milliseconds. Supports units `ms`, `s`, `m`, `h`, `d` in any
 * order, with each unit allowed at most once. Throws `TypeError` on empty
 * input, unknown units, repeated units, or trailing garbage.
 *
 * @param input - Duration string made of one or more `<value><unit>` segments
 *   (e.g. `"1h 30m"`, `"1.5s"`).
 * @returns The total duration in milliseconds.
 */
export function parseDuration(input: string): number {
  if (typeof input !== "string") {
    throw new TypeError("input must be a string");
  }
  if (input.trim() === "") {
    throw new TypeError("Duration string cannot be empty");
  }

  const unitMultipliers: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const segmentRegex = /(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)/g;
  const usedUnits = new Set<string>();
  let totalMs = 0;
  let lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = segmentRegex.exec(input)) !== null) {
    const valueStr = match[1];
    const unit = match[2];

    if (!valueStr || !unit) {
      continue;
    }

    if (usedUnits.has(unit)) {
      throw new TypeError(`Unit "${unit}" appears more than once`);
    }

    const multiplier = unitMultipliers[unit];
    if (multiplier === undefined) {
      continue;
    }

    const value = parseFloat(valueStr);
    usedUnits.add(unit);
    totalMs += value * multiplier;
    lastIndex = segmentRegex.lastIndex;
  }

  if (usedUnits.size === 0) {
    throw new TypeError("Invalid duration format: no valid units found");
  }

  const remainder = input.slice(lastIndex).trim();
  if (remainder.length > 0) {
    throw new TypeError(
      `Invalid duration format: trailing garbage "${remainder}"`,
    );
  }

  return totalMs;
}
