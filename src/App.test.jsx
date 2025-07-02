import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock localStorage for analytics
beforeEach(() => {
  localStorage.clear();
});

describe('App routing', () => {
  it('renders notes page by default', () => {
    render(<App />);
    expect(screen.getAllByText(/Vite \+ React/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notes/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Analytics/i).length).toBeGreaterThan(0);
  });

  it('navigates to analytics page', () => {
    render(<App />);
    fireEvent.click(screen.getAllByText('Analytics')[0]);
    expect(screen.getAllByText(/Analytics Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notes Created/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AI Feature Usage/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tag Popularity/i).length).toBeGreaterThan(0);
  });

  it('navigates back to notes page', () => {
    render(<App />);
    fireEvent.click(screen.getAllByText('Analytics')[0]);
    fireEvent.click(screen.getAllByText('Notes')[0]);
    expect(screen.getAllByText(/Vite \+ React/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notes/i).length).toBeGreaterThan(0);
  });
});

describe('AnalyticsDashboard', () => {
  it('renders analytics charts and headings', () => {
    render(<App />);
    fireEvent.click(screen.getAllByText('Analytics')[0]);
    expect(screen.getAllByText(/Analytics Dashboard/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Notes Created/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AI Feature Usage/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Tag Popularity/i).length).toBeGreaterThan(0);
  });

  it('shows tag names in tag popularity chart', () => {
    // Seed analytics in localStorage with tagCounts
    localStorage.setItem('analytics', JSON.stringify({
      notesCreated: {},
      aiUsage: { summarize: 0, autoTitle: 0, generate: 0 },
      tagCounts: { demo: 3, ai: 2, welcome: 1 }
    }));
    render(<App />);
    fireEvent.click(screen.getAllByText('Analytics')[0]);
    // The tag names should appear in the document
    expect(screen.getByText('demo')).toBeInTheDocument();
    expect(screen.getByText('ai')).toBeInTheDocument();
    expect(screen.getByText('welcome')).toBeInTheDocument();
  });
}); 