import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock localStorage for analytics
beforeEach(() => {
  localStorage.clear();
});

// Mock AI services
vi.mock('../services/ai', () => ({
  autoTitleNote: vi.fn().mockResolvedValue('AI Title'),
  generateNoteFromShorthand: vi.fn().mockResolvedValue('AI Content'),
}));

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: () => ({
      select: () => ({ 
        order: () => ({ 
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              title: 'Welcome to GenAI Notes!',
              content: 'This is a demo note. You can edit or delete it, or create your own.',
              tags: ['demo', 'welcome'],
              created_at: new Date().toISOString(),
            }
          ], 
          error: null 
        }) 
      }),
      insert: () => ({ select: () => ({ data: [{}], error: null }) }),
      update: () => ({ eq: () => ({ select: () => ({ data: [{}], error: null }) }) }),
      delete: () => ({ eq: () => ({ error: null }) })
    })
  }
}));

vi.mock('../services/embeddings', () => ({
  storeNoteWithEmbedding: vi.fn(async (note) => ({ ...note, id: 'mock-id' })),
  updateNoteEmbedding: vi.fn(),
  searchNotesBySimilarity: vi.fn(async () => []),
}));

// Mock Chart.js to prevent canvas errors in tests
vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
  Pie: () => <div data-testid="pie-chart">Pie Chart</div>,
}));

describe('App routing', () => {
  it('renders without crashing', () => {
    render(<App />);
    // Just check that the app renders without throwing an error
    expect(document.body).toBeInTheDocument();
  });

  it('renders landing page on root route', () => {
    render(<App />);
    expect(screen.getAllByText(/Transform Your Notes with AI/i).length).toBeGreaterThan(0);
  });

  it('renders notes page on /notes route', () => {
    // Navigate to /notes route
    window.history.pushState({}, '', '/notes');
    render(<App />);
    expect(screen.getByText(/Create Note/i)).toBeInTheDocument();
  });

  it('renders analytics page on /analytics route', () => {
    // Navigate to /analytics route
    window.history.pushState({}, '', '/analytics');
    render(<App />);
    expect(screen.getByText(/Analytics Dashboard/i)).toBeInTheDocument();
  });
}); 