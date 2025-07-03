-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a function to match notes by similarity with improved scoring
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5,
  exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  tags text[],
  created_at timestamp with time zone,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    notes.id,
    notes.title,
    notes.content,
    notes.tags,
    notes.created_at,
    -- Use cosine similarity (1 - distance) for better interpretability
    (1 - (notes.embedding <=> query_embedding)) AS similarity
  FROM notes
  WHERE 
    notes.embedding IS NOT NULL
    AND (exclude_id IS NULL OR notes.id != exclude_id)
    AND (1 - (notes.embedding <=> query_embedding)) > match_threshold
  ORDER BY notes.embedding <=> query_embedding ASC  -- Lower distance = higher similarity
  LIMIT match_count;
END;
$$;

-- Create a function for debugging similarity scores
CREATE OR REPLACE FUNCTION debug_similarity(
  query_embedding vector(1536),
  note_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  similarity float,
  distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    notes.id,
    notes.title,
    (1 - (notes.embedding <=> query_embedding)) AS similarity,
    (notes.embedding <=> query_embedding) AS distance
  FROM notes
  WHERE notes.id = note_id AND notes.embedding IS NOT NULL;
END;
$$;

-- Create an index for faster similarity searches
-- Using HNSW index for better performance on larger datasets
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

-- Add a comment to explain the vector functionality
COMMENT ON COLUMN notes.embedding IS 'Vector embedding for semantic similarity search using OpenAI text-embedding-ada-002 model';
COMMENT ON FUNCTION match_notes IS 'Find notes similar to a given embedding using cosine similarity';
COMMENT ON FUNCTION debug_similarity IS 'Debug function to check similarity scores for specific notes'; 