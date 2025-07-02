import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

const NotesContext = createContext();

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch notes from Supabase
  useEffect(() => {
    async function fetchNotes() {
      setLoading(true);
      const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setNotes(data || []);
      setLoading(false);
    }
    fetchNotes();
  }, []);

  // Create note
  async function createNote(note) {
    const { data, error } = await supabase.from('notes').insert([note]).select();
    if (error) throw new Error(error.message);
    setNotes((prev) => [data[0], ...prev]);
  }

  // Update note
  async function updateNote(id, updates) {
    const { data, error } = await supabase.from('notes').update(updates).eq('id', id).select();
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