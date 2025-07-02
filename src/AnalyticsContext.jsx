import React, { createContext, useContext, useEffect, useState } from 'react';

const AnalyticsContext = createContext();

const defaultAnalytics = {
  notesCreated: {}, // { '2024-06-01': 3, ... }
  aiUsage: { summarize: 0, autoTitle: 0, generate: 0 },
  tagCounts: {}, // { tag: count }
};

function loadAnalytics() {
  try {
    const data = localStorage.getItem('analytics');
    return data ? JSON.parse(data) : defaultAnalytics;
  } catch {
    return defaultAnalytics;
  }
}

function saveAnalytics(data) {
  localStorage.setItem('analytics', JSON.stringify(data));
}

export function AnalyticsProvider({ children }) {
  const [analytics, setAnalytics] = useState(loadAnalytics());

  useEffect(() => {
    saveAnalytics(analytics);
  }, [analytics]);

  function logNoteCreated(date, tags) {
    setAnalytics(prev => {
      const d = date.split('T')[0];
      const notesCreated = { ...prev.notesCreated, [d]: (prev.notesCreated[d] || 0) + 1 };
      const tagCounts = { ...prev.tagCounts };
      (tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
      return { ...prev, notesCreated, tagCounts };
    });
  }

  function logAIUsage(type) {
    setAnalytics(prev => ({
      ...prev,
      aiUsage: { ...prev.aiUsage, [type]: (prev.aiUsage[type] || 0) + 1 },
    }));
  }

  const value = {
    analytics,
    logNoteCreated,
    logAIUsage,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
} 