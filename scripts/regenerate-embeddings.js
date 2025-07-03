import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const openaiApiKey = process.env.VITE_OPENAI_API_KEY;

if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const openai = new OpenAI({ apiKey: openaiApiKey });

// Preprocess text for better embedding quality
function preprocessText(text) {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .toLowerCase();
}

// Generate embedding with improved formatting
async function generateEmbedding(text) {
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

async function regenerateEmbeddings() {
  try {
    console.log('Fetching all notes...');
    
    // Get all notes without embeddings or with old embeddings
    const { data: notes, error: fetchError } = await supabase
      .from('notes')
      .select('id, title, content')
      .order('created_at', { ascending: true });
    
    if (fetchError) {
      throw fetchError;
    }
    
    console.log(`Found ${notes.length} notes to process`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const note of notes) {
      try {
        console.log(`Processing note: "${note.title}"`);
        
        // Generate embedding with improved content formatting
        const contentForEmbedding = `${note.title}\n\n${note.content}`;
        const embedding = await generateEmbedding(contentForEmbedding);
        
        // Update the note with new embedding
        const { error: updateError } = await supabase
          .from('notes')
          .update({ embedding: embedding })
          .eq('id', note.id);
        
        if (updateError) {
          throw updateError;
        }
        
        console.log(`✓ Successfully updated embedding for "${note.title}"`);
        successCount++;
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`✗ Error processing note "${note.title}":`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== Regeneration Complete ===');
    console.log(`Successfully processed: ${successCount} notes`);
    console.log(`Errors: ${errorCount} notes`);
    console.log(`Total: ${notes.length} notes`);
    
  } catch (error) {
    console.error('Fatal error during embedding regeneration:', error);
    process.exit(1);
  }
}

// Run the regeneration
regenerateEmbeddings(); 