import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
afterEach(cleanup);
import NoteForm from '../components/notes/NoteForm';
import { NotesProvider } from '../contexts/NotesContext';

// Mock AI services
vi.mock('../services/ai', () => ({
  autoTitleNote: vi.fn().mockRejectedValue(new Error('AI error')),
  generateNoteFromShorthand: vi.fn().mockRejectedValue(new Error('AI error'))
}));

import { autoTitleNote, generateNoteFromShorthand } from '../services/ai';

describe('NoteForm', () => {
  it('renders and adds a note', async () => {
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Enter note title')[0], { target: { value: 'Test Note' } });
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { target: { value: 'Test content' } });
    fireEvent.click(screen.getAllByText('Add Note')[0]);
    // No error thrown means form submits
  });

  it('adds and removes tags', () => {
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
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
    vi.mocked(autoTitleNote).mockResolvedValueOnce('AI Title');
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { target: { value: 'Some content' } });
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    await waitFor(() => expect(screen.getAllByDisplayValue('AI Title')[0]).toBeInTheDocument());
  });

  it('calls AI generate from shorthand', async () => {
    vi.mocked(generateNoteFromShorthand).mockResolvedValueOnce('AI Content');
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Enter bullet points or shorthand to generate content')[0], { target: { value: 'shorthand' } });
    fireEvent.click(screen.getAllByText('Generate')[0]);
    await waitFor(() => expect(screen.getAllByDisplayValue('AI Content')[0]).toBeInTheDocument());
  });
});

describe('AI Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error message when AI auto-title fails', async () => {
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Add content to enable auto-title
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Test content' }
    });
    // Trigger auto-title
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.queryAllByText((content, node) => node.textContent.includes('AI error')).length).toBeGreaterThan(0);
    });
  });

  it('shows error message when AI generation fails', async () => {
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Add shorthand content
    fireEvent.change(screen.getAllByPlaceholderText('Enter bullet points or shorthand to generate content')[0], {
      target: { value: 'test shorthand' }
    });
    // Trigger generation
    fireEvent.click(screen.getAllByText('Generate')[0]);
    // Wait for error to appear
    await waitFor(() => {
      expect(screen.queryAllByText((content, node) => node.textContent.includes('AI error')).length).toBeGreaterThan(0);
    });
  });

  it('handles network timeout errors gracefully', async () => {
    vi.mocked(autoTitleNote).mockRejectedValueOnce(new Error('Request timeout'));
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill in content
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Test content' }
    });
    // Click auto-title button
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    // Wait for timeout error
    await waitFor(() => {
      expect(screen.getByText(/Request timeout/i)).toBeInTheDocument();
    });
  });

  it('handles API rate limiting errors', async () => {
    vi.mocked(generateNoteFromShorthand).mockRejectedValueOnce(new Error('Rate limit exceeded'));
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill in shorthand
    fireEvent.change(screen.getAllByPlaceholderText('Enter bullet points or shorthand to generate content')[0], {
      target: { value: 'test shorthand' }
    });
    // Click generate button
    fireEvent.click(screen.getAllByText('Generate')[0]);
    // Wait for rate limit error
    await waitFor(() => {
      expect(screen.getByText(/Rate limit exceeded/i)).toBeInTheDocument();
    });
  });

  it('allows retry after AI error', async () => {
    // First call fails
    vi.mocked(autoTitleNote).mockRejectedValueOnce(new Error('AI service unavailable'));
    // Second call succeeds
    vi.mocked(autoTitleNote).mockResolvedValueOnce('Successful Title');
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill in content
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Test content' }
    });
    // Click auto-title button (fails)
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/AI service unavailable/i)).toBeInTheDocument();
    });
    // Click auto-title button again (succeeds)
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    // Wait for success
    await waitFor(() => {
      expect(screen.getByDisplayValue('Successful Title')).toBeInTheDocument();
    });
  });

  it('clears error state when user starts typing', async () => {
    vi.mocked(autoTitleNote).mockRejectedValueOnce(new Error('AI service unavailable'));
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill in content and trigger error
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Test content' }
    });
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/AI service unavailable/i)).toBeInTheDocument();
    });
    // Start typing again
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Updated test content' }
    });
    // Error should be cleared
    await waitFor(() => {
      expect(screen.queryByText(/AI service unavailable/i)).not.toBeInTheDocument();
    });
  });

  it('shows loading state during AI operations', async () => {
    vi.mocked(autoTitleNote).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve('Delayed Title'), 100))
    );
    const createNote = vi.fn();
    const updateNote = vi.fn();
    render(
      <NotesProvider value={{ createNote, updateNote }}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill in content
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Test content' }
    });
    // Click auto-title button
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    // Should show loading state
    expect(screen.getByText(/Generating/i)).toBeInTheDocument();
    // Wait for completion
    await waitFor(() => {
      expect(screen.getByDisplayValue('Delayed Title')).toBeInTheDocument();
    });
  });
}); 

describe('NoteForm Tag Validation', () => {
  const mockNotesContext = {
    createNote: vi.fn(),
    updateNote: vi.fn(),
  };

  it('should disable submit button when no tags', () => {
    render(
      <NotesProvider value={mockNotesContext}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill required fields but leave tags empty
    fireEvent.change(screen.getAllByPlaceholderText('Enter note title')[0], { 
      target: { value: 'Test Title' } 
    });
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { 
      target: { value: 'Test Content' } 
    });
    expect(screen.getAllByText('Add Note')[0]).toBeDisabled();
    expect(screen.getByText('At least one tag is required')).toBeInTheDocument();
  });

  it('should enable submit button when tags are added', () => {
    render(
      <NotesProvider value={mockNotesContext}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill all required fields including tags
    fireEvent.change(screen.getAllByPlaceholderText('Enter note title')[0], { 
      target: { value: 'Test Title' } 
    });
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { 
      target: { value: 'Test Content' } 
    });
    // Add a tag
    fireEvent.change(screen.getAllByPlaceholderText('Add tag')[0], { 
      target: { value: 'test-tag' } 
    });
    fireEvent.keyDown(screen.getAllByPlaceholderText('Add tag')[0], { 
      key: 'Enter', code: 'Enter' 
    });
    expect(screen.getAllByText('Add Note')[0]).toBeEnabled();
    expect(screen.queryByText('At least one tag is required')).toBeNull();
  });

  it('should show tag validation message when trying to submit without tags', () => {
    render(
      <NotesProvider value={mockNotesContext}>
        <NoteForm />
      </NotesProvider>
    );
    // Fill only title and content
    fireEvent.change(screen.getAllByPlaceholderText('Enter note title')[0], { 
      target: { value: 'Test Title' } 
    });
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { 
      target: { value: 'Test Content' } 
    });
    // Try to submit
    fireEvent.click(screen.getAllByText('Add Note')[0]);
    expect(screen.getByText('At least one tag is required')).toBeInTheDocument();
  });
}); 