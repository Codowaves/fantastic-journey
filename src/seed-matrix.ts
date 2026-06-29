export function transpose<T>(m:T[][]):T[][]{return m[0]?m[0].map((_,c)=>m.map(r=>r[c])):[];}
export function identity(n:number):number[][]{return Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0));}
