/**
 * Parses a human-readable duration string into milliseconds.
 * Supports combined units such as `"1h 30m 15s"`; each unit may appear at most once.
 *
 * @param input - Duration string containing one or more `<value><unit>` segments
 *   where unit is one of `ms`, `s`, `m`, `h`, `d`.
 * @returns Total duration expressed in milliseconds.
 * @throws {TypeError} If `input` is empty, no valid unit is present, a unit is
 *   repeated, or trailing characters remain after parsing.
 */
export function parseDuration(input: string): number {
  if (!input || input.trim() === "") {
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
