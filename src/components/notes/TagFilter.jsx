import React, { useMemo } from 'react';
import { useNotes } from '../../contexts/NotesContext';

export default function TagFilter({ selectedTag, setSelectedTag }) {
  const { notes } = useNotes();

  // Collect all unique tags
  const tags = useMemo(() => {
    const tagSet = new Set();
    notes.forEach(note => {
      (note.tags || []).forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [notes]);

  // Filter notes by selected tag
  const filteredNotes = selectedTag
    ? notes.filter(note => (note.tags || []).includes(selectedTag))
    : notes;

  return (
    <section className="tag-filter" aria-label="Filter notes by tag">
      <h2 className="sr-only">Filter notes</h2>
      <div className="tag-filter-buttons" role="tablist" aria-label="Tag filter options">
        <button
          className={`tag-filter-btn ${!selectedTag ? 'active' : ''}`}
          onClick={() => setSelectedTag(null)}
          role="tab"
          aria-selected={!selectedTag}
          aria-controls="notes-list"
        >
          All ({notes.length})
        </button>
        {tags.map(tag => {
          const tagCount = notes.filter(note => (note.tags || []).includes(tag)).length;
          return (
            <button
              key={tag}
              className={`tag-filter-btn ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
              role="tab"
              aria-selected={selectedTag === tag}
              aria-controls="notes-list"
            >
              {tag} ({tagCount})
            </button>
          );
        })}
      </div>
      {selectedTag && (
        <div className="text-sm text-gray-600 mb-2" role="status" aria-live="polite">
          Showing {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''} with tag "{selectedTag}"
        </div>
      )}
    </section>
  );
} 