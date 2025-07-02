import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TestSupabaseConnection from './TestSupabaseConnection'
import { NotesProvider } from './NotesContext'
import NotesList from './NotesList'
import NoteForm from './NoteForm'
import TagFilter from './TagFilter'

function App() {
  const [count, setCount] = useState(0)
  const [selectedTag, setSelectedTag] = useState(null)
  const [editingNote, setEditingNote] = useState(null)

  return (
    <NotesProvider>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <TestSupabaseConnection />
      <NoteForm editingNote={editingNote} onSave={() => setEditingNote(null)} />
      <TagFilter selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
      <NotesList selectedTag={selectedTag} onEdit={setEditingNote} />
      {/* Notes List UI will go here */}
    </NotesProvider>
  )
}

export default App
