import React from 'react'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import TestSupabaseConnection from './TestSupabaseConnection'
import { NotesProvider } from './NotesContext'
import NoteForm from './NoteForm'
import TagFilter from './TagFilter'
import NotesList from './NotesList'
import { AnalyticsProvider } from './AnalyticsContext'
import AnalyticsDashboard from './AnalyticsDashboard'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from 'react-router-dom'

function NotesPage() {
  const [count, setCount] = useState(0)
  const [selectedTag, setSelectedTag] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  return (
    <div>
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
    </div>
  )
}

function NavBar() {
  const location = useLocation();
  return (
    <nav className="flex gap-4 p-4 bg-gray-100 border-b mb-4">
      <Link to="/notes" className={location.pathname === '/notes' ? 'font-bold text-blue-600' : ''}>Notes</Link>
      <Link to="/analytics" className={location.pathname === '/analytics' ? 'font-bold text-blue-600' : ''}>Analytics</Link>
    </nav>
  )
}

function App() {
  return (
    <AnalyticsProvider>
      <NotesProvider>
        <Router>
          <NavBar />
          <Routes>
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="*" element={<Navigate to="/notes" replace />} />
          </Routes>
        </Router>
      </NotesProvider>
    </AnalyticsProvider>
  )
}

export default App
