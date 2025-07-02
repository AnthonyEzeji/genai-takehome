import React, { useState, useEffect } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { autoTitleNote, generateNoteFromShorthand } from '../../services/ai';

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
      <label htmlFor="tag-input" className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-2" role="list" aria-label="Selected tags">
        {tags.map(tag => (
          <span key={tag} className="tag" role="listitem">
            {tag}
            <button 
              type="button" 
              className="tag-remove" 
              onClick={() => removeTag(tag)}
              aria-label={`Remove tag ${tag}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          id="tag-input"
          className="border rounded px-2 py-1 flex-1"
          placeholder="Add tag"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-describedby="tag-help"
        />
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={addTag}
          disabled={!input.trim()}
        >
          Add
        </button>
      </div>
      <p id="tag-help" className="text-xs text-gray-500 mt-1">
        Press Enter or click Add to add a tag
      </p>
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
  const [retryCount, setRetryCount] = useState(0);

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
    setRetryCount(0);
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

  async function handleAutoTitle(retryAttempt = 0) {
    setAiLoading('title');
    setAiError(null);
    try {
      const aiTitle = await autoTitleNote(content);
      setTitle(aiTitle);
      setRetryCount(0);
    } catch (err) {
      setAiError('AI error: ' + err.message);
      if (retryAttempt < 2) {
        setTimeout(() => {
          handleAutoTitle(retryAttempt + 1);
        }, 1000 * (retryAttempt + 1));
      }
    } finally {
      setAiLoading(null);
    }
  }

  async function handleGenerateFromShorthand(retryAttempt = 0) {
    setAiLoading('shorthand');
    setAiError(null);
    try {
      const aiContent = await generateNoteFromShorthand(shorthand);
      setContent(aiContent);
      setRetryCount(0);
    } catch (err) {
      setAiError('AI error: ' + err.message);
      if (retryAttempt < 2) {
        setTimeout(() => {
          handleGenerateFromShorthand(retryAttempt + 1);
        }, 1000 * (retryAttempt + 1));
      }
    } finally {
      setAiLoading(null);
    }
  }

  const isFormValid = title.trim() && content.trim();

  return (
    <form onSubmit={handleSubmit} className="note-form" noValidate>
      <div className="flex gap-2 items-center mb-3">
        <div className="flex-1">
          <label htmlFor="title-input" className="sr-only">Title</label>
          <input
            id="title-input"
            className="w-full border rounded px-2 py-1"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            aria-describedby="title-error"
            aria-invalid={!title.trim() && title !== ''}
          />
          {!title.trim() && title !== '' && (
            <div id="title-error" className="text-red-600 text-xs mt-1">
              Title is required
            </div>
          )}
        </div>
        <button
          type="button"
          className="btn btn-ai"
          onClick={() => handleAutoTitle()}
          disabled={aiLoading === 'title' || !content.trim()}
          aria-label="Generate title using AI"
        >
          {aiLoading === 'title' ? (
            <span className="loading" aria-label="Generating title..."></span>
          ) : (
            'Auto-Title'
          )}
        </button>
      </div>
      <div className="mb-3">
        <label htmlFor="content-input" className="sr-only">Content</label>
        <textarea
          id="content-input"
          className="w-full border rounded px-2 py-1 min-h-[80px]"
          placeholder="Content"
          value={content}
          onChange={e => setContent(e.target.value)}
          required
          aria-describedby="content-error"
          aria-invalid={!content.trim() && content !== ''}
        />
        {!content.trim() && content !== '' && (
          <div id="content-error" className="text-red-600 text-xs mt-1">
            Content is required
          </div>
        )}
      </div>
      <div className="flex gap-2 items-start mb-3">
        <div className="flex-1">
          <label htmlFor="shorthand-input" className="sr-only">Shorthand</label>
          <textarea
            id="shorthand-input"
            className="w-full border rounded px-2 py-1 min-h-[40px]"
            placeholder="Shorthand or bullet points (optional)"
            value={shorthand}
            onChange={e => setShorthand(e.target.value)}
            aria-describedby="shorthand-help"
          />
          <p id="shorthand-help" className="text-xs text-gray-500 mt-1">
            Enter bullet points or shorthand to generate content
          </p>
        </div>
        <button
          type="button"
          className="btn btn-ai"
          onClick={() => handleGenerateFromShorthand()}
          disabled={aiLoading === 'shorthand' || !shorthand.trim()}
          aria-label="Generate content from shorthand using AI"
        >
          {aiLoading === 'shorthand' ? (
            <span className="loading" aria-label="Generating content..."></span>
          ) : (
            'Generate from Shorthand'
          )}
        </button>
      </div>
      <TagInput tags={tags} setTags={setTags} />
      {error && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}
      {aiError && (
        <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded border border-red-200" role="alert">
          <strong>AI Error:</strong> {aiError}
          {retryCount < 2 && (
            <button 
              onClick={() => {
                setRetryCount(retryCount + 1);
                if (aiLoading === 'title') handleAutoTitle();
                if (aiLoading === 'shorthand') handleGenerateFromShorthand();
              }}
              className="btn btn-secondary ml-2 text-xs"
            >
              Retry
            </button>
          )}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !isFormValid}
          aria-describedby={!isFormValid ? "form-validation" : undefined}
        >
          {loading ? (
            <span className="loading" aria-label="Saving note..."></span>
          ) : (
            editingNote ? 'Update Note' : 'Add Note'
          )}
        </button>
      </div>
      {!isFormValid && (
        <div id="form-validation" className="text-red-600 text-xs mt-1">
          Please fill in both title and content
        </div>
      )}
    </form>
  );
} 