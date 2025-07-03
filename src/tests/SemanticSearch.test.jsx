import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import SemanticSearch from '../components/notes/SemanticSearch';

// Mock the embeddings service
vi.mock('../services/embeddings', () => ({
  searchNotesBySimilarity: vi.fn(),
}));

import { searchNotesBySimilarity } from '../services/embeddings';

describe('SemanticSearch Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders input and search button', () => {
    render(<SemanticSearch onNoteSelect={() => {}} />);
    expect(screen.getByPlaceholderText(/search notes by meaning/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('shows loading and then results on successful search', async () => {
    searchNotesBySimilarity.mockResolvedValue([
      { id: '1', title: 'Test Note', content: 'Test content', similarity: 0.95, tags: ['tag1'] },
    ]);
    render(<SemanticSearch onNoteSelect={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/search notes by meaning/i), { target: { value: 'test' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    expect(screen.getByLabelText(/searching/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/found 1 related note/i)).toBeInTheDocument();
      expect(screen.getByText(/test note/i)).toBeInTheDocument();
    });
  });

  it('shows error and retry button on search failure', async () => {
    searchNotesBySimilarity.mockRejectedValue(new Error('OpenAI error'));
    render(<SemanticSearch onNoteSelect={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/search notes by meaning/i), { target: { value: 'fail' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to perform semantic search/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('shows empty state if no results', async () => {
    searchNotesBySimilarity.mockResolvedValue([]);
    render(<SemanticSearch onNoteSelect={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/search notes by meaning/i), { target: { value: 'empty' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/no notes found matching your search/i)).toBeInTheDocument();
    });
  });

  it('clears search and error state when clear is clicked', async () => {
    searchNotesBySimilarity.mockRejectedValue(new Error('OpenAI error'));
    render(<SemanticSearch onNoteSelect={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText(/search notes by meaning/i), { target: { value: 'fail' } });
    fireEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to perform semantic search/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /clear search/i }));
    expect(screen.queryByText(/failed to perform semantic search/i)).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search notes by meaning/i)).toHaveValue('');
  });
}); 