// Seed: BUG — uses the F->C formula backwards.
export function toCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}
