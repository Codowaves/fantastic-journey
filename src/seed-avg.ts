export function average(ns: number[]) {
  if (ns.length === 0) return 0;
  let t = 0;
  for (const n of ns) t += n;
  return t / ns.length;
}
