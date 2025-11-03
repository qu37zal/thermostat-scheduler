import React, { useState, useEffect } from 'react';
import ScheduleDisplayCombined from './ScheduleDisplayCombined';
import HistoryVisualization from './HistoryVisualization';
import ScheduleEditorAdvanced from './ScheduleEditorAdvanced';
import StatusCard from './StatusCard';
import { success, error as showError } from '../utils/toast';

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
  t_heat?: number;
  t_cool?: number;
  temp?: number;
}

interface ThermostatStatusProps {
  thermostat: Thermostat;
  onSave?: (thermostat: Thermostat) => Promise<void>;
}

const ThermostatStatus: React.FC<ThermostatStatusProps> = ({
  thermostat,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedThermostat, setEditedThermostat] = useState(thermostat);
  const [activeTab, setActiveTab] = useState<'status' | 'schedule' | 'history'>('status');
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const [stirFansEnabled, setStirFansEnabled] = useState(false);
  const [stirFansLoading, setStirFansLoading] = useState(false);

  useEffect(() => {
    setEditedThermostat(thermostat);
  }, [thermostat]);

  // Fetch stir fans setting
  useEffect(() => {
    const fetchStirFansSetting = async () => {
      try {
        const response = await fetch(`/api/thermostats/${thermostat.ipAddress}/stir-fans`);
        if (response.ok) {
          const data = await response.json();
          setStirFansEnabled(data.data?.enabled === 1);
        }
      } catch (error) {
        console.error('Error fetching stir fans setting:', error);
      }
    };

    if (thermostat.ipAddress) {
      fetchStirFansSetting();
    }
  }, [thermostat.ipAddress]);

  const getModeString = (tmode?: number): string => {
    switch (tmode) {
      case 0:
        return 'Off';
      case 1:
        return '🔥 Heating';
      case 2:
        return '❄️ Cooling';
      case 3:
        return '🔄 Auto';
      default:
        return 'Unknown';
    }
  };

  const getFanModeString = (fmode?: number): string => {
    switch (fmode) {
      case 0:
        return 'Off';
      case 1:
        return '💨 On';
      case 2:
        return '🔄 Auto';
      default:
        return 'Unknown';
    }
  };

  const getStateString = (tstate?: number): string => {
    return tstate === 1 ? '✅ Running' : '⏹️ Idle';
  };

  const getHoldString = (hold?: number): string => {
    return hold === 1 ? '🔒 Hold' : 'Schedule';
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Prepare settings to send to the thermostat
      const settingsToUpdate: any = {};
      
      if (editedThermostat.tmode !== undefined && editedThermostat.tmode !== thermostat.tmode) {
        settingsToUpdate.tmode = editedThermostat.tmode;
      }
      if (editedThermostat.fmode !== undefined && editedThermostat.fmode !== thermostat.fmode) {
        settingsToUpdate.fmode = editedThermostat.fmode;
      }
      if (editedThermostat.hold !== undefined && editedThermostat.hold !== thermostat.hold) {
        settingsToUpdate.hold = editedThermostat.hold;
      }
      if (editedThermostat.t_heat !== undefined && editedThermostat.t_heat !== thermostat.t_heat) {
        settingsToUpdate.t_heat = editedThermostat.t_heat;
      }

      // Send settings to thermostat if there are changes
      if (Object.keys(settingsToUpdate).length > 0) {
        const response = await fetch(`/api/thermostats/${thermostat.ipAddress}/settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settingsToUpdate),
        });

        if (!response.ok) {
          throw new Error('Failed to update thermostat settings');
        }

        console.log('Settings updated:', settingsToUpdate);
      }

      // Also call the original onSave if provided (for any other purposes)
      if (onSave) {
        await onSave(editedThermostat);
      }

      setIsEditing(false);
      success('Settings saved successfully!');
    } catch (err) {
      console.error('Error saving thermostat:', err);
      showError(`Error: ${err instanceof Error ? err.message : 'Failed to save'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStirFans = async () => {
    try {
      setStirFansLoading(true);
      const newState = !stirFansEnabled;

      const response = await fetch(`/api/thermostats/${thermostat.ipAddress}/stir-fans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newState }),
      });

      if (response.ok) {
        setStirFansEnabled(newState);
        success(`Stir Fans ${newState ? 'On' : 'Off'}`);
      } else {
        showError('Failed to update stir fans setting');
      }
    } catch (err) {
      console.error('Error toggling stir fans:', err);
      showError('Error updating stir fans');
    } finally {
      setStirFansLoading(false);
    }
  };

  const currentTemp = thermostat.temp ?? thermostat.currentTemp;
  const targetTemp = thermostat.t_heat ?? thermostat.t_cool ?? thermostat.targetTemp;
  const tmode = thermostat.tmode;
  const fmode = thermostat.fmode;
  const tstate = thermostat.tstate;
  const hold = thermostat.hold;

  return (
    <div>
      {/* Sub-Navigation Tabs for Status/Schedule/History */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid #ddd',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => {
            setActiveTab('status');
            setIsEditing(false);
            setEditingSchedule(false);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'status' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'status' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'status' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          📊 Status
        </button>

        <button
          onClick={() => {
            setActiveTab('schedule');
            setIsEditing(false);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'schedule' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'schedule' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'schedule' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          📅 Schedule
        </button>

        <button
          onClick={() => {
            setActiveTab('history');
            setIsEditing(false);
            setEditingSchedule(false);
          }}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: activeTab === 'history' ? '#007bff' : '#f0f0f0',
            color: activeTab === 'history' ? 'white' : '#333',
            border: 'none',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            fontWeight: activeTab === 'history' ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
        >
          📈 History
        </button>
      </div>

      {/* STATUS TAB */}
      {activeTab === 'status' && (
        <div>
          {/* Current Status Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            <StatusCard
              title="Current Temperature"
              value={currentTemp !== undefined ? `${currentTemp}°F` : 'N/A'}
              backgroundColor="#fff3cd"
              borderColor="#ffc107"
            />
            <StatusCard
              title="Target Temperature"
              value={targetTemp !== undefined ? `${targetTemp}°F` : 'N/A'}
              backgroundColor="#e7f3ff"
              borderColor="#0071b8"
            />
            <StatusCard
              title="Mode"
              value={getModeString(tmode)}
              backgroundColor="#f0f0f0"
              borderColor="#999"
            />
            <StatusCard
              title="Fan"
              value={getFanModeString(fmode)}
              backgroundColor="#e8f5e9"
              borderColor="#4caf50"
            />
            <StatusCard
              title="System State"
              value={getStateString(tstate)}
              backgroundColor={tstate === 1 ? '#fff4e6' : '#f3f3f3'}
              borderColor={tstate === 1 ? '#ff9800' : '#ccc'}
            />
            <StatusCard
              title="Hold Mode"
              value={getHoldString(hold)}
              backgroundColor={hold === 1 ? '#fccccc' : '#f3f3f3'}
              borderColor={hold === 1 ? '#d32f2f' : '#ccc'}
            />
            <StatusCard
              title="Stir Fans"
              value={stirFansEnabled ? '✅ On' : '⏹️ Off'}
              backgroundColor={stirFansEnabled ? '#e8f5e9' : '#f3f3f3'}
              borderColor={stirFansEnabled ? '#4caf50' : '#ccc'}
            />
          </div>

          {/* Actions for Status Tab */}
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid #ddd',
              flexWrap: 'wrap',
            }}
          >
            {onSave && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✏️ Edit Settings
              </button>
            )}

            <button
              onClick={handleToggleStirFans}
              disabled={stirFansLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: stirFansEnabled ? '#d32f2f' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: stirFansLoading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: stirFansLoading ? 0.6 : 1,
              }}
            >
              {stirFansLoading ? 'Updating...' : (stirFansEnabled ? '💨 Turn Off' : '💨 Turn On')}
            </button>

            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Saving...' : '💾 Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedThermostat(thermostat);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  ✕ Cancel
                </button>
              </>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #ddd',
              }}
            >
              <h4 style={{ marginTop: 0 }}>Edit Thermostat Settings</h4>

              {/* Temperature Controls */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Target Temperature (°F)
                </label>
                <input
                  type="number"
                  min={50}
                  max={90}
                  value={editedThermostat.t_heat ?? 70}
                  onChange={(e) =>
                    setEditedThermostat({
                      ...editedThermostat,
                      t_heat: parseInt(e.target.value),
                    })
                  }
                  style={{
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    width: '100px',
                  }}
                />
              </div>

              {/* Mode Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Mode
                </label>
                <select
                  value={editedThermostat.tmode ?? 0}
                  onChange={(e) =>
                    setEditedThermostat({
                      ...editedThermostat,
                      tmode: parseInt(e.target.value),
                    })
                  }
                  style={{
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <option value={0}>Off</option>
                  <option value={1}>Heat</option>
                  <option value={2}>Cool</option>
                  <option value={3}>Auto</option>
                </select>
              </div>

              {/* Fan Mode Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Fan Mode
                </label>
                <select
                  value={editedThermostat.fmode ?? 0}
                  onChange={(e) =>
                    setEditedThermostat({
                      ...editedThermostat,
                      fmode: parseInt(e.target.value),
                    })
                  }
                  style={{
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <option value={0}>Auto</option>
                  <option value={1}>Auto/Circulate</option>
                  <option value={2}>On</option>
                </select>
              </div>

              {/* Hold Mode Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Hold Mode
                </label>
                <select
                  value={editedThermostat.hold ?? 0}
                  onChange={(e) =>
                    setEditedThermostat({
                      ...editedThermostat,
                      hold: parseInt(e.target.value),
                    })
                  }
                  style={{
                    padding: '0.5rem',
                    fontSize: '1rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                  }}
                >
                  <option value={0}>Schedule</option>
                  <option value={1}>Hold</option>
                </select>
              </div>

              {/* Stir Fans Toggle in Edit Form */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', border: '1px solid #ddd' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                  Stir Fans
                </label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleToggleStirFans()}
                    disabled={stirFansLoading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: stirFansEnabled ? '#d32f2f' : '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: stirFansLoading ? 'not-allowed' : 'pointer',
                      fontSize: '0.9rem',
                    }}
                  >
                    {stirFansLoading ? 'Updating...' : (stirFansEnabled ? '💨 Turn Off' : '💨 Turn On')}
                  </button>
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    Currently: <strong>{stirFansEnabled ? 'On' : 'Off'}</strong>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div>
          {tmode !== 0 ? (
            <>
              {!editingSchedule && (
                <button
                  onClick={() => setEditingSchedule(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    marginBottom: '1.5rem',
                  }}
                >
                  ✏️ Edit Schedule
                </button>
              )}

              {editingSchedule ? (
                <ScheduleEditorAdvanced
                  ipAddress={thermostat.ipAddress}
                  onSave={async () => {
                    setEditingSchedule(false);
                    // Refresh the schedule display after saving
                    setScheduleRefreshKey(prev => prev + 1);
                  }}
                  onCancel={() => setEditingSchedule(false)}
                />
              ) : (
                <ScheduleDisplayCombined 
                  ipAddress={thermostat.ipAddress}
                  refreshKey={scheduleRefreshKey}
                />
              )}
            </>
          ) : (
            <div
              style={{
                padding: '2rem',
                backgroundColor: '#f9f9f9',
                borderRadius: '4px',
                textAlign: 'center',
                color: '#666',
              }}
            >
              <p>Schedule is not available when thermostat is in Off mode.</p>
              <p>Set mode to Heat or Cool to manage schedules.</p>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div>
          <HistoryVisualization ipAddress={thermostat.ipAddress} hoursBack={72} />
        </div>
      )}
    </div>
  );
};

export default ThermostatStatus;
