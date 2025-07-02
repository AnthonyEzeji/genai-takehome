import { describe, it, expect, vi, beforeEach } from 'vitest';
import { summarizeNote, generateNoteFromShorthand, autoTitleNote } from './ai';

// Mock fetch
beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ choices: [{ message: { content: 'Mocked AI response' } }] }),
  });
});

describe('AI utilities', () => {
  it('summarizes a note', async () => {
    const summary = await summarizeNote('This is a long note.');
    expect(summary).toBe('Mocked AI response');
  });

  it('generates note from shorthand', async () => {
    const note = await generateNoteFromShorthand('bullet 1, bullet 2');
    expect(note).toBe('Mocked AI response');
  });

  it('auto-titles a note', async () => {
    const title = await autoTitleNote('This is a note content.');
    expect(title).toBe('Mocked AI response');
  });
}); 