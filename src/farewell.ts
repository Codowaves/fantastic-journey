/**
 * Returns a friendly farewell greeting for the given name.
 *
 * @example
 * farewell("Alice");
 * //=> "Goodbye, Alice!"
 */
export function farewell(name: string): string {
  if (name == null) {
    return "Goodbye!";
  }
  if (typeof name === "number" && Number.isNaN(name)) {
    return "Goodbye!";
  }
  return `Goodbye, ${name}!`;
}
