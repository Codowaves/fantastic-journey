/**
 * A note with a unique identifier, text content, and creation timestamp.
 * @example
 * const note: Note = { id: 1, text: 'Buy milk', createdAt: 1700000000000 };
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
 * @example
 * const note = addNote('Buy milk');
 * // note.id === 1
 * // note.text === 'Buy milk'
 * // typeof note.createdAt === 'number'
 */
export function addNote(text: string): Note {
  const note: Note = { id: nextId++, text, createdAt: Date.now() };
  notes.push(note);
  return note;
}

/**
 * Returns a copy of all stored notes.
 * @returns Array of all notes
 * @example
 * addNote('first');
 * addNote('second');
 * const all = listNotes();
 * // all.length === 2
 */
export function listNotes(): Note[] {
  return [...notes];
}

/**
 * Removes all stored notes and resets the ID counter.
 * @example
 * addNote('temporary');
 * clearNotes();
 * listNotes().length === 0;
 * addNote('fresh'); // id starts at 1 again
 */
export function clearNotes(): void {
  notes.length = 0;
  nextId = 1;
}
