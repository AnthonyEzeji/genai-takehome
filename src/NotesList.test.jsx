import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotesList from './NotesList';
import { NotesContext } from './NotesContext';

vi.mock('./ai', () => ({
  summarizeNote: vi.fn().mockResolvedValue('AI Summary'),
}));

const notes = [
  { id: '1', title: 'Note 1', content: 'Content 1', tags: ['tag1'] },
  { id: '2', title: 'Note 2', content: 'Content 2', tags: ['tag2'] },
];

function MockNotesProvider({ children }) {
  return (
    <NotesContext.Provider value={{ notes, loading: false, error: null, deleteNote: vi.fn() }}>
      {children}
    </NotesContext.Provider>
  );
}

describe('NotesList', () => {
  it('renders notes', () => {
    render(<NotesList />, { wrapper: MockNotesProvider });
    expect(screen.getByText('Note 1')).toBeInTheDocument();
    expect(screen.getByText('Note 2')).toBeInTheDocument();
  });

  it('filters notes by tag', () => {
    const filteredNotes = [
      { id: '1', title: 'Note 1', content: 'Content 1', tags: ['tag1'] },
    ];
    function FilteredProvider({ children }) {
      return (
        <NotesContext.Provider value={{ notes: filteredNotes, loading: false, error: null, deleteNote: vi.fn() }}>
          {children}
        </NotesContext.Provider>
      );
    }
    render(<NotesList selectedTag="tag1" />, { wrapper: FilteredProvider });
    const noteTitles = screen.getAllByText('Note 1');
    expect(noteTitles.length).toBeGreaterThan(0);
    noteTitles.forEach(node => expect(node).toBeInTheDocument());
  });

  it('calls AI summarize', async () => {
    render(<NotesList />, { wrapper: MockNotesProvider });
    fireEvent.click(screen.getAllByText('Summarize')[0]);
    await waitFor(() => expect(screen.getByText('Summary:')).toBeInTheDocument());
    expect(screen.getByText('AI Summary')).toBeInTheDocument();
  });
}); 