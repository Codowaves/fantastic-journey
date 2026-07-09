/**
 * Returns a friendly farewell greeting for the given name.
 *
 * @example
 * farewell("Alice");
 * //=> "Goodbye, Alice!"
 */
export function farewell(name: string): string {
  if (name == null || Number.isNaN(name)) {
    return "Goodbye, friend!";
  }
  return `Goodbye, ${name}!`;
}
