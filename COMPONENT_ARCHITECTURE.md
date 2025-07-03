# Component Architecture & Data Flow

## Overview

This document explains how all components in the GenAI Notes application connect to each other, the data flow patterns, and the overall architecture. Understanding these connections is crucial for debugging, extending, and maintaining the application.

## 🏗️ High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Landing Page  │    │   Notes Page    │    │ Analytics Page  │
│   (Marketing)   │    │  (Main App)     │    │   (Dashboard)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  NotesContext   │
                    │  (State Mgmt)   │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Services      │
                    │ (AI, Supabase)  │
                    └─────────────────┘
```

## 🔄 Data Flow Patterns

### 1. Context-Based State Management
The application uses React Context API for global state management through `NotesContext`. This provides:
- **Centralized State**: All note data, loading states, and UI state
- **Shared Functions**: CRUD operations, AI functions, and search capabilities
- **Real-time Updates**: Automatic UI updates when data changes

### 2. Service Layer Pattern
External integrations are abstracted through service modules:
- **`ai.js`**: OpenAI API interactions (title generation, content expansion, summarization)
- **`embeddings.js`**: Vector search and semantic similarity
- **`supabaseClient.js`**: Database operations and real-time subscriptions

## 📱 Component Hierarchy & Connections

### App.jsx (Root Component)
**Purpose**: Main application router and layout coordinator

**Key Responsibilities**:
- Route management between Landing, Notes, and Analytics pages
- Error boundary implementation
- Navigation bar rendering
- Footer placement

**Component Connections**:
```jsx
<Router>
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/notes" element={
      <>
        <NavBar />
        <NotesPage />
        <Footer />
      </>
    } />
    <Route path="/analytics" element={
      <>
        <NavBar />
        <AnalyticsDashboard />
        <Footer />
      </>
    } />
  </Routes>
</Router>
```

**Data Flow**:
- Receives no props
- Provides routing context to child components
- Handles navigation state through `useLocation` hook

### LandingPage.jsx
**Purpose**: Marketing page with demo functionality

**Key Responsibilities**:
- Showcase application features
- Provide demo interface (non-interactive)
- Navigation to main application

**Component Connections**:
```jsx
<LandingPage>
  <nav className="landing-nav">
    <Link to="/notes" /> {/* Navigation to main app */}
  </nav>
  <div className="demo-card">
    <textarea readOnly /> {/* Demo textarea */}
    <button disabled /> {/* Demo button */}
  </div>
</LandingPage>
```

**Data Flow**:
- Static content with no dynamic data
- Uses React Router for navigation
- Demo components are read-only with disabled interactions

### NotesPage.jsx (Main Application)
**Purpose**: Core note-taking interface

**Key Responsibilities**:
- Orchestrates all note-related components
- Manages local state for UI interactions
- Coordinates between form, list, and search components

**Component Connections**:
```jsx
<NotesPage>
  <div className="app-header">
    <h1>GenAI Notes</h1>
  </div>
  <div className="content-section">
    <NoteForm 
      editingNote={editingNote}
      onSave={() => setEditingNote(null)}
    />
  </div>
  <div className="content-section">
    <TagFilter 
      selectedTag={selectedTag}
      setSelectedTag={setSelectedTag}
    />
  </div>
  <div className="content-section">
    <SemanticSearch 
      onNoteSelect={handleSemanticNoteSelect}
    />
  </div>
  <div className="content-section">
    <NotesList 
      selectedTag={selectedTag}
      onEdit={setEditingNote}
      highlightedNoteId={highlightedNoteId}
    />
  </div>
</NotesPage>
```

**Data Flow**:
- **State Management**: Uses local state for UI interactions
- **Props Passing**: Passes state and callbacks to child components
- **Event Handling**: Receives events from child components and updates state
- **Context Integration**: Consumes `NotesContext` for data operations

**Key State Variables**:
```jsx
const [selectedTag, setSelectedTag] = useState(null)
const [editingNote, setEditingNote] = useState(null)
const [showSemanticSearch, setShowSemanticSearch] = useState(false)
const [highlightedNoteId, setHighlightedNoteId] = useState(null)
```

### NoteForm.jsx
**Purpose**: Note creation and editing interface

**Key Responsibilities**:
- Form validation and submission
- AI integration for title and content generation
- Tag management
- Real-time form state management

**Component Connections**:
```jsx
<NoteForm>
  <input /> {/* Title input */}
  <textarea /> {/* Content textarea */}
  <TagInput 
    tags={tags}
    setTags={setTags}
  />
  <textarea /> {/* Shorthand textarea */}
  <button /> {/* AI generation buttons */}
</NoteForm>
```

**Data Flow**:
- **Input**: Receives `editingNote` and `onSave` props
- **State**: Manages form state locally (title, content, tags, shorthand)
- **AI Integration**: Calls AI services for title and content generation
- **Context**: Uses `NotesContext` for CRUD operations
- **Output**: Calls `onSave` callback when form is submitted

**Key Functions**:
```jsx
// AI Title Generation
async function handleAutoTitle() {
  const aiTitle = await autoTitleNote(content)
  setTitle(aiTitle)
}

// AI Content Generation
async function handleGenerateFromShorthand() {
  const aiContent = await generateNoteFromShorthand(shorthand)
  setContent(aiContent)
}

// Form Submission
async function handleSubmit(e) {
  if (editingNote) {
    await updateNote(editingNote.id, { title, content, tags })
  } else {
    await createNote({ title, content, tags })
  }
  onSave()
}
```

### TagInput.jsx
**Purpose**: Tag management component

**Key Responsibilities**:
- Add/remove tags
- Tag input validation
- Keyboard navigation support

**Component Connections**:
```jsx
<TagInput>
  <div className="tags-container">
    {tags.map(tag => (
      <span className="tag">
        {tag}
        <button onClick={() => removeTag(tag)} />
      </span>
    ))}
  </div>
  <input 
    value={input}
    onChange={setInput}
    onKeyDown={handleKeyDown}
  />
  <button onClick={addTag} />
</TagInput>
```

**Data Flow**:
- **Input**: Receives `tags` array and `setTags` function
- **State**: Manages local input state
- **Output**: Updates parent's tags state through `setTags`

### NotesList.jsx
**Purpose**: Display and manage list of notes

**Key Responsibilities**:
- Render note cards
- Handle note interactions (edit, delete, summarize)
- Filter notes by tags
- Highlight search results

**Component Connections**:
```jsx
<NotesList>
  {notes.map(note => (
    <div className="note-card">
      <div className="note-header">
        <h3>{note.title}</h3>
        <div className="note-meta">
          <span>{note.created_at}</span>
          <span>{note.tags.join(', ')}</span>
        </div>
      </div>
      <div className="note-content">
        {note.content}
      </div>
      <div className="note-actions">
        <button onClick={() => onEdit(note)} />
        <button onClick={() => deleteNote(note.id)} />
        <button onClick={() => summarizeNote(note.id)} />
      </div>
    </div>
  ))}
</NotesList>
```

**Data Flow**:
- **Input**: Receives `selectedTag`, `onEdit`, and `highlightedNoteId` props
- **Context**: Consumes `NotesContext` for note data and operations
- **Filtering**: Filters notes based on `selectedTag`
- **Output**: Calls `onEdit` callback when edit button is clicked

**Key Logic**:
```jsx
// Filter notes by selected tag
const filteredNotes = selectedTag 
  ? notes.filter(note => note.tags.includes(selectedTag))
  : notes

// Highlight search results
const isHighlighted = note.id === highlightedNoteId
```

### SemanticSearch.jsx
**Purpose**: AI-powered semantic search interface

**Key Responsibilities**:
- Query input and processing
- Vector search execution
- Result display and selection
- Search performance optimization

**Component Connections**:
```jsx
<SemanticSearch>
  <input 
    value={query}
    onChange={setQuery}
    placeholder="Search notes semantically..."
  />
  <div className="search-results">
    {results.map(result => (
      <div 
        className="search-result"
        onClick={() => onNoteSelect(result)}
      >
        <h4>{result.title}</h4>
        <p>{result.content}</p>
        <span>Similarity: {result.similarity}</span>
      </div>
    ))}
  </div>
</SemanticSearch>
```

**Data Flow**:
- **Input**: Receives `onNoteSelect` callback
- **State**: Manages query and results state locally
- **Search**: Calls `searchNotes` function from embeddings service
- **Output**: Calls `onNoteSelect` when a result is clicked

**Key Functions**:
```jsx
// Semantic search execution
async function handleSearch() {
  if (query.trim()) {
    const results = await searchNotes(query)
    setResults(results)
  }
}

// Result selection
function handleResultSelect(note) {
  onNoteSelect(note)
  setQuery('')
  setResults([])
}
```

### SearchDebugger.jsx
**Purpose**: Debug and analyze semantic search performance

**Key Responsibilities**:
- Test search queries
- Analyze similarity scores
- Performance monitoring
- Search quality assessment

**Component Connections**:
```jsx
<SearchDebugger>
  <input 
    value={testQuery}
    onChange={setTestQuery}
  />
  <button onClick={testSearch} />
  <div className="debug-results">
    {debugResults.map(result => (
      <div className="debug-result">
        <span>Query: {result.query}</span>
        <span>Results: {result.count}</span>
        <span>Time: {result.time}ms</span>
      </div>
    ))}
  </div>
</SearchDebugger>
```

**Data Flow**:
- **State**: Manages test queries and debug results locally
- **Testing**: Executes search queries and measures performance
- **Analysis**: Displays similarity scores and response times

### TagFilter.jsx
**Purpose**: Filter notes by tags

**Key Responsibilities**:
- Display available tags
- Handle tag selection
- Visual feedback for active filters

**Component Connections**:
```jsx
<TagFilter>
  <div className="tags-container">
    {allTags.map(tag => (
      <span 
        className={`tag ${selectedTag === tag ? 'active' : ''}`}
        onClick={() => setSelectedTag(tag)}
      >
        {tag}
      </span>
    ))}
  </div>
</TagFilter>
```

**Data Flow**:
- **Input**: Receives `selectedTag` and `setSelectedTag` props
- **Context**: Consumes `NotesContext` to get all available tags
- **Output**: Updates parent's selected tag through `setSelectedTag`

### AnalyticsDashboard.jsx
**Purpose**: Display analytics and insights

**Key Responsibilities**:
- Fetch and display analytics data
- Render charts and metrics
- Real-time data updates

**Component Connections**:
```jsx
<AnalyticsDashboard>
  <div className="analytics-grid">
    <div className="analytics-card">
      <div className="analytics-number">{totalNotes}</div>
      <div className="analytics-label">Total Notes</div>
    </div>
    <div className="analytics-card">
      <div className="analytics-number">{totalTags}</div>
      <div className="analytics-label">Unique Tags</div>
    </div>
    {/* More analytics cards */}
  </div>
</AnalyticsDashboard>
```

**Data Flow**:
- **Context**: Consumes `NotesContext` for analytics data
- **State**: Manages loading states locally
- **Real-time**: Automatically updates when data changes

## 🔄 Context & State Management

### NotesContext.jsx
**Purpose**: Global state management for the entire application

**Key Responsibilities**:
- Centralized note data storage
- CRUD operations for notes
- AI service integration
- Real-time data synchronization

**State Structure**:
```jsx
const [notes, setNotes] = useState([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
```

**Key Functions**:
```jsx
// CRUD Operations
const createNote = async (noteData) => {
  // Create note in database
  // Generate embeddings
  // Update local state
}

const updateNote = async (id, updates) => {
  // Update note in database
  // Regenerate embeddings if content changed
  // Update local state
}

const deleteNote = async (id) => {
  // Delete from database
  // Remove from local state
}

// AI Operations
const summarizeNote = async (id) => {
  // Get note content
  // Call AI service
  // Update note with summary
}

// Search Operations
const searchNotes = async (query) => {
  // Generate query embeddings
  // Perform vector search
  // Return results
}
```

**Data Flow**:
- **Provider**: Wraps the entire application
- **Consumers**: All components that need note data
- **Real-time**: Supabase subscriptions for live updates
- **Caching**: Local state for performance

## 🔌 Service Layer Architecture

### ai.js
**Purpose**: OpenAI API integration

**Key Functions**:
```jsx
// Title generation
export async function autoTitleNote(content) {
  return callOpenAI([
    { role: 'system', content: 'Generate concise title...' },
    { role: 'user', content: `Generate title for: ${content}` }
  ], { max_tokens: 16 })
}

// Content generation from shorthand
export async function generateNoteFromShorthand(shorthand) {
  return callOpenAI([
    { role: 'system', content: 'Expand shorthand into full note...' },
    { role: 'user', content: `Expand: ${shorthand}` }
  ], { max_tokens: 1000 })
}

// Note summarization
export async function summarizeNote(content) {
  return callOpenAI([
    { role: 'system', content: 'Summarize this note...' },
    { role: 'user', content: `Summarize: ${content}` }
  ], { max_tokens: 100 })
}
```

**Data Flow**:
- **Input**: Receives text content from components
- **Processing**: Sends requests to OpenAI API
- **Output**: Returns AI-generated content
- **Error Handling**: Graceful fallbacks and retry logic

### embeddings.js
**Purpose**: Vector search and semantic similarity

**Key Functions**:
```jsx
// Generate embeddings for text
export async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  })
  return response.data[0].embedding
}

// Search notes by semantic similarity
export async function searchNotes(query, threshold = 0.7) {
  const queryEmbedding = await generateEmbedding(query)
  const results = await supabase.rpc('match_notes', {
    query_embedding: queryEmbedding,
    match_threshold: threshold
  })
  return results.data
}
```

**Data Flow**:
- **Input**: Receives search queries from components
- **Processing**: Generates embeddings and performs vector search
- **Output**: Returns ranked search results with similarity scores
- **Performance**: Optimized with HNSW indexing and cosine similarity

### supabaseClient.js
**Purpose**: Database operations and real-time subscriptions

**Key Functions**:
```jsx
// Database operations
export const supabase = createClient(url, key)

// Real-time subscriptions
export function subscribeToNotes(callback) {
  return supabase
    .channel('notes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notes' }, callback)
    .subscribe()
}
```

**Data Flow**:
- **Connection**: Establishes connection to Supabase
- **Operations**: Handles all database CRUD operations
- **Real-time**: Manages subscriptions for live updates
- **Error Handling**: Provides consistent error handling

## 🔄 Event Flow Patterns

### 1. User Interaction Flow
```
User clicks "Generate" button
    ↓
NoteForm.handleGenerateFromShorthand()
    ↓
ai.js.generateNoteFromShorthand()
    ↓
OpenAI API call
    ↓
Response received
    ↓
setContent(aiContent)
    ↓
UI updates with generated content
```

### 2. Search Flow
```
User types in search box
    ↓
SemanticSearch.handleSearch()
    ↓
embeddings.js.searchNotes()
    ↓
Generate query embedding
    ↓
Vector search in database
    ↓
Return ranked results
    ↓
setResults(results)
    ↓
Display search results
```

### 3. Note Creation Flow
```
User submits note form
    ↓
NoteForm.handleSubmit()
    ↓
NotesContext.createNote()
    ↓
supabaseClient.insert()
    ↓
Generate embeddings
    ↓
Update local state
    ↓
Real-time subscription triggers
    ↓
All components update
```

### 4. Tag Filtering Flow
```
User clicks tag
    ↓
TagFilter.setSelectedTag()
    ↓
Parent component updates state
    ↓
NotesList receives new selectedTag
    ↓
Filter notes array
    ↓
Re-render filtered notes
```

## 🎯 Key Integration Points

### 1. Context Integration
All components that need note data consume `NotesContext`:
```jsx
const { notes, createNote, updateNote, deleteNote } = useNotes()
```

### 2. Props Passing
Parent components pass state and callbacks to children:
```jsx
<NotesList 
  selectedTag={selectedTag}
  onEdit={setEditingNote}
  highlightedNoteId={highlightedNoteId}
/>
```

### 3. Event Handling
Child components call parent callbacks:
```jsx
// In child component
onEdit(note)

// In parent component
const handleEdit = (note) => setEditingNote(note)
```

### 4. Service Integration
Components call service functions for external operations:
```jsx
// AI operations
const aiTitle = await autoTitleNote(content)

// Search operations
const results = await searchNotes(query)

// Database operations
await createNote(noteData)
```

## 🧪 Testing Architecture & Strategy

### Comprehensive Testing Pyramid

The application implements a robust three-layer testing strategy:

#### 1. Unit Tests (Foundation Layer)
**Purpose**: Test individual components and functions in isolation

**Test Files & Coverage**:
- `App.test.jsx` - Main application routing and navigation
- `NoteForm.test.jsx` - Form validation, AI integration, error handling
- `NotesList.test.jsx` - Note display, CRUD operations, filtering
- `SemanticSearch.test.jsx` - Vector search functionality and edge cases
- `ai.test.js` - AI service integration and error scenarios
- `TestCopy.test.js` - Utility functions and helpers

**Key Testing Patterns**:
```jsx
// Component Testing with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NotesProvider } from '../contexts/NotesContext'

describe('NoteForm', () => {
  it('should create a note with AI-generated title', async () => {
    render(
      <NotesProvider>
        <NoteForm />
      </NotesProvider>
    )
    
    fireEvent.change(screen.getByPlaceholder('Enter note content'), {
      target: { value: 'Meeting notes about project timeline' }
    })
    fireEvent.click(screen.getByText('Auto-Title'))
    
    await waitFor(() => {
      expect(screen.getByPlaceholder('Enter note title')).toHaveValue()
    })
  })
})
```

#### 2. Integration Tests (Middle Layer)
**Purpose**: Test component interactions and data flow

**Test Scenarios**:
- Context provider integration
- Service layer interactions
- Component communication patterns
- State management flows
- Error handling across components

**Integration Test Example**:
```jsx
describe('Notes Integration', () => {
  it('should update all components when note is created', async () => {
    render(
      <NotesProvider>
        <NotesPage />
      </NotesProvider>
    )
    
    // Create note
    fireEvent.change(screen.getByPlaceholder('Enter note title'), {
      target: { value: 'Test Note' }
    })
    fireEvent.click(screen.getByText('Add Note'))
    
    // Verify note appears in list
    expect(screen.getByText('Test Note')).toBeInTheDocument()
    
    // Verify tag filter updates
    expect(screen.getByText('test')).toBeInTheDocument()
  })
})
```

#### 3. End-to-End Tests (Top Layer)
**Purpose**: Test complete user journeys in real browser environment

**E2E Test Suite Structure**:
```
cypress/e2e/
├── smoke.cy.js              # Basic functionality verification
├── navigation.cy.js          # Route handling and navigation
├── note-creation.cy.js       # CRUD operations and validation
├── ai-features.cy.js         # AI integration and workflows
├── tag-filtering.cy.js       # Dynamic filtering and state
├── analytics.cy.js           # Data visualization and updates
├── error-handling.cy.js      # Network errors and recovery
└── accessibility.cy.js       # WCAG compliance and usability
```

**E2E Test Example**:
```javascript
describe('AI Features', () => {
  it('should complete full AI-assisted note creation workflow', () => {
    cy.visit('/notes')
    
    // Generate content from shorthand
    cy.get('[placeholder="Enter bullet points or shorthand to generate content"]')
      .type('Weekly team meeting:\n- Discussed project progress\n- Planned next sprint')
    cy.contains('Generate').click()
    
    // Wait for content generation
    cy.get('[placeholder="Enter note content"]', { timeout: 15000 })
      .should('not.have.value', '')
    
    // Generate title from content
    cy.contains('Auto-Title').click()
    cy.get('[placeholder="Enter note title"]', { timeout: 15000 })
      .should('not.have.value', '')
    
    // Save the note
    cy.contains('Add Note').click()
    cy.get('[placeholder="Enter note title"]').should('have.value', '')
  })
})
```

### Test Configuration & Setup

#### Unit Testing (Vitest)
```javascript
// vitest.config.js
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  }
})

// vitest.setup.js
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock external services
vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: [], error: null }),
      update: () => ({ data: [], error: null }),
      delete: () => ({ data: [], error: null })
    })
  }
}))

vi.mock('../services/ai', () => ({
  autoTitleNote: vi.fn().mockResolvedValue('AI Generated Title'),
  generateNoteFromShorthand: vi.fn().mockResolvedValue('AI Generated Content')
}))
```

#### E2E Testing (Cypress)
```javascript
// cypress.config.js
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // Custom event handlers for test orchestration
    }
  }
})
```

### Testing Best Practices

#### Component Testing
- **Isolation**: Test components in isolation with mocked dependencies
- **User Behavior**: Test from user perspective, not implementation details
- **Accessibility**: Include accessibility testing in component tests
- **Error Scenarios**: Test error states and edge cases
- **Async Operations**: Properly handle async operations with `waitFor`

#### E2E Testing
- **Real User Flows**: Test complete user journeys
- **Cross-Browser**: Test across multiple browsers
- **Mobile Testing**: Include mobile viewport testing
- **Performance**: Monitor loading times and responsiveness
- **Network Conditions**: Test with different network conditions

#### Test Data Management
- **Isolation**: Each test creates its own test data
- **Cleanup**: Proper cleanup after each test
- **Consistency**: Use consistent test data across tests
- **Realistic Data**: Use realistic data that matches production

### Error Handling Testing

#### Network Error Scenarios
```javascript
// Mock network failures
cy.intercept('POST', '**/openai/**', { forceNetworkError: true }).as('aiError')

// Test error recovery
cy.contains('Auto-Title').click()
cy.contains('Error', { timeout: 10000 }).should('be.visible')
cy.contains('Retry').click()
```

#### API Error Responses
```javascript
// Mock API errors
cy.intercept('POST', '**/openai/**', { 
  statusCode: 429, 
  body: { error: { message: 'Rate limit exceeded' } } 
}).as('rateLimitError')
```

#### Input Validation
```javascript
// Test form validation
cy.get('[placeholder="Enter note content"]').type('Content without title')
cy.contains('Add Note').should('be.disabled')
```

### Performance Testing

#### Loading State Testing
```javascript
// Test loading states during AI operations
cy.get('[placeholder="Enter note content"]').type('Test content')
cy.contains('Auto-Title').click()
cy.contains('Generating...').should('be.visible')
```

#### Response Time Validation
```javascript
// Monitor API response times
cy.intercept('POST', '**/openai/**', (req) => {
  req.reply({
    delay: 2000,
    statusCode: 200,
    body: { choices: [{ message: { content: 'Generated Title' } }] }
  })
}).as('slowAI')
```

### Accessibility Testing

#### Keyboard Navigation
```javascript
// Test keyboard accessibility
cy.get('body').tab()
cy.focused().should('exist')
cy.get('body').type('{enter}')
```

#### Screen Reader Support
```javascript
// Test ARIA labels and landmarks
cy.get('[placeholder="Enter note title"]').should('have.attr', 'aria-label')
cy.get('nav').should('exist')
cy.get('main').should('exist')
```

## 🔧 Debugging & Troubleshooting

### Common Issues & Solutions

1. **State Synchronization Issues**
   - Check if components are properly consuming `NotesContext`
   - Verify real-time subscriptions are active
   - Ensure proper error handling in async operations

2. **AI Service Failures**
   - Check OpenAI API key configuration
   - Verify network connectivity
   - Review error handling and retry logic

3. **Search Performance Issues**
   - Monitor embedding generation times
   - Check database indexing (HNSW)
   - Verify similarity thresholds

4. **Component Re-rendering Issues**
   - Check for unnecessary re-renders
   - Verify proper use of React.memo and useCallback
   - Review state management patterns

5. **Test Environment Issues**
   - Verify all mocks are properly configured
   - Check test data isolation and cleanup
   - Ensure consistent test environment setup

### Debug Tools

1. **SearchDebugger Component**: Analyze search performance
2. **Browser DevTools**: Monitor network requests and state changes
3. **React DevTools**: Inspect component hierarchy and props
4. **Console Logging**: Track data flow and function calls
5. **Cypress Test Runner**: Interactive E2E test debugging
6. **Vitest UI**: Interactive unit test debugging and coverage analysis

## 🚀 Extension Points

### Adding New Features

1. **New AI Features**: Add functions to `ai.js`
2. **New Components**: Create in appropriate directory and integrate with context
3. **New Analytics**: Extend `AnalyticsDashboard.jsx`
4. **New Search Types**: Add to `embeddings.js`

### Performance Optimizations

1. **Memoization**: Use React.memo for expensive components
2. **Lazy Loading**: Implement code splitting for large components
3. **Caching**: Cache AI responses and search results
4. **Debouncing**: Debounce search inputs and AI requests

This architecture provides a solid foundation for understanding, debugging, and extending the GenAI Notes application. Each component has clear responsibilities and well-defined interfaces, making the codebase maintainable and scalable.
