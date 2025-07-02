import React, { useMemo } from 'react';
import { useNotes } from './NotesContext';

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
    <div className="my-4">
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          className={`px-2 py-1 rounded text-xs ${!selectedTag ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setSelectedTag(null)}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag}
            className={`px-2 py-1 rounded text-xs ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>
      {/* Optionally, render filtered notes here or pass selectedTag to NotesList */}
    </div>
  );
} 