export function flattenDeep<T>(array: unknown[]): T[] {
  if (!Array.isArray(array)) {
    throw new TypeError("flattenDeep expects an array");
  }
  const out: T[] = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      out.push(...flattenDeep<T>(item));
    } else {
      out.push(item as T);
    }
  }
  return out;
}
