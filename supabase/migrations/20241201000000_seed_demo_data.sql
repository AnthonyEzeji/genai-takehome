-- Seed demo data
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