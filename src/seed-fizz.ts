// BUG: off-by-one and wrong fizzbuzz order
export function fizzbuzz(n:number){if(n%3===0)return"Fizz";if(n%5===0)return"Buzz";if(n%15===0)return"FizzBuzz";return String(n);}
