import React, { useState, useEffect } from 'react';
import ThermostatStatus from './ThermostatStatus';

interface Thermostat {
  id: string;
  name: string;
  currentTemp?: number;
  targetTemp?: number;
  status?: string;
  ipAddress: string;
  model?: string;
  apiUrl?: string;
  tmode?: number;
  fmode?: number;
  tstate?: number;
  hold?: number;
}

interface ThermostatSelectorProps {
  thermostats: Thermostat[];
  onRefresh: () => Promise<void>;
  onSave: (thermostat: Thermostat) => Promise<void>;
}

const ThermostatSelector: React.FC<ThermostatSelectorProps> = ({
  thermostats,
  onRefresh,
  onSave,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedThermostat = thermostats[selectedIndex];

  const handleTabClick = (index: number) => {
    setSelectedIndex(index);
    setError(null);
  };

  const handleRefresh = async () => {
    try {
      setLoading(true);
      setError(null);
      await onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setLoading(false);
    }
  };

  if (thermostats.length === 0) {
    return (
      <div
        style={{
          padding: '2rem',
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
          textAlign: 'center',
        }}
      >
        <h3>No Thermostats Found</h3>
        <p>Click the refresh button or add a manual IP address to discover thermostats.</p>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            color: '#721c24',
          }}
        >
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #ddd',
          overflowX: 'auto',
          marginBottom: '1rem',
        }}
      >
        {thermostats.map((thermostat, index) => (
          <button
            key={thermostat.id}
            onClick={() => handleTabClick(index)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: index === selectedIndex ? '#007bff' : '#f0f0f0',
              color: index === selectedIndex ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px 4px 0 0',
              cursor: 'pointer',
              fontWeight: index === selectedIndex ? 'bold' : 'normal',
              transition: 'all 0.2s',
            }}
          >
            {thermostat.name || `Thermostat ${thermostat.id}`}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {selectedThermostat && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '0 0 8px 8px',
            padding: '1.5rem',
            backgroundColor: '#fff',
          }}
        >
          <ThermostatStatus
            thermostat={selectedThermostat}
            onSave={onSave}
          />
        </div>
      )}

      {/* Additional Info */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f0f8ff',
          borderRadius: '4px',
          fontSize: '0.9rem',
          color: '#333',
        }}
      >
        <p>
          <strong>Total Thermostats:</strong> {thermostats.length}
        </p>
        {selectedThermostat && (
          <>
            <p>
              <strong>IP Address:</strong> {selectedThermostat.ipAddress}
            </p>
            {selectedThermostat.model && (
              <p>
                <strong>Model:</strong> {selectedThermostat.model}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ThermostatSelector;
