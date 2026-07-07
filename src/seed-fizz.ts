/**
 * Returns the FizzBuzz representation of `n`: "FizzBuzz" for multiples of 15,
 * "Fizz" for multiples of 3, "Buzz" for multiples of 5, otherwise the number as a string.
 */
export function fizzbuzz(n: number) {
  if (n % 15 === 0) return "FizzBuzz";
  if (n % 3 === 0) return "Fizz";
  if (n % 5 === 0) return "Buzz";
  return String(n);
}
