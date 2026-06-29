// BUG: integer division-ish + no empty guard
export function average(ns:number[]){let t=0;for(const n of ns)t+=n;return t/ns.length;}
