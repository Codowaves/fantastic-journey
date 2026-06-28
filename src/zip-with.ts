export function zipWith<A, B, R>(a: A[], b: B[], fn: (a: A, b: B) => R): R[] {
  const length = Math.min(a.length, b.length);
  const result: R[] = [];

  for (let i = 0; i < length; i++) {
    result.push(fn(a[i]!, b[i]!));
  }

  return result;
}
