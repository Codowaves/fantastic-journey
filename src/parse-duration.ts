import { err, ok, type Result } from "./result";

const unitMultipliers: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

/**
 * Parses a duration string (e.g. `"1h30m"`, `"2d 3h 15m"`) into a number of
 * milliseconds without throwing.
 *
 * @param input - The duration text to parse.
 * @returns A `Result` carrying the total duration in milliseconds on success,
 *   or an `Err` describing the parse failure (empty input, no valid units,
 *   repeated units, or trailing garbage).
 */
export function parseDuration(input: string): Result<number, Error> {
  if (!input || input.trim() === "") {
    return err(new TypeError("Duration string cannot be empty"));
  }

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
      return err(new TypeError(`Unit "${unit}" appears more than once`));
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
    return err(new TypeError("Invalid duration format: no valid units found"));
  }

  const remainder = input.slice(lastIndex).trim();
  if (remainder.length > 0) {
    return err(
      new TypeError(`Invalid duration format: trailing garbage "${remainder}"`),
    );
  }

  return ok(totalMs);
}
