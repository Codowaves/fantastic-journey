export function formatEur(cents: number): string {
  return "€" + (cents / 100).toFixed(2);
}

export function formatGbp(cents: number): string {
  return "£" + (cents / 100).toFixed(2);
}
