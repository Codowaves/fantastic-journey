/**
 * Computes the arithmetic mean of the given numbers.
 * @param ns - The numbers to average. An empty array returns 0.
 * @returns The arithmetic mean, or 0 if `ns` is empty.
 */
export function average(ns: number[]) {
  if (ns.length === 0) return 0;
  let t = 0;
  for (const n of ns) t += n;
  return t / ns.length;
}
