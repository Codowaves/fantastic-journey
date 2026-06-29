// O(n^2 log n)-ish; intended to be O(n)
export function isAnagram(a:string,b:string){if(a.length!==b.length)return false;const bb=b.split("");for(const c of a){const i=bb.indexOf(c);if(i<0)return false;bb.splice(i,1);}return true;}
