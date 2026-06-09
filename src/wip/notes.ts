/**
 * A single note entry stored in the in-memory notes list.
 */
export interface Note {
  id: number;
  text: string;
  createdAt: number;
}

const notes: Note[] = [];
let nextId = 1;

/**
 * Appends a new note to the in-memory list with an auto-incremented id and
 * a creation timestamp.
 * @param text The note's content.
 * @returns The created note.
 */
export function addNote(text: string): Note {
  const note: Note = { id: nextId++, text, createdAt: Date.now() };
  notes.push(note);
  return note;
}

/**
 * Returns a shallow copy of the current notes in insertion order.
 * @returns A new array containing the stored notes.
 */
export function listNotes(): Note[] {
  return [...notes];
}

/**
 * Empties the notes list and resets the id counter back to 1.
 */
export function clearNotes(): void {
  notes.length = 0;
  nextId = 1;
}
