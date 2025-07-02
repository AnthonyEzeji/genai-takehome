import React from 'react'
import { useState } from 'react'
import './App.css'
import TestSupabaseConnection from './TestSupabaseConnection'
import { NotesProvider } from './NotesContext'
import NoteForm from './NoteForm'
import TagFilter from './TagFilter'
import NotesList from './NotesList'
import AnalyticsDashboard from './AnalyticsDashboard'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation
} from 'react-router-dom'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert" aria-live="polite">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

function NotesPage() {
  const [selectedTag, setSelectedTag] = useState(null)
  const [editingNote, setEditingNote] = useState(null)
  return (
    <main className="notes-container fade-in-up" role="main">
      <h1 className="page-title">GenAI Notes</h1>
      <TestSupabaseConnection />
      <NoteForm editingNote={editingNote} onSave={() => setEditingNote(null)} />
      <TagFilter selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
      <NotesList selectedTag={selectedTag} onEdit={setEditingNote} />
    </main>
  )
}

function NavBar() {
  const location = useLocation();
  return (
    <nav className="flex gap-4 p-4 bg-gray-100 border-b mb-4" role="navigation" aria-label="Main navigation">
      <Link 
        to="/notes" 
        className={location.pathname === '/notes' ? 'font-bold text-blue-600' : ''}
        aria-current={location.pathname === '/notes' ? 'page' : undefined}
      >
        Notes
      </Link>
      <Link 
        to="/analytics" 
        className={location.pathname === '/analytics' ? 'font-bold text-blue-600' : ''}
        aria-current={location.pathname === '/analytics' ? 'page' : undefined}
      >
        Analytics
      </Link>
    </nav>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <NotesProvider>
        <Router>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <NavBar />
          <div id="main-content" className="main-content-wrapper">
            <Routes>
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/analytics" element={<AnalyticsDashboard />} />
              <Route path="*" element={<Navigate to="/notes" replace />} />
            </Routes>
          </div>
        </Router>
      </NotesProvider>
    </ErrorBoundary>
  )
}

export default App
