import{describe,it,expect}from"vitest";import{commonItems}from"./seed-common";describe("commonItems",()=>{it("intersect",()=>expect(commonItems([1,2,3],[2,3,4])).toEqual([2,3]));});
