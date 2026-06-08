import { describe, expect, it } from "vitest";

import { addNote, listNotes } from "./notes";

describe("wip notes", () => {
  it("adds a note and returns it with a numeric id and timestamp", () => {
    const before = new Date();
    const note = addNote("first");
    const after = new Date();

    expect(note.text).toBe("first");
    expect(typeof note.id).toBe("number");
    expect(note.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(note.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("lists previously added notes including the newest entry", () => {
    addNote("second");
    const texts = listNotes().map((n) => n.text);

    expect(texts).toContain("second");
  });

  it("returns a fresh snapshot from listNotes, not the internal array", () => {
    addNote("snapshot-test");
    const snapshot = listNotes();
    const secondSnapshot = listNotes();

    expect(snapshot).not.toBe(secondSnapshot);
    expect(snapshot).toEqual(secondSnapshot);
  });
});
