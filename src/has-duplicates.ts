// Seed file for the Codowave performance scenario.
// Correct but O(n^2): the nested loop rescans the array for every element.
export function hasDuplicates<T>(arr: readonly T[]): boolean {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}
