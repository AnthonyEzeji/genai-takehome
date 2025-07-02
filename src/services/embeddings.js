import OpenAI from 'openai';
import { supabase } from './supabaseClient';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
});

// Generate embeddings for note content
export async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
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
    // Generate embedding from note content
    const embedding = await generateEmbedding(`${note.title} ${note.content}`);
    
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

    // Find similar notes using vector similarity
    const { data: relatedNotes, error: similarityError } = await supabase
      .rpc('match_notes', {
        query_embedding: currentNote.embedding,
        match_threshold: 0.7,
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
    const embedding = await generateEmbedding(`${title} ${content}`);
    
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

// Search notes by semantic similarity
export async function searchNotesBySimilarity(query, limit = 10) {
  try {
    const queryEmbedding = await generateEmbedding(query);
    
    const { data: results, error } = await supabase
      .rpc('match_notes', {
        query_embedding: queryEmbedding,
        match_threshold: 0.6,
        match_count: limit,
        exclude_id: null
      });

    if (error) throw error;
    
    return results || [];
  } catch (error) {
    console.error('Error searching notes by similarity:', error);
    throw error;
  }
} 