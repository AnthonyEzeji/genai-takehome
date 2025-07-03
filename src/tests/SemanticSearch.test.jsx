import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { NotesProvider } from '../contexts/NotesContext';
import SemanticSearch from '../components/notes/SemanticSearch';

// Mock the embeddings service
vi.mock('../services/embeddings', () => ({
  searchNotesBySimilarity: vi.fn(),
}));

import { searchNotesBySimilarity } from '../services/embeddings';

// Mock Supabase to prevent actual database calls
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ 
        order: () => ({ 
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Welcome to GenAI Notes!',
              content: 'This is a demo note. You can edit or delete it, or create your own.',
              tags: ['demo', 'welcome'],
              created_at: new Date().toISOString(),
            }
          ], 
          error: null 
        }) 
      }),
      insert: () => ({ select: () => ({ data: [{}], error: null }) }),
      update: () => ({ eq: () => ({ select: () => ({ data: [{}], error: null }) }) }),
      delete: () => ({ eq: () => ({ error: null }) })
    })
  }
}));

// Helper function to render SemanticSearch with proper context
function renderSemanticSearch(props = {}) {
  const defaultProps = {
    onNoteSelect: vi.fn(),
    ...props
  };
  
  return render(
    <NotesProvider>
      <SemanticSearch {...defaultProps} />
    </NotesProvider>
  );
}

describe('SemanticSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Basic Rendering', () => {
    it('renders search input and button', () => {
      renderSemanticSearch();
      
      expect(screen.getByPlaceholderText('Search notes by meaning...')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
    });

    it('disables search button when input is empty', () => {
      renderSemanticSearch();
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeDisabled();
    });

    it('enables search button when input has content', () => {
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      expect(searchButton).not.toBeDisabled();
    });
  });

  describe('Search Functionality', () => {
    it('performs search and shows results', async () => {
      const mockResults = [
        { 
          id: '1', 
          title: 'Test Note', 
          content: 'Test content', 
          similarity: 0.95, 
          tags: ['test'] 
        }
      ];
      
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce(mockResults);
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      // Check loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      
      // Wait for results
      await waitFor(() => {
        expect(screen.getByText('Found 1 related note')).toBeInTheDocument();
        expect(screen.getByText('Test Note')).toBeInTheDocument();
      });
      
      expect(searchNotesBySimilarity).toHaveBeenCalledWith('test query', 5);
    });

    it('shows no results message when search returns empty', async () => {
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce([]);
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'empty query' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('No notes found matching your search')).toBeInTheDocument();
      });
    });

    it('calls onNoteSelect when a result is clicked', async () => {
      const mockResults = [
        { 
          id: '1', 
          title: 'Test Note', 
          content: 'Test content', 
          similarity: 0.95, 
          tags: ['test'] 
        }
      ];
      
      const onNoteSelect = vi.fn();
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce(mockResults);
      
      renderSemanticSearch({ onNoteSelect });
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Test Note')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Test Note'));
      expect(onNoteSelect).toHaveBeenCalledWith(mockResults[0]);
    });
  });

  describe('Error Handling', () => {
    it('shows error message when search fails', async () => {
      vi.mocked(searchNotesBySimilarity).mockRejectedValueOnce(new Error('Search failed'));
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Failed to perform semantic search')).toBeInTheDocument();
        expect(screen.getByText('Retry')).toBeInTheDocument();
      });
    });

    it('allows retry after search failure', async () => {
      // First search fails
      vi.mocked(searchNotesBySimilarity).mockRejectedValueOnce(new Error('Search failed'));
      // Second search succeeds
      const mockResults = [
        { id: '1', title: 'Test Note', content: 'Test content', similarity: 0.95, tags: ['test'] }
      ];
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce(mockResults);
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      // Wait for error
      await waitFor(() => {
        expect(screen.getByText('Failed to perform semantic search')).toBeInTheDocument();
      });
      
      // Click retry button
      fireEvent.click(screen.getByText('Retry'));
      
      // Wait for successful search
      await waitFor(() => {
        expect(screen.getByText('Test Note')).toBeInTheDocument();
      });
    });
  });

  describe('Clear Functionality', () => {
    it('shows clear button after search', async () => {
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce([]);
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
    });

    it('clears search when clear button is clicked', async () => {
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce([]);
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Clear')).toBeInTheDocument();
      });
      
      fireEvent.click(screen.getByText('Clear'));
      
      expect(input).toHaveValue('');
      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
      expect(screen.queryByText('No notes found matching your search')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows loading state during search', async () => {
      // Mock search to delay response
      vi.mocked(searchNotesBySimilarity).mockImplementationOnce(() => 
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      // Should show loading state
      expect(screen.getByText('Searching...')).toBeInTheDocument();
      
      // Wait for completion
      await waitFor(() => {
        expect(screen.getByText('No notes found matching your search')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles empty query submission', () => {
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const form = input.closest('form');
      
      // Submit form with empty input
      fireEvent.submit(form);
      
      expect(searchNotesBySimilarity).not.toHaveBeenCalled();
    });

    it('handles whitespace-only query', () => {
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const form = input.closest('form');
      
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);
      
      expect(searchNotesBySimilarity).not.toHaveBeenCalled();
    });

    it('handles malformed search results gracefully', async () => {
      const malformedResults = [
        { id: '1', title: null, content: undefined, similarity: 0.8, tags: null }
      ];
      
      vi.mocked(searchNotesBySimilarity).mockResolvedValueOnce(malformedResults);
      
      renderSemanticSearch();
      
      const input = screen.getByPlaceholderText('Search notes by meaning...');
      const searchButton = screen.getByRole('button', { name: /search/i });
      
      fireEvent.change(input, { target: { value: 'test query' } });
      fireEvent.click(searchButton);
      
      await waitFor(() => {
        expect(screen.getByText('Found 1 related note')).toBeInTheDocument();
      });
      
      // Should handle malformed data without crashing
      // Check that the component renders without crashing, even with null/undefined data
      expect(screen.getByText('Found 1 related note')).toBeInTheDocument();
    });
  });
}); 