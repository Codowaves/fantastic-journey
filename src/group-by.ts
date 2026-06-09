/**
 * Groups array items by the key returned from `keyFn`, preserving insertion
 * order within each group and across groups.
 *
 * @example
 * groupBy(
 *   [
 *     { type: 'fruit', name: 'apple' },
 *     { type: 'veg', name: 'carrot' },
 *     { type: 'fruit', name: 'pear' },
 *   ],
 *   (item) => item.type,
 * );
 * // => { fruit: [{type:'fruit',name:'apple'}, {type:'fruit',name:'pear'}], veg: [{type:'veg',name:'carrot'}] }
 */
export function groupBy<T, K extends string | number>(
  arr: T[],
  keyFn: (item: T) => K,
): Record<K, T[]> {
  const result = {} as Record<K, T[]>;
  for (const item of arr) {
    const key = keyFn(item);
    if (result[key] === undefined) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
}
