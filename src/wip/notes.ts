export interface Note {
  id: number;
  text: string;
  createdAt: number;
}

const notes: Note[] = [];
let nextId = 1;

export function addNote(text: string): Note {
  const note: Note = { id: nextId++, text, createdAt: Date.now() };
  notes.push(note);
  return note;
}

export function listNotes(): Note[] {
  return [...notes];
}

export function clearNotes(): void {
  notes.length = 0;
  nextId = 1;
}
