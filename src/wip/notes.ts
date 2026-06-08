export type Note = {
  id: number;
  text: string;
  createdAt: Date;
};

const notes: Note[] = [];
let nextId = 1;

export function addNote(text: string): Note {
  const note: Note = { id: nextId++, text, createdAt: new Date() };
  notes.push(note);
  return note;
}

export function listNotes(): readonly Note[] {
  return notes.slice();
}
