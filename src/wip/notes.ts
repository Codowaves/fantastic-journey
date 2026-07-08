/**
 * A note with a unique identifier, text content, and creation timestamp.
 */
export interface Note {
  id: number;
  text: string;
  createdAt: number;
}

const notes: Note[] = [];
let nextId = 1;

/**
 * Creates and stores a new note with the given text.
 * @param text - The content of the note
 * @returns The newly created note with generated ID and timestamp
 *
 * @example
 * const note = addNote("buy milk");
 * // { id: 1, text: "buy milk", createdAt: 1700000000000 }
 */
export function addNote(text: string): Note {
  const note: Note = { id: nextId++, text, createdAt: Date.now() };
  notes.push(note);
  return note;
}

/**
 * Returns a copy of all stored notes.
 * @returns Array of all notes
 *
 * @example
 * addNote("a");
 * addNote("b");
 * listNotes();
 * // [{ id: 1, text: "a", createdAt: ... }, { id: 2, text: "b", createdAt: ... }]
 */
export function listNotes(): Note[] {
  return [...notes];
}

/**
 * Removes all stored notes and resets the ID counter.
 *
 * @example
 * addNote("a");
 * clearNotes();
 * listNotes();
 * // []
 * addNote("b");
 * // id is 1 again, not 2 — the counter was reset
 */
export function clearNotes(): void {
  notes.length = 0;
  nextId = 1;
}
