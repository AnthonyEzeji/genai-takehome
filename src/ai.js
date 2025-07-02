const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

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
  return callOpenAI([
    { role: 'system', content: 'You are a helpful assistant that summarizes notes.' },
    { role: 'user', content: `Summarize this note in 1-2 sentences:
${content}` },
  ], { max_tokens: 100 });
}

export async function generateNoteFromShorthand(shorthand) {
  return callOpenAI([
    { role: 'system', content: 'You are a helpful assistant that expands shorthand or bullet points into a full, clear note.' },
    { role: 'user', content: `Expand this shorthand or bullet points into a full note:
${shorthand}` },
  ], { max_tokens: 300 });
}

export async function autoTitleNote(content) {
  return callOpenAI([
    { role: 'system', content: 'You are a helpful assistant that suggests concise, descriptive titles for notes.' },
    { role: 'user', content: `Suggest a concise, descriptive title for this note:
${content}` },
  ], { max_tokens: 16, temperature: 0.3 });
} 