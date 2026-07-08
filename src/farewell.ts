/**
 * Returns a friendly farewell greeting for the given name.
 *
 * @param name - The name to bid farewell to.
 * @returns A farewell string in the form `"Goodbye, {name}!"`.
 * @throws {TypeError} If `name` is null, undefined, or NaN.
 *
 * @example
 * farewell("Alice");
 * //=> "Goodbye, Alice!"
 */
export function farewell(name: string): string {
  if (name === null || name === undefined) {
    throw new TypeError("name must be a string");
  }
  if (typeof name === "number" && Number.isNaN(name)) {
    throw new TypeError("name must be a string");
  }
  return `Goodbye, ${name}!`;
}
