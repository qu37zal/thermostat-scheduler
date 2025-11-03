import React, { useState, useEffect } from 'react';

interface Thermostat {
  id: string;
  name: string;
  currentTemp?: number;
  targetTemp?: number;
  status?: string;
  ipAddress: string;
  model?: string;
  apiUrl?: string;
}

const ThermostatList: React.FC = () => {
  const [thermostats, setThermostats] = useState<Thermostat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualIp, setManualIp] = useState('');

  const fetchThermostats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/thermostats');
      if (!response.ok) {
        throw new Error(`Failed to fetch thermostats: ${response.statusText}`);
      }
      const data = await response.json();
      setThermostats(data.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch thermostats');
    } finally {
      setLoading(false);
    }
  };

  const addManualThermostat = async () => {
    if (!manualIp.trim()) return;
    
    try {
      const response = await fetch('/api/thermostats/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ipAddresses: [manualIp.trim()] }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add manual thermostat: ${response.statusText}`);
      }
      
      setManualIp('');
      await fetchThermostats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add manual thermostat');
    }
  };

  useEffect(() => {
    fetchThermostats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchThermostats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="thermostat-list">
        <h2>Smart Thermostats</h2>
        <div>Loading thermostats...</div>
      </div>
    );
  }

  return (
    <div className="thermostat-list">
      <h2>Smart Thermostats</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '1rem' }}>
          Error: {error}
        </div>
      )}
      
      <div style={{ marginBottom: '2rem' }}>
        <h3>Add Manual Thermostat</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            value={manualIp}
            onChange={(e) => setManualIp(e.target.value)}
            placeholder="Enter thermostat IP address (e.g., 192.168.1.100)"
            style={{ 
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '300px'
            }}
          />
          <button
            onClick={addManualThermostat}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add
          </button>
        </div>
      </div>
      
      <button
        onClick={fetchThermostats}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        Refresh
      </button>
      
      {thermostats.length === 0 ? (
        <div>
          No thermostats found. Try adding a manual IP address or check that your thermostats are connected to the network.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {thermostats.map((thermostat) => (
            <div
              key={thermostat.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h4>{thermostat.name || `Thermostat ${thermostat.id}`}</h4>
              <p><strong>IP:</strong> {thermostat.ipAddress}</p>
              {thermostat.model && <p><strong>Model:</strong> {thermostat.model}</p>}
              {thermostat.currentTemp !== undefined && (
                <p><strong>Current Temperature:</strong> {thermostat.currentTemp}°F</p>
              )}
              {thermostat.targetTemp !== undefined && (
                <p><strong>Target Temperature:</strong> {thermostat.targetTemp}°F</p>
              )}
              {thermostat.status && (
                <p><strong>Status:</strong> {thermostat.status}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThermostatList;
