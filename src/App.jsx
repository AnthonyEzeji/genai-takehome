import React from 'react'
import { useState } from 'react'
import './styles/App.css'
import { NotesProvider } from './contexts/NotesContext'
import LandingPage from './components/LandingPage'
import Footer from './components/Footer'
import NoteForm from './components/notes/NoteForm'
import TagFilter from './components/notes/TagFilter'
import NotesList from './components/notes/NotesList'
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard'
import SemanticSearch from './components/notes/SemanticSearch'
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
        <div className="content-section" role="alert" aria-live="polite">
          <div className="section-header">
            <h2 className="section-title">Something went wrong</h2>
            <p className="section-description">We're sorry, but something unexpected happened. Please try refreshing the page.</p>
          </div>
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
  const [showSemanticSearch, setShowSemanticSearch] = useState(false);
  const [highlightedNoteId, setHighlightedNoteId] = useState(null);

  function handleSemanticNoteSelect(note) {
    setShowSemanticSearch(false);
    setHighlightedNoteId(note.id);
    // Optionally scroll to the note in the list
    setTimeout(() => {
      const el = document.getElementById(`note-${note.id}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  return (
    <div className="main-content">
      <div className="app-header">
        <h1 className="app-title">GenAI Notes</h1>
        <p className="app-subtitle">Your AI-powered note-taking companion</p>
      </div>
      
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Create Note</h2>
          <p className="section-description">Add a new note with AI assistance</p>
        </div>
        <NoteForm editingNote={editingNote} onSave={() => setEditingNote(null)} />
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Filter Notes</h2>
          <p className="section-description">Filter notes by tags</p>
        </div>
        <TagFilter selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">AI Search</h2>
          <p className="section-description">Search notes using AI-powered semantic search</p>
        </div>
        <button
          className="btn btn-primary mb-4"
          onClick={() => setShowSemanticSearch((v) => !v)}
          aria-pressed={showSemanticSearch}
          aria-controls="semantic-search-section"
        >
          {showSemanticSearch ? 'Hide AI Search' : 'Show AI Search'}
        </button>
        {showSemanticSearch && (
          <div id="semantic-search-section" className="mb-4">
            <SemanticSearch onNoteSelect={handleSemanticNoteSelect} />
          </div>
        )}
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Your Notes</h2>
          <p className="section-description">View and manage your notes</p>
        </div>
        <NotesList 
          selectedTag={selectedTag} 
          onEdit={setEditingNote} 
          highlightedNoteId={highlightedNoteId}
        />
      </div>
    </div>
  )
}

function NavBar() {
  const location = useLocation();
  return (
    <div className="nav-tabs" role="navigation" aria-label="Main navigation">
      <Link 
        to="/" 
        className={`nav-tab ${location.pathname === '/' ? 'active' : ''}`}
        aria-current={location.pathname === '/' ? 'page' : undefined}
      >
        Home
      </Link>
      <Link 
        to="/notes" 
        className={`nav-tab ${location.pathname === '/notes' ? 'active' : ''}`}
        aria-current={location.pathname === '/notes' ? 'page' : undefined}
      >
        Notes
      </Link>
      <Link 
        to="/analytics" 
        className={`nav-tab ${location.pathname === '/analytics' ? 'active' : ''}`}
        aria-current={location.pathname === '/analytics' ? 'page' : undefined}
      >
        Analytics
      </Link>
    </div>
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
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/notes" element={
              <>
                <NavBar />
                <div id="main-content">
                  <NotesPage />
                </div>
                <Footer />
              </>
            } />
            <Route path="/analytics" element={
              <>
                <NavBar />
                <div id="main-content">
                  <AnalyticsDashboard />
                </div>
                <Footer />
              </>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </NotesProvider>
    </ErrorBoundary>
  )
}

export default App
