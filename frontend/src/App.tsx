import React, { useState, useEffect } from 'react';
import ThermostatList from './components/ThermostatList';
import ThermostatSelector from './components/ThermostatSelector';
import ToastContainer from './components/ToastContainer';
import { success, error as showError, info, removeToast } from './utils/toast';

interface Thermostat {
  id: string;
  name: string;
  currentTemp?: number;
  targetTemp?: number;
  status?: string;
  ipAddress: string;
  model?: string;
  apiUrl?: string;
  tmode?: number; // 0=off, 1=heat, 2=cool, 3=auto
  fmode?: number; // 0=off, 1=on, 2=auto
  tstate?: number; // 0=off, 1=on
  hold?: number; // 0=no, 1=yes
  temp?: number;
  t_heat?: number;
  t_cool?: number;
}

const App: React.FC = () => {
  const [thermostats, setThermostats] = useState<Thermostat[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  const fetchThermostats = async () => {
    try {
      // Show loading toast - longer duration and manual dismiss
      const toastId = info('Refreshing thermostats...');
      setLoadingToastId(toastId);
      setLoading(true);
      const response = await fetch('/api/thermostats');
      if (!response.ok) throw new Error('Failed to fetch thermostats');
      const data = await response.json();
      
      // Fetch detailed data for each thermostat
      const thermostatList = data.data || [];
      const detailedThermostats = await Promise.all(
        thermostatList.map(async (thermostat: Thermostat) => {
          try {
            const detailResponse = await fetch(`/api/thermostats/${thermostat.ipAddress}/data`);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return {
                ...thermostat,
                ...detailData.data,
              };
            }
            return thermostat;
          } catch (err) {
            console.warn(`Failed to fetch details for ${thermostat.ipAddress}:`, err);
            return thermostat;
          }
        })
      );
      
      setThermostats(detailedThermostats);
      if (detailedThermostats.length > 0) {
        setShowDiscovery(false);
      }
    } catch (error) {
      console.error('Error fetching thermostats:', error);
      showError('Failed to load thermostats');
    } finally {
      setLoading(false);
      // Dismiss loading toast
      if (loadingToastId) {
        removeToast(loadingToastId);
        setLoadingToastId(null);
      }
    }
  };

  const handleRefresh = async () => {
    await fetchThermostats();
  };

  const handleSave = async (thermostat: Thermostat) => {
    try {
      const response = await fetch('/api/thermostats/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ipAddress: thermostat.ipAddress,
          name: thermostat.name,
          model: thermostat.model,
        }),
      });
      if (!response.ok) throw new Error('Failed to save thermostat');
      success('Thermostat saved successfully!');
    } catch (err) {
      showError('Error saving thermostat: ' + (err as Error).message);
    }
  };

  useEffect(() => {
    fetchThermostats();
    const interval = setInterval(fetchThermostats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {showDiscovery ? (
        <ThermostatList />
      ) : (
        <ThermostatSelector
          thermostats={thermostats}
          onRefresh={handleRefresh}
          onSave={handleSave}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default App;