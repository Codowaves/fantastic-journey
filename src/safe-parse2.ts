import { err, ok, type Result } from "./result";

/**
 * Parses `input` as an integer without throwing.
 *
 * Uses `Number.parseInt` with radix 10 and returns an `Err` when the parsed
 * prefix is not a valid integer (including for the empty string or inputs
 * whose leading characters are not digits).
 *
 * @param input - The string to parse.
 * @returns An `Ok` carrying the parsed integer, or an `Err` describing the
 *   parse failure.
 */
export function safeInt(input: string): Result<number, Error> {
  if (typeof input !== "string") {
    return err(
      new Error(`Invalid integer: expected string, got ${typeof input}`),
    );
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return err(new Error(`Invalid integer: empty string`));
  }
  const parsed = Number.parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) {
    return err(new Error(`Invalid integer: ${input}`));
  }
  if (String(parsed) !== trimmed) {
    return err(new Error(`Invalid integer: trailing garbage in "${input}"`));
  }
  return ok(parsed);
}

/**
 * Parses `input` as a floating-point number without throwing.
 *
 * Uses `Number.parseFloat` and returns an `Err` when the result is `NaN`
 * (which `parseFloat` returns for the empty string or inputs that do not
 * begin with a numeric prefix).
 *
 * @param input - The string to parse.
 * @returns An `Ok` carrying the parsed number, or an `Err` describing the
 *   parse failure.
 */
export function safeFloat(input: string): Result<number, Error> {
  if (typeof input !== "string") {
    return err(
      new Error(`Invalid float: expected string, got ${typeof input}`),
    );
  }
  const trimmed = input.trim();
  if (trimmed === "") {
    return err(new Error(`Invalid float: empty string`));
  }
  const parsed = Number.parseFloat(trimmed);
  if (Number.isNaN(parsed)) {
    return err(new Error(`Invalid float: ${input}`));
  }
  if (String(parsed) !== trimmed) {
    return err(new Error(`Invalid float: trailing garbage in "${input}"`));
  }
  return ok(parsed);
}

/**
 * Parses `input` as JSON without throwing.
 *
 * Delegates to `JSON.parse` inside a `try`/`catch` so malformed input
 * surfaces as an `Err` carrying the original `Error` rather than throwing.
 *
 * @typeParam T - The expected shape of the parsed value. Defaults to
 *   `unknown` so callers must narrow before use.
 * @param input - The JSON text to parse.
 * @returns An `Ok` carrying the parsed value, or an `Err` carrying the
 *   parse error.
 */
export function safeJson<T = unknown>(input: string): Result<T, Error> {
  try {
    return ok(JSON.parse(input) as T);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
