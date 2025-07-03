import OpenAI from 'openai';
import { supabase } from './supabaseClient.js';

const openaiApiKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_OPENAI_API_KEY
  ? import.meta.env.VITE_OPENAI_API_KEY
  : process.env.VITE_OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: openaiApiKey,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

// Preprocess text for better embedding quality
function preprocessText(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .toLowerCase();
}

// Generate embeddings for note content with better formatting
export async function generateEmbedding(text) {
  try {
    const processedText = preprocessText(text);
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: processedText,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

// Store note with embedding in Supabase
export async function storeNoteWithEmbedding(note) {
  try {
    // Generate embedding with better content formatting
    const contentForEmbedding = `${note.title}\n\n${note.content}`;
    const embedding = await generateEmbedding(contentForEmbedding);
    
    // Store note with embedding
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...note,
        embedding: embedding
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error storing note with embedding:', error);
    throw error;
  }
}

// Find related notes using vector similarity
export async function findRelatedNotes(noteId, limit = 5) {
  try {
    // First, get the embedding of the current note
    const { data: currentNote, error: fetchError } = await supabase
      .from('notes')
      .select('embedding, title, content')
      .eq('id', noteId)
      .single();
    
    if (fetchError || !currentNote.embedding) {
      throw new Error('Note not found or no embedding available');
    }

    // Find similar notes using vector similarity with higher threshold
    const { data: relatedNotes, error: similarityError } = await supabase
      .rpc('match_notes', {
        query_embedding: currentNote.embedding,
        match_threshold: 0.75, // Increased threshold for better quality
        match_count: limit,
        exclude_id: noteId
      });

    if (similarityError) throw similarityError;
    
    return relatedNotes || [];
  } catch (error) {
    console.error('Error finding related notes:', error);
    throw error;
  }
}

// Update note embedding when note is modified
export async function updateNoteEmbedding(noteId, title, content) {
  try {
    const contentForEmbedding = `${title}\n\n${content}`;
    const embedding = await generateEmbedding(contentForEmbedding);
    
    const { error } = await supabase
      .from('notes')
      .update({ embedding: embedding })
      .eq('id', noteId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating note embedding:', error);
    throw error;
  }
}

// Enhanced query preprocessing for better search results
function enhanceSearchQuery(query) {
  // Remove common stop words that don't add semantic value
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const words = query.toLowerCase().split(' ');
  const filteredWords = words.filter(word => !stopWords.includes(word) && word.length > 2);
  
  // If query is too short after filtering, use original
  return filteredWords.length > 0 ? filteredWords.join(' ') : query;
}

// Search notes by semantic similarity with improved query handling
export async function searchNotesBySimilarity(query, limit = 10) {
  try {
    // Enhance the query for better semantic matching
    const enhancedQuery = enhanceSearchQuery(query);
    const queryEmbedding = await generateEmbedding(enhancedQuery);
    
    // Try with higher threshold first, then fallback to lower if no results
    let results = [];
    let error = null;
    
    // First attempt with higher threshold for better quality
    try {
      const { data: highQualityResults, error: highError } = await supabase
        .rpc('match_notes', {
          query_embedding: queryEmbedding,
          match_threshold: 0.7, // Higher threshold for better quality
          match_count: limit,
          exclude_id: null
        });
      
      if (highError) throw highError;
      results = highQualityResults || [];
    } catch (highError) {
      error = highError;
    }
    
    // If no results with high threshold, try with lower threshold
    if (results.length === 0) {
      try {
        const { data: fallbackResults, error: fallbackError } = await supabase
          .rpc('match_notes', {
            query_embedding: queryEmbedding,
            match_threshold: 0.5, // Lower threshold as fallback
            match_count: limit,
            exclude_id: null
          });
        
        if (fallbackError) throw fallbackError;
        results = fallbackResults || [];
      } catch (fallbackError) {
        error = fallbackError;
      }
    }
    
    if (error) throw error;
    
    // Sort by similarity and limit results
    return results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    console.error('Error searching notes by similarity:', error);
    throw error;
  }
}

// Debug function to analyze similarity scores for a specific query and note
export async function debugSimilarity(query, noteId) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const { data: debugInfo, error } = await supabase
      .rpc('debug_similarity', {
        query_embedding: queryEmbedding,
        note_id: noteId
      });

    if (error) throw error;
    
    return debugInfo[0] || null;
  } catch (error) {
    console.error('Error debugging similarity:', error);
    throw error;
  }
}

// Get all notes with their embeddings for analysis
export async function getAllNotesWithEmbeddings() {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select('id, title, content, embedding')
      .not('embedding', 'is', null);
    
    if (error) throw error;
    
    return notes || [];
  } catch (error) {
    console.error('Error fetching notes with embeddings:', error);
    throw error;
  }
}

// Analyze search quality by testing multiple queries
export async function analyzeSearchQuality() {
  try {
    const notes = await getAllNotesWithEmbeddings();
    const analysis = [];
    
    // Test queries based on note content
    const testQueries = [
      'AI features',
      'analytics dashboard',
      'tag filtering',
      'welcome message',
      'demo content'
    ];
    
    for (const query of testQueries) {
      const results = await searchNotesBySimilarity(query, 5);
      analysis.push({
        query,
        results: results.map(r => ({
          title: r.title,
          similarity: r.similarity
        }))
      });
    }
    
    return analysis;
  } catch (error) {
    console.error('Error analyzing search quality:', error);
    throw error;
  }
} 