import { afterEach, describe, expect, it } from "vitest";

import { addNote, clearNotes, listNotes } from "./notes";

describe("notes", () => {
  afterEach(() => {
    clearNotes();
  });

  it("starts with an empty list", () => {
    expect(listNotes()).toEqual([]);
  });

  it("adds a note and returns it with id and timestamp", () => {
    const note = addNote("first");
    expect(note.text).toBe("first");
    expect(note.id).toBe(1);
    expect(typeof note.createdAt).toBe("number");

    const all = listNotes();
    expect(all).toHaveLength(1);
    expect(all[0]).toBe(note);
  });

  it("returns a copy from listNotes that does not mutate the store", () => {
    addNote("a");
    const snapshot = listNotes();
    snapshot.pop();
    expect(listNotes()).toHaveLength(1);
  });

  it("clearNotes resets the store", () => {
    addNote("x");
    addNote("y");
    clearNotes();
    expect(listNotes()).toEqual([]);
    expect(addNote("after").id).toBe(1);
  });
});
