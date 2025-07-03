-- Seed demo data with more diverse content for better semantic search testing
INSERT INTO notes (id, title, content, tags, created_at) VALUES
(
  gen_random_uuid(),
  'Welcome to GenAI Notes!',
  'This is a demo note. You can edit or delete it, or create your own. This application features AI-powered semantic search, automatic tagging, and analytics.',
  ARRAY['demo', 'welcome', 'introduction'],
  NOW()
),
(
  gen_random_uuid(),
  'AI Features Overview',
  'Try the AI auto-title and summarization features! The system uses OpenAI embeddings for semantic search and can automatically generate titles and summaries for your notes.',
  ARRAY['ai', 'features', 'openai', 'semantic'],
  NOW() - INTERVAL '1 hour'
),
(
  gen_random_uuid(),
  'Tag Filtering System',
  'Filter notes by tags using the sidebar. You can create custom tags, filter by multiple tags, and organize your notes efficiently. Tags help with categorization and quick access.',
  ARRAY['tags', 'filter', 'organization', 'categorization'],
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  'Analytics Dashboard',
  'Check out the Analytics page to see note and tag statistics. Track your note creation patterns, most used tags, and overall usage metrics. The dashboard provides insights into your note-taking habits.',
  ARRAY['analytics', 'dashboard', 'statistics', 'metrics'],
  NOW() - INTERVAL '3 hours'
),
(
  gen_random_uuid(),
  'Machine Learning Concepts',
  'Understanding neural networks, deep learning, and artificial intelligence. This note covers fundamental concepts in machine learning including supervised learning, unsupervised learning, and reinforcement learning.',
  ARRAY['machine-learning', 'ai', 'neural-networks', 'deep-learning'],
  NOW() - INTERVAL '4 hours'
),
(
  gen_random_uuid(),
  'Web Development Best Practices',
  'Frontend development with React, backend APIs, database design, and deployment strategies. Learn about modern web development tools, frameworks, and methodologies for building scalable applications.',
  ARRAY['web-development', 'react', 'api', 'database', 'deployment'],
  NOW() - INTERVAL '5 hours'
),
(
  gen_random_uuid(),
  'Data Science Workflow',
  'Data collection, preprocessing, analysis, and visualization techniques. This covers the complete data science pipeline from raw data to actionable insights using Python, pandas, and visualization libraries.',
  ARRAY['data-science', 'python', 'pandas', 'visualization', 'analysis'],
  NOW() - INTERVAL '6 hours'
),
(
  gen_random_uuid(),
  'Product Management Notes',
  'User research, feature prioritization, roadmap planning, and stakeholder communication. Essential skills for product managers including agile methodologies, user story mapping, and metrics tracking.',
  ARRAY['product-management', 'user-research', 'agile', 'roadmap'],
  NOW() - INTERVAL '7 hours'
); 