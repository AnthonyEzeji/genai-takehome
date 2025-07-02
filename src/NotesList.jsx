import React from 'react';
import { useNotes } from './NotesContext';

export default function NotesList({ selectedTag, onEdit }) {
  const { notes, loading, error, deleteNote } = useNotes();

  const filteredNotes = selectedTag
    ? notes.filter(note => (note.tags || []).includes(selectedTag))
    : notes;

  if (loading) return <div className="p-4">Loading notes...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!filteredNotes.length) return <div className="p-4">No notes yet.</div>;

  return (
    <div className="space-y-4 mt-4">
      {filteredNotes.map(note => (
        <div key={note.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
          <div className="font-bold text-lg">{note.title}</div>
          <div className="text-gray-700 whitespace-pre-line">{note.content}</div>
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {note.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">{tag}</span>
              ))}
            </div>
          )}
          <div className="flex gap-2 self-end mt-2">
            <button
              className="text-xs text-blue-500 hover:underline"
              onClick={() => onEdit && onEdit(note)}
            >
              Edit
            </button>
            <button
              className="text-xs text-red-500 hover:underline"
              onClick={() => deleteNote(note.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 