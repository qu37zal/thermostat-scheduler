import React, { useState, useEffect } from 'react';
import { info, removeToast, error as showError } from '../utils/toast';
import TemperatureTrendChart from './charts/TemperatureTrendChart';
import RuntimeHistogram from './charts/RuntimeHistogram';
import HistoryTable from './charts/HistoryTable';

interface HistoryEntry {
  id?: number;
  timestamp: string;
  temperature?: number;
  setpoint?: number;
  mode?: string;
  fan_mode?: string;
  runtime_minutes?: number;
}

interface HistoryVisualizationProps {
  ipAddress: string;
  hoursBack?: number;
}

const HistoryVisualization: React.FC<HistoryVisualizationProps> = ({
  ipAddress,
  hoursBack = 72,
}) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const toastId = info('Refreshing history...');
        setLoadingToastId(toastId);
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/thermostats/${ipAddress}/history?hours=${hoursBack}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch history');
        }

        const data = await response.json();
        
        // Process and format data for charts
        const processedData = (data.data || []).map((entry: any, idx: number) => {
          const timestamp = new Date(entry.timestamp);
          const dateStr = timestamp.toLocaleDateString();
          const hour = timestamp.getHours();
          return {
            ...entry,
            time: timestamp.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            _date: dateStr,
            _hour: hour,
          };
        });

        setHistory(processedData as HistoryEntry[]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to fetch history';
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        if (loadingToastId) {
          removeToast(loadingToastId);
          setLoadingToastId(null);
        }
        setLoading(false);
      }
    };

    fetchHistory();
  }, [ipAddress, hoursBack, loadingToastId]);

  if (loading) {
    return null; // Loading shown as toast
  }

  if (error) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          borderRadius: '4px',
          color: '#721c24',
        }}
      >
        Error: {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ padding: '1rem', color: '#666' }}>
        No history data available yet. Check back after data has been collected.
      </div>
    );
  }

  // Calculate hourly averages for cleaner charts
  const hourlyData = history.reduce((acc, entry: any) => {
    const hour = `${entry._date} ${entry._hour}:00`;
    const existingHour = acc.find(h => h.hour === hour);

    if (existingHour) {
      existingHour.temperatures.push(entry.temperature || 0);
      existingHour.runtimes.push(entry.runtime_minutes || 0);
    } else {
      acc.push({
        hour,
        temperatures: [entry.temperature || 0],
        runtimes: [entry.runtime_minutes || 0],
      });
    }

    return acc;
  }, [] as any[]);

  const chartData = hourlyData.map(h => ({
    hour: h.hour,
    avgTemp: parseFloat((h.temperatures.reduce((a: number, b: number) => a + b, 0) / h.temperatures.length).toFixed(1)),
    totalRuntime: h.runtimes.reduce((a: number, b: number) => a + b, 0),
    minTemp: Math.min(...h.temperatures),
    maxTemp: Math.max(...h.temperatures),
  }));

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>📊 Temperature & Runtime History</h3>

      {/* View Toggle */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setView('chart')}
          style={{
            padding: '0.5rem 1rem',
            marginRight: '0.5rem',
            backgroundColor: view === 'chart' ? '#007bff' : '#f0f0f0',
            color: view === 'chart' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          📈 Chart
        </button>
        <button
          onClick={() => setView('table')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: view === 'table' ? '#007bff' : '#f0f0f0',
            color: view === 'table' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          📋 Table
        </button>
      </div>

      {view === 'chart' && (
        <>
          <TemperatureTrendChart data={chartData} />
          <RuntimeHistogram data={chartData} />
        </>
      )}

      {view === 'table' && <HistoryTable history={history} />}

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
        <p>📊 Showing {history.length} data points from the past {hoursBack} hours</p>
      </div>
    </div>
  );
};

export default HistoryVisualization;
