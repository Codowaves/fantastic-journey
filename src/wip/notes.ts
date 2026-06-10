/** A single note stored in the in-memory notes list. */
export interface Note {
  /** Monotonically increasing identifier assigned at creation time. */
  id: number;
  /** The note's text content. */
  text: string;
  /** Unix epoch milliseconds when the note was created. */
  createdAt: number;
}

const notes: Note[] = [];
let nextId = 1;

/** Creates a new note with the given text and appends it to the in-memory store.
 * @param text - The note's text content.
 * @returns The newly created note, including its assigned id and creation timestamp. */
export function addNote(text: string): Note {
  const note: Note = { id: nextId++, text, createdAt: Date.now() };
  notes.push(note);
  return note;
}

/** Returns a shallow copy of all notes currently stored, in insertion order. */
export function listNotes(): Note[] {
  return [...notes];
}

/** Empties the notes store and resets id generation back to 1. */
export function clearNotes(): void {
  notes.length = 0;
  nextId = 1;
}
