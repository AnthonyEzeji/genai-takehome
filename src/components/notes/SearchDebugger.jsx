import React, { useState } from 'react';
import { debugSimilarity, analyzeSearchQuality } from '../../services/embeddings';

export default function SearchDebugger() {
  const [query, setQuery] = useState('');
  const [noteId, setNoteId] = useState('');
  const [debugResult, setDebugResult] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleDebug() {
    if (!query.trim() || !noteId.trim()) return;
    
    setLoading(true);
    try {
      const result = await debugSimilarity(query, noteId);
      setDebugResult(result);
    } catch (error) {
      console.error('Debug failed:', error);
      setDebugResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    setLoading(true);
    try {
      const result = await analyzeSearchQuality();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: error.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-debugger p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Search Debugger
      </h3>
      
      <div className="space-y-4">
        {/* Debug specific query and note */}
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-3">Debug Similarity Score</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter search query..."
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              value={noteId}
              onChange={(e) => setNoteId(e.target.value)}
              placeholder="Enter note ID..."
              className="border rounded px-3 py-2"
            />
          </div>
          <button
            onClick={handleDebug}
            disabled={loading || !query.trim() || !noteId.trim()}
            className="btn btn-primary"
          >
            {loading ? 'Debugging...' : 'Debug Similarity'}
          </button>
          
          {debugResult && (
            <div className="mt-3 p-3 bg-blue-50 rounded">
              {debugResult.error ? (
                <p className="text-red-600">{debugResult.error}</p>
              ) : (
                <div>
                  <p><strong>Note:</strong> {debugResult.title}</p>
                  <p><strong>Similarity:</strong> {(debugResult.similarity * 100).toFixed(2)}%</p>
                  <p><strong>Distance:</strong> {debugResult.distance.toFixed(4)}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Analyze overall search quality */}
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-3">Analyze Search Quality</h4>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="btn btn-secondary"
          >
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
          
          {analysis && (
            <div className="mt-3 space-y-3">
              {analysis.error ? (
                <p className="text-red-600">{analysis.error}</p>
              ) : (
                analysis.map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <p className="font-medium">Query: "{item.query}"</p>
                    <div className="mt-2 space-y-1">
                      {item.results.map((result, rIndex) => (
                        <p key={rIndex} className="text-sm">
                          • {result.title} ({(result.similarity * 100).toFixed(1)}%)
                        </p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Tips for better search */}
        <div className="bg-white p-4 rounded border">
          <h4 className="font-medium mb-3">Tips for Better Search Results</h4>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>• Use specific, meaningful keywords rather than generic terms</li>
            <li>• Try synonyms or related concepts if initial results are poor</li>
            <li>• Longer, more descriptive queries often work better</li>
            <li>• Check that your notes have enough content for meaningful embeddings</li>
            <li>• Ensure your OpenAI API key is valid and has sufficient credits</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 