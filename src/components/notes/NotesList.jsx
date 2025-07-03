import React, { useState } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { summarizeNote } from '../../services/ai';

export default function NotesList({ selectedTag, onEdit, highlightedNoteId }) {
  const { notes, loading, error, deleteNote } = useNotes();
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [retryCount, setRetryCount] = useState({});
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  const filteredNotes = selectedTag
    ? notes.filter(note => (note.tags || []).includes(selectedTag))
    : notes;

  async function handleSummarize(note, retryAttempt = 0) {
    setLoadingSummary(note.id);
    setSummaryError(null);
    try {
      const summary = await summarizeNote(note.content);
      setSummaries(s => ({ ...s, [note.id]: summary }));
      setRetryCount(prev => ({ ...prev, [note.id]: 0 }));
    } catch (err) {
      setSummaryError('AI error: ' + err.message);
      if (retryAttempt < 2) {
        setTimeout(() => {
          handleSummarize(note, retryAttempt + 1);
        }, 1000 * (retryAttempt + 1));
      }
    } finally {
      setLoadingSummary(null);
    }
  }

  async function handleDelete(noteId) {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(noteId);
        if (expandedNoteId === noteId) setExpandedNoteId(null);
      } catch (err) {
        console.error('Failed to delete note:', err);
        alert('Failed to delete note. Please try again.');
      }
    }
  }

  if (loading) return (
    <div className="text-center py-8" role="status" aria-live="polite">
      <div className="loading mx-auto" aria-label="Loading notes"></div>
      <p className="text-gray-600 mt-2">Loading notes...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-red-600 p-4 bg-red-50 rounded border border-red-200" role="alert">
      <strong>Error loading notes:</strong> {error}
      <button 
        onClick={() => window.location.reload()} 
        className="btn btn-secondary ml-2"
      >
        Retry
      </button>
    </div>
  );
  
  if (!filteredNotes.length) return (
    <div className="text-center py-8 text-gray-500" role="status">
      <div className="text-4xl mb-2" aria-hidden="true">📝</div>
      <p>No notes yet.</p>
      <p className="text-sm">Create your first note above!</p>
    </div>
  );

  return (
    <section className="space-y-4 mt-4" aria-label="Notes list">
      <h2 className="sr-only">Notes</h2>
      {filteredNotes.map((note, index) => {
        const isExpanded = expandedNoteId === note.id;
        return (
          <article 
            key={note.id} 
            id={`note-${note.id}`}
            className={`note-card fade-in-up${highlightedNoteId === note.id ? ' highlighted' : ''}`}
            style={{ animationDelay: `${index * 0.1}s` }}
            aria-labelledby={`note-title-${note.id}`}
          >
            <button
              className="w-full text-left focus:outline-none"
              onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
              aria-expanded={isExpanded}
              aria-controls={`note-details-${note.id}`}
              tabIndex={0}
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              <h3 id={`note-title-${note.id}`} className="note-title">{note.title}</h3>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2" role="list" aria-label="Note tags">
                  {note.tags.map(tag => (
                    <span key={tag} className="tag" role="listitem">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
            {isExpanded && (
              <div id={`note-details-${note.id}`} className="mt-3">
                <div className="note-content mb-2">{note.content}</div>
                <div className="note-actions">
                  <button
                    className="edit-btn"
                    onClick={() => onEdit && onEdit(note)}
                    aria-label={`Edit note: ${note.title}`}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(note.id)}
                    aria-label={`Delete note: ${note.title}`}
                  >
                    Delete
                  </button>
                  <button
                    className="summarize-btn"
                    onClick={() => handleSummarize(note)}
                    disabled={loadingSummary === note.id}
                    aria-label={`Summarize note: ${note.title}`}
                  >
                    {loadingSummary === note.id ? 'Summarizing...' : 'Summarize'}
                  </button>
                </div>
                {summaryError && loadingSummary === note.id && (
                  <div className="text-red-600 text-xs mt-1 p-2 bg-red-50 rounded border border-red-200" role="alert">
                    <strong>AI Error:</strong> {summaryError}
                    {(retryCount[note.id] || 0) < 2 && (
                      <button 
                        onClick={() => {
                          setRetryCount(prev => ({ ...prev, [note.id]: (prev[note.id] || 0) + 1 }));
                          handleSummarize(note);
                        }}
                        className="btn btn-secondary ml-2 text-xs"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                )}
                {summaries[note.id] && (
                  <div className="summary-box" role="complementary" aria-label="Note summary">
                    <strong>Summary:</strong> {summaries[note.id]}
                  </div>
                )}
              </div>
            )}
          </article>
        );
      })}
    </section>
  );
} 