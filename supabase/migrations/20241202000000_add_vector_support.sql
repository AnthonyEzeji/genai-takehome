-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to notes table
ALTER TABLE notes ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create a function to match notes by similarity
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
    1 - (notes.embedding <=> query_embedding) AS similarity
  FROM notes
  WHERE 
    notes.embedding IS NOT NULL
    AND (exclude_id IS NULL OR notes.id != exclude_id)
    AND 1 - (notes.embedding <=> query_embedding) > match_threshold
  ORDER BY notes.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create an index for faster similarity searches
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Add a comment to explain the vector functionality
COMMENT ON COLUMN notes.embedding IS 'Vector embedding for semantic similarity search using OpenAI text-embedding-ada-002 model';
COMMENT ON FUNCTION match_notes IS 'Find notes similar to a given embedding using cosine similarity'; 