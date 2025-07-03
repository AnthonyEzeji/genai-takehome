// Only load dotenv in Node.js environment
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  import('dotenv/config');
}
import { createClient } from '@supabase/supabase-js';

// Support both Vite (browser) and Node.js (scripts)
const supabaseUrl = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 