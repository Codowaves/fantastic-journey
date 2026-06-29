export interface Line{price:number;qty:number;}
export function subtotal(ls:Line[]){return ls.reduce((s,l)=>s+l.price*l.qty,0);}
export function applyCoupon(total:number,pct:number){return Math.max(0,total-(total*pct)/100);}
