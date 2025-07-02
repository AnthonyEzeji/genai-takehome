import React from 'react';
import { useAnalytics } from './AnalyticsContext';
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
    arr.push(d.toISOString().split('T')[0]);
  }
  return arr;
}

export default function AnalyticsDashboard() {
  const { analytics } = useAnalytics();

  // Notes created per day (last 7 days)
  const last7 = getLastNDates(7);
  const notesPerDay = last7.map(d => analytics.notesCreated[d] || 0);

  // AI feature usage
  const aiLabels = ['Summarize', 'Auto-Title', 'Generate'];
  const aiData = [analytics.aiUsage.summarize, analytics.aiUsage.autoTitle, analytics.aiUsage.generate];

  // Tag popularity (top 10)
  const tagEntries = Object.entries(analytics.tagCounts || {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const tagLabels = tagEntries.map(([tag]) => tag);
  const tagData = tagEntries.map(([, count]) => count);

  return (
    <div className="p-4 bg-white rounded shadow mt-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Notes Created (Last 7 Days)</h3>
        <Bar
          data={{
            labels: last7,
            datasets: [
              {
                label: 'Notes Created',
                data: notesPerDay,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, precision: 0 } },
          }}
        />
      </div>
      <div className="mb-8">
        <h3 className="font-semibold mb-2">AI Feature Usage</h3>
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
              },
            ],
          }}
        />
      </div>
      <div>
        <h3 className="font-semibold mb-2">Tag Popularity (Top 10)</h3>
        <Bar
          data={{
            labels: tagLabels,
            datasets: [
              {
                label: 'Tag Count',
                data: tagData,
                backgroundColor: 'rgba(234, 88, 12, 0.6)',
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, precision: 0 } },
          }}
        />
      </div>
    </div>
  );
} 