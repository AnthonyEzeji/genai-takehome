import React, { useState, useEffect } from 'react';
import { findRelatedNotes } from '../../services/embeddings';

export default function RelatedNotes({ currentNoteId, onNoteSelect }) {
  const [relatedNotes, setRelatedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentNoteId) {
      loadRelatedNotes();
    }
  }, [currentNoteId]);

  async function loadRelatedNotes() {
    setLoading(true);
    setError(null);
    try {
      const notes = await findRelatedNotes(currentNoteId, 3);
      setRelatedNotes(notes);
    } catch (err) {
      setError('Failed to load related notes');
      console.error('Error loading related notes:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!currentNoteId) return null;

  return (
    <section className="related-notes" aria-labelledby="related-notes-title">
      <h3 id="related-notes-title" className="text-lg font-semibold text-gray-800 mb-3">
        Related Notes
      </h3>
      
      {loading && (
        <div className="text-center py-4" role="status" aria-live="polite">
          <div className="loading mx-auto" aria-label="Loading related notes"></div>
          <p className="text-gray-600 mt-2 text-sm">Finding related notes...</p>
        </div>
      )}
      
      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200" role="alert">
          <strong>Error:</strong> {error}
          <button 
            onClick={loadRelatedNotes}
            className="btn btn-secondary ml-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}
      
      {!loading && !error && relatedNotes.length === 0 && (
        <div className="text-gray-500 text-sm p-3 bg-gray-50 rounded">
          No related notes found
        </div>
      )}
      
      {!loading && !error && relatedNotes.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Related notes">
          {relatedNotes.map((note) => (
            <div 
              key={note.id} 
              className="related-note-card"
              role="listitem"
            >
              <button
                onClick={() => onNoteSelect(note)}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label={`View related note: ${note.title}`}
              >
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {note.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {note.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Similarity: {Math.round(note.similarity * 100)}%
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag} 
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
} 