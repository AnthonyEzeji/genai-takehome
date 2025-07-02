import React, { useState } from 'react';
import { useNotes } from './NotesContext';
import { summarizeNote } from './ai';

export default function NotesList({ selectedTag, onEdit }) {
  const { notes, loading, error, deleteNote } = useNotes();
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);

  const filteredNotes = selectedTag
    ? notes.filter(note => (note.tags || []).includes(selectedTag))
    : notes;

  async function handleSummarize(note) {
    setLoadingSummary(note.id);
    setSummaryError(null);
    try {
      const summary = await summarizeNote(note.content);
      setSummaries(s => ({ ...s, [note.id]: summary }));
    } catch (err) {
      setSummaryError('AI error: ' + err.message);
    } finally {
      setLoadingSummary(null);
    }
  }

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
            <button
              className="text-xs text-green-600 hover:underline"
              onClick={() => handleSummarize(note)}
              disabled={loadingSummary === note.id}
            >
              {loadingSummary === note.id ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>
          {summaryError && loadingSummary === note.id && (
            <div className="text-red-600 text-xs mt-1">{summaryError}</div>
          )}
          {summaries[note.id] && (
            <div className="bg-gray-50 border-l-4 border-green-400 p-2 mt-2 text-sm text-gray-800">
              <strong>Summary:</strong> {summaries[note.id]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 