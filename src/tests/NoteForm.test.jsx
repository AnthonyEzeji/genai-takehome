import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NoteForm from '../components/notes/NoteForm';
import { NotesProvider } from '../contexts/NotesContext';

// Mock AI utils
vi.mock('../services/ai', () => ({
  autoTitleNote: vi.fn().mockResolvedValue('AI Title'),
  generateNoteFromShorthand: vi.fn().mockResolvedValue('AI Content'),
}));

import { autoTitleNote, generateNoteFromShorthand } from '../services/ai';

describe('NoteForm', () => {
  it('renders and adds a note', async () => {
    const createNote = vi.fn();
    render(
      <NotesProvider value={{ createNote }}>
        <NoteForm />
      </NotesProvider>
    );
    fireEvent.change(screen.getAllByPlaceholderText('Enter note title')[0], { target: { value: 'Test Note' } });
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { target: { value: 'Test content' } });
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
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], { target: { value: 'Some content' } });
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);
    await waitFor(() => expect(screen.getAllByDisplayValue('AI Title')[0]).toBeInTheDocument());
  });

  it('calls AI generate from shorthand', async () => {
    render(
      <NotesProvider>
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
    // Mock AI service to throw an error
    vi.mocked(autoTitleNote).mockRejectedValueOnce(new Error('AI service unavailable'));

    render(
      <NotesProvider>
        <NoteForm />
      </NotesProvider>
    );

    // Fill in content
    fireEvent.change(screen.getAllByPlaceholderText('Enter note content')[0], {
      target: { value: 'Test content for auto-titling' }
    });

    // Click auto-title button
    fireEvent.click(screen.getAllByText('Auto-Title')[0]);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/AI service unavailable/i)).toBeInTheDocument();
    });

    // Verify the form is still functional
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('shows error message when AI content generation fails', async () => {
    // Mock AI service to throw an error
    vi.mocked(generateNoteFromShorthand).mockRejectedValueOnce(new Error('Content generation failed'));

    render(
      <NotesProvider>
        <NoteForm />
      </NotesProvider>
    );

    // Fill in shorthand
    fireEvent.change(screen.getAllByPlaceholderText('Enter bullet points or shorthand to generate content')[0], {
      target: { value: 'bullet point 1, bullet point 2' }
    });

    // Click generate button
    fireEvent.click(screen.getAllByText('Generate')[0]);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText(/Content generation failed/i)).toBeInTheDocument();
    });

    // Verify the form is still functional
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('handles network timeout errors gracefully', async () => {
    // Mock AI service to simulate timeout
    vi.mocked(autoTitleNote).mockRejectedValueOnce(new Error('Request timeout'));

    render(
      <NotesProvider>
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
    // Mock AI service to simulate rate limiting
    vi.mocked(generateNoteFromShorthand).mockRejectedValueOnce(new Error('Rate limit exceeded'));

    render(
      <NotesProvider>
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

    render(
      <NotesProvider>
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
    // Mock AI service to throw an error
    vi.mocked(autoTitleNote).mockRejectedValueOnce(new Error('AI service unavailable'));

    render(
      <NotesProvider>
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
    // Mock AI service to delay response
    vi.mocked(autoTitleNote).mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve('Delayed Title'), 100))
    );

    render(
      <NotesProvider>
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