import React, { useState, useEffect } from 'react';
import { useNotes } from './NotesContext';
import { autoTitleNote, generateNoteFromShorthand } from './ai';

function TagInput({ tags, setTags }) {
  const [input, setInput] = useState('');

  function addTag() {
    const tag = input.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setInput('');
  }

  function removeTag(tag) {
    setTags(tags.filter(t => t !== tag));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map(tag => (
          <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
            {tag}
            <button type="button" className="ml-1 text-red-500" onClick={() => removeTag(tag)}>&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="Add tag"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="button" className="bg-blue-600 text-white px-2 py-1 rounded" onClick={addTag}>Add</button>
      </div>
    </div>
  );
}

export default function NoteForm({ editingNote, onSave }) {
  const { createNote, updateNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [aiLoading, setAiLoading] = useState(null); // 'title' | 'shorthand' | null
  const [aiError, setAiError] = useState(null);
  const [shorthand, setShorthand] = useState('');

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title || '');
      setContent(editingNote.content || '');
      setTags(editingNote.tags || []);
    } else {
      setTitle('');
      setContent('');
      setTags([]);
    }
    setShorthand('');
    setAiError(null);
    setAiLoading(null);
  }, [editingNote]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingNote) {
        await updateNote(editingNote.id, {
          title,
          content,
          tags,
        });
        if (onSave) onSave();
      } else {
        await createNote({
          title,
          content,
          tags,
        });
      }
      setTitle('');
      setContent('');
      setTags([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAutoTitle() {
    setAiLoading('title');
    setAiError(null);
    try {
      const aiTitle = await autoTitleNote(content);
      setTitle(aiTitle);
    } catch (err) {
      setAiError('AI error: ' + err.message);
    } finally {
      setAiLoading(null);
    }
  }

  async function handleGenerateFromShorthand() {
    setAiLoading('shorthand');
    setAiError(null);
    try {
      const aiContent = await generateNoteFromShorthand(shorthand);
      setContent(aiContent);
    } catch (err) {
      setAiError('AI error: ' + err.message);
    } finally {
      setAiLoading(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 flex flex-col gap-3 mt-6">
      <div className="flex gap-2 items-center">
        <input
          className="w-full border rounded px-2 py-1"
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
        <button
          type="button"
          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
          onClick={handleAutoTitle}
          disabled={aiLoading === 'title' || !content}
        >
          {aiLoading === 'title' ? 'AI...' : 'Auto-Title'}
        </button>
      </div>
      <div>
        <textarea
          className="w-full border rounded px-2 py-1 min-h-[80px]"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
        />
      </div>
      <div className="flex gap-2 items-start">
        <textarea
          className="w-full border rounded px-2 py-1 min-h-[40px]"
          placeholder="Shorthand or bullet points (optional)"
          value={shorthand}
          onChange={e => setShorthand(e.target.value)}
        />
        <button
          type="button"
          className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300 mt-1"
          onClick={handleGenerateFromShorthand}
          disabled={aiLoading === 'shorthand' || !shorthand}
        >
          {aiLoading === 'shorthand' ? 'AI...' : 'Generate from Shorthand'}
        </button>
      </div>
      <TagInput tags={tags} setTags={setTags} />
      {aiError && <div className="text-red-600 text-sm">{aiError}</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? (editingNote ? 'Updating...' : 'Saving...') : (editingNote ? 'Update Note' : 'Add Note')}
      </button>
      {editingNote && (
        <button
          type="button"
          className="text-xs text-gray-500 mt-2 self-end hover:underline"
          onClick={() => onSave && onSave(null)}
        >
          Cancel
        </button>
      )}
    </form>
  );
} 