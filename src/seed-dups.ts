// O(n^2)
export function firstDup<T>(a:T[]):T|undefined{for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(a[i]===a[j])return a[i];return undefined;}
