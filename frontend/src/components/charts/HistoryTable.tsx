import React from 'react';

interface HistoryEntry {
  id?: number;
  timestamp: string;
  temperature?: number;
  setpoint?: number;
  mode?: string;
  fan_mode?: string;
  runtime_minutes?: number;
}

interface HistoryTableProps {
  history: HistoryEntry[];
}

const HistoryTable: React.FC<HistoryTableProps> = ({ history }) => {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.85rem',
          backgroundColor: '#fff',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
            <th style={{ padding: '0.5rem', textAlign: 'left' }}>Timestamp</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Temp (°F)</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Setpoint (°F)</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Mode</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Fan</th>
            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Runtime (min)</th>
          </tr>
        </thead>
        <tbody>
          {history.slice(-100).reverse().map((entry, idx) => (
            <tr
              key={idx}
              style={{
                backgroundColor: idx % 2 === 0 ? '#fff' : '#f9f9f9',
                borderBottom: '1px solid #eee',
              }}
            >
              <td style={{ padding: '0.5rem' }}>
                {new Date(entry.timestamp).toLocaleString()}
              </td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                {entry.temperature?.toFixed(1)}
              </td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                {entry.setpoint?.toFixed(1)}
              </td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>{entry.mode}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>{entry.fan_mode}</td>
              <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                {entry.runtime_minutes}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryTable;
