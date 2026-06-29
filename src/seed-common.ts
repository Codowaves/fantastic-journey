// O(n^2)
export function commonItems<T>(a:T[],b:T[]):T[]{const out:T[]=[];for(const x of a)for(const y of b)if(x===y&&!out.includes(x))out.push(x);return out;}
