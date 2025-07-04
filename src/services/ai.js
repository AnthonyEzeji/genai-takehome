const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
import { supabase } from './supabaseClient';

// Log AI usage to database
async function logAIUsageToDB(feature) {
  try {
    await supabase.from('ai_usage').insert([{ feature }]);
  } catch (error) {
    console.error('Failed to log AI usage:', error);
  }
}

async function callOpenAI(messages, { temperature = 0.7, max_tokens = 256 } = {}) {
  await new Promise((res) => setTimeout(res, 1000)); // Simulate 1s latency
  const res = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages,
      temperature,
      max_tokens,
    }),
  });
  if (!res.ok) throw new Error('AI API error: ' + (await res.text()));
  const data = await res.json();
  return data.choices[0].message.content.trim();
}

export async function summarizeNote(content) {
  await logAIUsageToDB('summarize');
  return callOpenAI([
    { role: 'system', content: 'You are a helpful assistant that summarizes notes.' },
    { role: 'user', content: `Summarize this note:
${content}` },
  ], { max_tokens: 100 });
}

export async function generateNoteFromShorthand(shorthand) {
  await logAIUsageToDB('generate');
  return callOpenAI([
    { role: 'system', content: 'You are a helpful assistant that expands shorthand or bullet points into a full, clear note. Provide comprehensive, well-structured content that fully expands on the given points.' },
    { role: 'user', content: `Expand this shorthand or bullet points into a full note:
${shorthand}` },
  ], { max_tokens: 1000 });
}

export async function autoTitleNote(content) {
  await logAIUsageToDB('autoTitle');
  const title = await callOpenAI([
    { role: 'system', content: 'You are a helpful assistant that generates concise, descriptive titles for notes. Keep titles under 50 characters and make them clear and specific.' },
    { role: 'user', content: `Generate a short, descriptive title for this note (max 50 characters):
${content}` },
  ], { max_tokens: 16, temperature: 0.3 });
  
  // Ensure the title is properly truncated and cleaned
  return title.length > 50 ? title.substring(0, 47) + '...' : title;
} 