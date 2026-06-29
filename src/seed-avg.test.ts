import{describe,it,expect}from"vitest";import{average}from"./seed-avg";describe("average",()=>{it("avg",()=>expect(average([2,4,6])).toBe(4));it("empty->0",()=>expect(average([])).toBe(0));});
