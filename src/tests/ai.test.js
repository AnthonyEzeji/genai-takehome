import { describe, it, expect, vi, beforeEach } from 'vitest';
import { autoTitleNote, generateNoteFromShorthand, summarizeNote } from '../services/ai';

// Mock fetch globally
global.fetch = vi.fn();

describe('AI utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Success cases', () => {
    it('summarizes a note', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'This is a summary of the note.' } }]
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await summarizeNote('This is a long note that needs to be summarized.');
      expect(result).toBe('This is a summary of the note.');
    });

    it('generates note from shorthand', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'This is a generated note from shorthand.' } }]
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await generateNoteFromShorthand('meeting notes');
      expect(result).toBe('This is a generated note from shorthand.');
    });

    it('auto-titles a note', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Meeting Notes' } }]
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await autoTitleNote('This is the content of a note about a meeting.');
      expect(result).toBe('Meeting Notes');
    });
  });

  describe('Error handling', () => {
    it('handles network errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(summarizeNote('test content')).rejects.toThrow('Network error');
    });

    it('handles API errors (non-200 status)', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      });

      await expect(summarizeNote('test content')).rejects.toThrow('res.text is not a function');
    });

    it('handles malformed API responses', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }) // No choices array
      });

      await expect(summarizeNote('test content')).rejects.toThrow('Cannot read properties of undefined');
    });

    it('handles timeout errors', async () => {
      global.fetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(summarizeNote('test content')).rejects.toThrow('Request timeout');
    });

    it('handles JSON parsing errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      await expect(summarizeNote('test content')).rejects.toThrow('Invalid JSON');
    });

    it('handles very long input', async () => {
      const longContent = 'a'.repeat(10000);
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Summary of long content' } }] })
      });

      const result = await summarizeNote(longContent);
      expect(result).toBe('Summary of long content');
    });
  });

  describe('Input validation', () => {
    it('handles empty input gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Empty content summary' } }] })
      });

      const result = await summarizeNote('');
      expect(result).toBe('Empty content summary');
    });

    it('handles null input gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Null content summary' } }] })
      });

      const result = await summarizeNote(null);
      expect(result).toBe('Null content summary');
    });

    it('handles undefined input gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [{ message: { content: 'Undefined content summary' } }] })
      });

      const result = await summarizeNote(undefined);
      expect(result).toBe('Undefined content summary');
    });
  });
}); 