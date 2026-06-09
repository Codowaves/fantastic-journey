/**
 * Returns the input string with its first character upper-cased and the rest
 * left unchanged. An empty string is returned as-is.
 */
export function capitalize(text: string): string {
  if (text.length === 0) return text;
  return text[0]!.toUpperCase() + text.slice(1);
}
