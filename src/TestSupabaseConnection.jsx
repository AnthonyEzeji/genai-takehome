import React, { useEffect, useState } from 'react';
import { supabase } from './services/supabaseClient';

export default function TestSupabaseConnection() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    // Try to fetch from a table that should exist (e.g., 'notes')
    async function testConnection() {
      try {
        const { data, error } = await supabase.from('notes').select('*').limit(1);
        if (error) {
          setStatus('Connected, but table missing or error: ' + error.message);
        } else {
          setStatus('Supabase connection successful!');
        }
      } catch (err) {
        setStatus('Connection failed: ' + err.message);
      }
    }
    testConnection();
  }, []);

  return (
    <div className="p-4 bg-blue-100 rounded mt-4">
      <strong>Supabase Test:</strong> {status}
    </div>
  );
} 