/**
 * Parses `input` as a boolean without throwing.
 *
 * Accepts common truthy / falsy string spellings (case-insensitive, trimmed):
 * - truthy: `"true"`, `"1"`, `"yes"`, `"on"`
 * - falsy:  `"false"`, `"0"`, `"no"`, `"off"`
 *
 * For any input that is not a string (including `null` and `undefined`) or
 * that does not match one of the recognized spellings, returns `false`
 * rather than throwing. This makes `parseBool` safe to use on untrusted or
 * loosely-typed input (e.g. headers, query strings, env values).
 *
 * @param input - The value to parse.
 * @returns `true` when `input` is a recognized truthy string, otherwise
 *   `false`.
 */
export function parseBool(input: unknown): boolean {
  if (typeof input !== "string") {
    return false;
  }
  const normalized = input.trim().toLowerCase();
  switch (normalized) {
    case "true":
    case "1":
    case "yes":
    case "on":
      return true;
    case "false":
    case "0":
    case "no":
    case "off":
    case "":
      return false;
    default:
      return false;
  }
}
