import React, { useState } from 'react';
import { searchNotesBySimilarity } from '../../services/embeddings';

export default function SemanticSearch({ onNoteSelect }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const results = await searchNotesBySimilarity(query.trim(), 5);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to perform semantic search');
      console.error('Error in semantic search:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }

  function clearSearch() {
    setQuery('');
    setSearchResults([]);
    setError(null);
    setHasSearched(false);
  }

  return (
    <section className="semantic-search" aria-labelledby="semantic-search-title">
      <h3 id="semantic-search-title" className="text-lg font-semibold text-gray-800 mb-3">
        Semantic Search
      </h3>
      
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by meaning..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            aria-label="Search notes semantically"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn btn-primary px-4 py-2 disabled:opacity-50"
            aria-label="Search notes"
          >
            {loading ? (
              <span className="loading" aria-label="Searching..."></span>
            ) : (
              'Search'
            )}
          </button>
          {hasSearched && (
            <button
              type="button"
              onClick={clearSearch}
              className="btn btn-secondary px-4 py-2"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && (
        <div className="text-red-600 text-sm p-3 bg-red-50 rounded border border-red-200 mb-4" role="alert">
          <strong>Error:</strong> {error}
          <button 
            onClick={handleSearch}
            className="btn btn-secondary ml-2 text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {hasSearched && !loading && !error && searchResults.length === 0 && (
        <div className="text-gray-500 text-sm p-4 bg-gray-50 rounded text-center">
          No notes found matching your search
        </div>
      )}

      {!loading && !error && searchResults.length > 0 && (
        <div className="space-y-2" role="list" aria-label="Search results">
          <p className="text-sm text-gray-600 mb-2">
            Found {searchResults.length} related note{searchResults.length !== 1 ? 's' : ''}
          </p>
          {searchResults.map((note) => (
            <div 
              key={note.id} 
              className="search-result-card"
              role="listitem"
            >
              <button
                onClick={() => onNoteSelect(note)}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label={`View note: ${note.title}`}
              >
                <h4 className="font-medium text-gray-900 mb-1 line-clamp-1">
                  {note.title}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {note.content}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Relevance: {Math.round(note.similarity * 100)}%
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span 
                          key={tag} 
                          className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
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