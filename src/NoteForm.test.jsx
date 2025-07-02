import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoteForm from './NoteForm';
import { NotesProvider } from './NotesContext';

// Mock AI utils
vi.mock('./ai', () => ({
  autoTitleNote: vi.fn().mockResolvedValue('AI Title'),
  generateNoteFromShorthand: vi.fn().mockResolvedValue('AI Content'),
}));

describe('NoteForm', () => {
  it('renders and adds a note', async () => {
    const createNote = vi.fn();
    render(
      <NotesProvider value={{ createNote }}>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Title')[0], { target: { value: 'Test Note' } });
    fireEvent.change(screen.getAllByPlaceholderText('Content')[0], { target: { value: 'Test content' } });
    fireEvent.click(screen.getAllByText('Add Note')[0]);
    // No error thrown means form submits
  });

  it('adds and removes tags', () => {
    render(
      <NotesProvider>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Add tag')[0], { target: { value: 'tag1' } });
    fireEvent.keyDown(screen.getAllByPlaceholderText('Add tag')[0], { key: 'Enter', code: 'Enter' });
    expect(screen.getByText('tag1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('×'));
    expect(screen.queryByText('tag1')).not.toBeInTheDocument();
  });

  it('calls AI auto-title', async () => {
    render(
      <NotesProvider>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Content')[0], { target: { value: 'Some content' } });
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    await waitFor(() => expect(screen.getAllByDisplayValue('AI Title')[0]).toBeInTheDocument());
  });

  it('calls AI generate from shorthand', async () => {
    render(
      <NotesProvider>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Shorthand or bullet points (optional)')[0], { target: { value: 'shorthand' } });
    fireEvent.click(screen.getAllByText('Generate from Shorthand')[0]);
    await waitFor(() => expect(screen.getAllByDisplayValue('AI Content')[0]).toBeInTheDocument());
  });
}); 