// Seed: BUG — counts empty string as 1 and double spaces as extra words.
export function wordCount(s: string): number {
  return s.split(" ").length;
}
