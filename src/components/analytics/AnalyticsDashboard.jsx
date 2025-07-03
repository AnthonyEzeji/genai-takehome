import React, { useEffect, useState } from 'react';
import { useNotes } from '../../contexts/NotesContext';
import { supabase } from '../../services/supabaseClient';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function getLastNDates(n) {
  const arr = [];
  const today = new Date();
  
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Use local date string to avoid timezone issues
    const dateString = d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    arr.push(dateString);
  }
  return arr;
}

// Helper function to get local date from timestamp
function getLocalDateFromTimestamp(timestamp) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
}

// Custom hook to fetch AI usage from database
function useAIUsageStats() {
  const [aiUsage, setAIUsage] = useState({ summarize: 0, autoTitle: 0, generate: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        setError(null);
        const { data, error } = await supabase
          .from('ai_usage')
          .select('feature');
        
        if (error) {
          console.error('Error fetching AI usage:', error);
          setError('Failed to load AI usage data');
          return;
        }

        const usage = { summarize: 0, autoTitle: 0, generate: 0 };
        data?.forEach(row => {
          if (usage.hasOwnProperty(row.feature)) {
            usage[row.feature]++;
          }
        });
        setAIUsage(usage);
      } catch (error) {
        console.error('Error fetching AI usage:', error);
        setError('Failed to load AI usage data');
      } finally {
        setLoading(false);
      }
    }

    fetchUsage();
  }, []);

  return { aiUsage, loading, error };
}

export default function AnalyticsDashboard() {
  const { notes } = useNotes();
  const { aiUsage, loading: aiLoading, error: aiError } = useAIUsageStats();

  // Notes created per day (last 7 days) - real-time from DB notes
  const last7 = getLastNDates(7);
  const notesPerDay = last7.map(date =>
    notes.filter(note => {
      const noteDate = getLocalDateFromTimestamp(note.created_at);
      return noteDate === date;
    }).length
  );

  // AI feature usage - real-time from DB
  const aiLabels = ['Summarize', 'Auto-Title', 'Generate'];
  const aiData = [aiUsage.summarize, aiUsage.autoTitle, aiUsage.generate];

  // Tag popularity (top 10) - always real-time from DB notes
  const tagCounts = {};
  notes.forEach(note => {
    (note.tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const tagEntries = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const tagLabels = tagEntries.map(([tag]) => tag);
  const tagData = tagEntries.map(([, count]) => count);

  return (
    <div className="main-content">
      <div className="app-header">
        <h1 className="app-title">Analytics Dashboard</h1>
        <p className="app-subtitle">Track your note-taking patterns and AI usage</p>
      </div>
      
      <div className="content-section" aria-labelledby="notes-chart-title">
        <div className="section-header">
          <h2 id="notes-chart-title" className="section-title">Notes Created (Last 7 Days)</h2>
          <p className="section-description">Daily note creation activity</p>
        </div>
        <div role="img" aria-label={`Bar chart showing notes created per day. Data: ${last7.map((date, i) => `${date}: ${notesPerDay[i]} notes`).join(', ')}`}>
          <Bar
            data={{
              labels: last7,
              datasets: [
                {
                  label: 'Notes Created',
                  data: notesPerDay,
                  backgroundColor: 'rgba(59, 130, 246, 0.6)',
                  borderColor: 'rgba(59, 130, 246, 1)',
                  borderWidth: 2,
                  borderRadius: 8,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { 
                legend: { display: false },
                tooltip: {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  titleColor: 'white',
                  bodyColor: 'white',
                  borderColor: 'rgba(59, 130, 246, 0.5)',
                  borderWidth: 1,
                  cornerRadius: 8,
                }
              },
              scales: { 
                y: { 
                  beginAtZero: true, 
                  precision: 0,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                  }
                },
                x: {
                  grid: {
                    display: false,
                  }
                }
              },
              animation: {
                duration: 1000,
                easing: 'easeInOutQuart',
              }
            }}
          />
        </div>
      </div>
      
      <div className="content-section" aria-labelledby="ai-usage-title">
        <div className="section-header">
          <h2 id="ai-usage-title" className="section-title">AI Feature Usage</h2>
          <p className="section-description">How often you use AI features</p>
        </div>
        {aiLoading ? (
          <div className="loading" role="status" aria-live="polite">
            <div className="spinner" aria-label="Loading AI usage data"></div>
            <p className="mt-2">Loading AI usage data...</p>
          </div>
        ) : aiError ? (
          <div className="p-4 bg-red-50 rounded border border-red-200" role="alert">
            <strong>Error:</strong> {aiError}
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-secondary ml-2"
            >
              Retry
            </button>
          </div>
        ) : (
          <div role="img" aria-label={`Pie chart showing AI feature usage. Data: ${aiLabels.map((label, i) => `${label}: ${aiData[i]} uses`).join(', ')}`}>
            <Pie
              data={{
                labels: aiLabels,
                datasets: [
                  {
                    data: aiData,
                    backgroundColor: [
                      'rgba(16, 185, 129, 0.7)',
                      'rgba(59, 130, 246, 0.7)',
                      'rgba(234, 179, 8, 0.7)',
                    ],
                    borderColor: [
                      'rgba(16, 185, 129, 1)',
                      'rgba(59, 130, 246, 1)',
                      'rgba(234, 179, 8, 1)',
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(59, 130, 246, 0.5)',
                    borderWidth: 1,
                    cornerRadius: 8,
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeInOutQuart',
                }
              }}
            />
          </div>
        )}
      </div>
      
      <div className="content-section" aria-labelledby="tag-popularity-title">
        <div className="section-header">
          <h2 id="tag-popularity-title" className="section-title">Tag Popularity (Top 10)</h2>
          <p className="section-description">Most frequently used tags</p>
        </div>
        {tagLabels.length > 0 ? (
          <>
            <div role="img" aria-label={`Bar chart showing tag popularity. Data: ${tagLabels.map((tag, i) => `${tag}: ${tagData[i]} notes`).join(', ')}`}>
              <Bar
                data={{
                  labels: tagLabels,
                  datasets: [
                    {
                      label: 'Tag Count',
                      data: tagData,
                      backgroundColor: 'rgba(234, 88, 12, 0.6)',
                      borderColor: 'rgba(234, 88, 12, 1)',
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { 
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      titleColor: 'white',
                      bodyColor: 'white',
                      borderColor: 'rgba(234, 88, 12, 0.5)',
                      borderWidth: 1,
                      cornerRadius: 8,
                    }
                  },
                  scales: { 
                    y: { 
                      beginAtZero: true, 
                      precision: 0,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      }
                    },
                    x: {
                      grid: {
                        display: false,
                      }
                    }
                  },
                  animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart',
                  }
                }}
              />
            </div>
            <div className="tags-container mt-4" aria-label="Tag labels" role="list">
              {tagLabels.map(tag => (
                <span key={tag} className="tag" role="listitem">
                  {tag}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state" role="status">
            <div className="empty-state-icon" aria-hidden="true">📊</div>
            <p>No tag data available</p>
            <p className="text-sm">Create notes with tags to see analytics!</p>
          </div>
        )}
      </div>
    </div>
  );
} 