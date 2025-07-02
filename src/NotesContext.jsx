import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notes from Supabase
  async function fetchNotes() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else if (!data || data.length === 0) {
      // Show demo notes in local state only (not saved to database)
      const demoNotes = [
        {
          id: crypto.randomUUID(),
          title: 'Welcome to GenAI Notes!',
          content: 'This is a demo note. You can edit or delete it, or create your own.',
          tags: ['demo', 'welcome'],
          created_at: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          title: 'AI Features',
          content: 'Try the AI auto-title and summarization features!',
          tags: ['ai', 'features'],
          created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          title: 'Tag Filtering',
          content: 'Filter notes by tags using the sidebar.',
          tags: ['tags', 'filter'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        },
        {
          id: crypto.randomUUID(),
          title: 'Analytics',
          content: 'Check out the Analytics page to see note and tag stats.',
          tags: ['analytics', 'demo'],
          created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
        },
      ];
      setNotes(demoNotes);
    } else {
      // Filter out any notes with invalid UUIDs (like old demo notes)
      const validNotes = data.filter(note => {
        // Check if the ID is a valid UUID format
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(note.id);
      });
      
      if (validNotes.length === 0) {
        // If no valid notes, show demo notes
        const demoNotes = [
          {
            id: crypto.randomUUID(),
            title: 'Welcome to GenAI Notes!',
            content: 'This is a demo note. You can edit or delete it, or create your own.',
            tags: ['demo', 'welcome'],
            created_at: new Date().toISOString(),
          },
          {
            id: crypto.randomUUID(),
            title: 'AI Features',
            content: 'Try the AI auto-title and summarization features!',
            tags: ['ai', 'features'],
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          },
          {
            id: crypto.randomUUID(),
            title: 'Tag Filtering',
            content: 'Filter notes by tags using the sidebar.',
            tags: ['tags', 'filter'],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: crypto.randomUUID(),
            title: 'Analytics',
            content: 'Check out the Analytics page to see note and tag stats.',
            tags: ['analytics', 'demo'],
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
          },
        ];
        setNotes(demoNotes);
      } else {
        setNotes(validNotes);
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  // Create note
  async function createNote(note) {
    // Ensure tags is always an array
    const noteWithTags = {
      ...note,
      tags: Array.isArray(note.tags) ? note.tags : []
    };
    const { data, error } = await supabase.from('notes').insert([noteWithTags]).select();
    if (error) throw new Error(error.message);
    setNotes((prev) => [data[0], ...prev]);
  }

  // Update note
  async function updateNote(id, updated) {
    // Ensure tags is always an array
    const updatedWithTags = {
      ...updated,
      tags: Array.isArray(updated.tags) ? updated.tags : []
    };
    const { data, error } = await supabase.from('notes').update(updatedWithTags).eq('id', id).select();
    if (error) throw new Error(error.message);
    setNotes((prev) => prev.map((n) => (n.id === id ? data[0] : n)));
  }

  // Delete note
  async function deleteNote(id) {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw new Error(error.message);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <NotesContext.Provider value={{ notes, loading, error, createNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  return useContext(NotesContext);
}

export { NotesContext }; 