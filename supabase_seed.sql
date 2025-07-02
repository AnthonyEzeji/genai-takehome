-- Create the notes table if it doesn't exist
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (for demo purposes)
-- In production, you'd want more restrictive policies
CREATE POLICY "Allow all operations" ON notes FOR ALL USING (true);

-- Clear existing data (optional - remove this if you want to keep existing data)
DELETE FROM notes;

-- Seed with demo data
INSERT INTO notes (id, title, content, tags, created_at) VALUES
(
  gen_random_uuid(),
  'Welcome to GenAI Notes!',
  'This is a demo note. You can edit or delete it, or create your own.',
  ARRAY['demo', 'welcome'],
  NOW()
),
(
  gen_random_uuid(),
  'AI Features',
  'Try the AI auto-title and summarization features!',
  ARRAY['ai', 'features'],
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  'Tag Filtering',
  'Filter notes by tags using the sidebar.',
  ARRAY['tags', 'filter'],
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'Analytics',
  'Check out the Analytics page to see note and tag stats.',
  ARRAY['analytics', 'demo'],
  NOW() - INTERVAL '3 hours'
);

-- Verify the data was inserted
SELECT * FROM notes ORDER BY created_at DESC; 