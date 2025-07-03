import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { supabase } from '../src/services/supabaseClient.js';
import { generateEmbedding } from '../src/services/embeddings.js';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or service role key');
  process.exit(1);
}

const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

const demoNotes = [
  {
          title: 'Welcome to GenAI Notes!',
    content: 'This is a demo note. You can edit or delete it, or create your own.',
    tags: ['demo', 'welcome'],
    created_at: new Date().toISOString(),
  },
  {
    title: 'AI Features',
    content: 'Try the AI auto-title and summarization features!',
    tags: ['ai', 'features'],
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    title: 'Tag Filtering',
    content: 'Filter notes by tags using the sidebar.',
    tags: ['tags', 'filter'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    title: 'Analytics',
    content: 'Check out the Analytics page to see note and tag stats.',
    tags: ['analytics', 'demo'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

async function seedDatabase() {
  try {
    console.log('Clearing existing notes...');
    const { error: deleteError } = await supabaseClient
      .from('notes')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all notes
    
    if (deleteError) {
      console.error('Error clearing notes:', deleteError);
      return;
    }

    console.log('Inserting demo notes...');
    const { data, error } = await supabaseClient
      .from('notes')
      .insert(demoNotes)
      .select();

    if (error) {
      console.error('Error inserting notes:', error);
      return;
    }

    console.log('Successfully seeded database with', data.length, 'notes');
    console.log('Notes created:', data.map(note => ({ id: note.id, title: note.title })));
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function backfillEmbeddings() {
  console.log('Backfilling embeddings for notes without embeddings...');
  const { data: notes, error } = await supabaseClient
    .from('notes')
    .select('*')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching notes:', error);
    process.exit(1);
  }

  if (!notes.length) {
    console.log('All notes already have embeddings!');
    return;
  }

  console.log(`Found ${notes.length} notes without embeddings.`);

  for (const note of notes) {
    try {
      console.log(`Generating embedding for note: ${note.title}`);
      const embedding = await generateEmbedding(`${note.title} ${note.content}`);
      const { error: updateError } = await supabaseClient
        .from('notes')
        .update({ embedding })
        .eq('id', note.id);
      if (updateError) {
        console.error(`Failed to update note ${note.id}:`, updateError.message);
      } else {
        console.log(`✅ Updated note "${note.title}" with embedding.`);
      }
    } catch (err) {
      console.error(`Error generating embedding for note ${note.id}:`, err.message);
    }
  }
  console.log('Backfill complete!');
}

// Only run backfill, skip seeding demo data
backfillEmbeddings(); 