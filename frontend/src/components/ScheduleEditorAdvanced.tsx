import React, { useState, useEffect } from 'react';
import { success, error as showError, info, removeToast } from '../utils/toast';

interface ScheduleEntry {
  time: string; // HH:MM format
  temperature: number;
}

interface DaySchedule {
  day: number;
  dayName: string;
  heat: ScheduleEntry[];
  cool: ScheduleEntry[];
}

interface ScheduleEditorAdvancedProps {
  ipAddress: string;
  onSave?: () => Promise<void>;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MIN_TEMP = 50;
const MAX_TEMP = 90;

const ScheduleEditorAdvanced: React.FC<ScheduleEditorAdvancedProps> = ({
  ipAddress,
  onSave,
  onCancel,
}) => {
  const [schedules, setSchedules] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  // Load both heat and cool schedules on mount
  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const toastId = info('Refreshing schedules...');
        setLoadingToastId(toastId);
        setLoading(true);
        setError(null);

        // Fetch heat and cool schedules in parallel
        const [heatRes, coolRes] = await Promise.all([
          fetch(`/api/thermostats/${ipAddress}/program/heat/0`),
          fetch(`/api/thermostats/${ipAddress}/program/cool/0`),
        ]);

        if (!heatRes.ok || !coolRes.ok) {
          throw new Error('Failed to load schedules');
        }

        const heatData = await heatRes.json();
        const coolData = await coolRes.json();

        const heatWeekData = heatData.data || {};
        const coolWeekData = coolData.data || {};

        // Parse schedules for each day
        const allSchedules: DaySchedule[] = [];

        for (let day = 0; day < 7; day++) {
          const heatArray = heatWeekData[day.toString()] || [];
          const coolArray = coolWeekData[day.toString()] || [];

          const heatEntries = parseScheduleArray(heatArray);
          const coolEntries = parseScheduleArray(coolArray);

          allSchedules.push({
            day,
            dayName: DAYS_OF_WEEK[day],
            heat: heatEntries,
            cool: coolEntries,
          });
        }

        setSchedules(allSchedules);
      } catch (err) {
        console.error('Schedule load error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to load schedules';
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

    loadSchedules();
  }, [ipAddress, loadingToastId]);

  const parseScheduleArray = (arr: number[]): ScheduleEntry[] => {
    const entries: ScheduleEntry[] = [];
    for (let i = 0; i < arr.length; i += 2) {
      const timeMins = arr[i];
      const temp = arr[i + 1];

      if (typeof timeMins === 'number' && typeof temp === 'number') {
        const hours = Math.floor(timeMins / 60);
        const mins = timeMins % 60;
        const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

        entries.push({ time: timeStr, temperature: temp });
      }
    }
    return entries;
  };

  const convertToMinutes = (timeStr: string): number => {
    const [hours, mins] = timeStr.split(':').map(Number);
    return hours * 60 + mins;
  };

  const convertMinutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  const convertTo12Hour = (timeStr: string): string => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
  };

  const convertFrom12Hour = (time12Str: string): string => {
    const match = time12Str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return '00:00';
    
    let hours = parseInt(match[1]);
    const mins = match[2];
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return `${String(hours).padStart(2, '0')}:${mins}`;
  };

  const convertScheduleToArray = (entries: ScheduleEntry[]): number[] => {
    const arr: number[] = [];
    for (const entry of entries) {
      arr.push(convertToMinutes(entry.time));
      arr.push(entry.temperature);
    }
    return arr;
  };

  const handleTimeChange = (scheduleType: 'heat' | 'cool', entryIdx: number, newTime: string) => {
    const updated = [...schedules];
    if (scheduleType === 'heat') {
      updated[selectedDay].heat[entryIdx].time = newTime;
    } else {
      updated[selectedDay].cool[entryIdx].time = newTime;
    }
    setSchedules(updated);
  };

  const handleTempChange = (scheduleType: 'heat' | 'cool', entryIdx: number, newTemp: number) => {
    if (!Number.isInteger(newTemp) || newTemp < MIN_TEMP || newTemp > MAX_TEMP) return;
    const updated = [...schedules];
    if (scheduleType === 'heat') {
      updated[selectedDay].heat[entryIdx].temperature = newTemp;
    } else {
      updated[selectedDay].cool[entryIdx].temperature = newTemp;
    }
    setSchedules(updated);
  };

  const handleAddEntry = (scheduleType: 'heat' | 'cool') => {
    const updated = [...schedules];
    if (scheduleType === 'heat') {
      updated[selectedDay].heat.push({ time: '12:00', temperature: 70 });
    } else {
      updated[selectedDay].cool.push({ time: '12:00', temperature: 75 });
    }
    setSchedules(updated);
  };

  const handleRemoveEntry = (scheduleType: 'heat' | 'cool', entryIdx: number) => {
    const updated = [...schedules];
    if (scheduleType === 'heat') {
      updated[selectedDay].heat.splice(entryIdx, 1);
    } else {
      updated[selectedDay].cool.splice(entryIdx, 1);
    }
    setSchedules(updated);
  };

  const handleSaveDay = async () => {
    try {
      setSaving(true);
      setError(null);

      const day = selectedDay;
      const currentSchedule = schedules[day];

      // Validate all entries
      const validateEntries = (entries: ScheduleEntry[]) => {
        for (const entry of entries) {
          if (!entry.time || !/^\d{2}:\d{2}$/.test(entry.time)) {
            throw new Error('Invalid time format. Use HH:MM');
          }
          const [h, m] = entry.time.split(':').map(Number);
          if (h > 23 || m > 59) {
            throw new Error('Invalid time. Hours must be 0-23, minutes 0-59');
          }
          if (entry.temperature < MIN_TEMP || entry.temperature > MAX_TEMP) {
            throw new Error(`Temperature must be between ${MIN_TEMP}-${MAX_TEMP}°F`);
          }
        }
      };

      validateEntries(currentSchedule.heat);
      validateEntries(currentSchedule.cool);

      // Save heat schedule
      const heatArray = convertScheduleToArray(currentSchedule.heat);
      const heatRes = await fetch(`/api/thermostats/${ipAddress}/program/heat/${day}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: heatArray }),
      });
      if (!heatRes.ok) throw new Error('Failed to save heat schedule');

      // Save cool schedule
      const coolArray = convertScheduleToArray(currentSchedule.cool);
      const coolRes = await fetch(`/api/thermostats/${ipAddress}/program/cool/${day}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: coolArray }),
      });
      if (!coolRes.ok) throw new Error('Failed to save cool schedule');

      success(`Schedule saved for ${currentSchedule.dayName}!`);
      await onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAllDays = async () => {
    try {
      setSaving(true);
      setError(null);

      // Get the currently selected day's schedule
      const currentSchedule = schedules[selectedDay];

      // Validate the current day's schedule
      for (const entry of [...currentSchedule.heat, ...currentSchedule.cool]) {
        if (!entry.time || !/^\d{2}:\d{2}$/.test(entry.time)) {
          throw new Error('Invalid time format. Use HH:MM');
        }
        const [h, m] = entry.time.split(':').map(Number);
        if (h > 23 || m > 59) {
          throw new Error('Invalid time. Hours must be 0-23, minutes 0-59');
        }
        if (entry.temperature < MIN_TEMP || entry.temperature > MAX_TEMP) {
          throw new Error(`Temperature must be between ${MIN_TEMP}-${MAX_TEMP}°F`);
        }
      }

      // Save the current day's schedule to all 7 days
      for (let day = 0; day < 7; day++) {
        // Save heat schedule
        const heatArray = convertScheduleToArray(currentSchedule.heat);
        const heatRes = await fetch(`/api/thermostats/${ipAddress}/program/heat/${day}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule: heatArray }),
        });
        if (!heatRes.ok) throw new Error(`Failed to save heat schedule for day ${day}`);

        // Save cool schedule
        const coolArray = convertScheduleToArray(currentSchedule.cool);
        const coolRes = await fetch(`/api/thermostats/${ipAddress}/program/cool/${day}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ schedule: coolArray }),
        });
        if (!coolRes.ok) throw new Error(`Failed to save cool schedule for day ${day}`);
      }

      success('All 7 days updated with the same schedule!');
      await onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedules');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null; // Loading shown as toast
  }

  const currentDay = schedules[selectedDay];

  return (
    <div style={{ border: '2px solid #007bff', borderRadius: '8px', padding: '1.5rem', backgroundColor: '#f8f9fa' }}>
      <h3>📅 Advanced Schedule Editor - 24 Hour</h3>

      {error && (
        <div style={{ padding: '0.75rem', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Day Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Day:</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem' }}>
          {DAYS_OF_WEEK.map((day, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDay(idx)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: selectedDay === idx ? '#007bff' : '#f0f0f0',
                color: selectedDay === idx ? 'white' : '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedDay === idx ? 'bold' : 'normal',
              }}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {currentDay && (
        <>
          {/* Heat Schedule */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>🔥 Heat Schedule</h4>
              <button
                onClick={() => handleAddEntry('heat')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                + Add Entry
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>Time (AM/PM)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>Temperature (°F)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDay.heat.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                        No heat schedule entries. Click "Add Entry" to create one.
                      </td>
                    </tr>
                  ) : (
                    currentDay.heat.map((entry, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                          <input
                            type="text"
                            placeholder="12:00 AM"
                            value={convertTo12Hour(entry.time)}
                            onChange={e => handleTimeChange('heat', idx, convertFrom12Hour(e.target.value))}
                            style={{
                              padding: '0.5rem',
                              fontSize: '1rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              textAlign: 'center',
                              width: '100px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                          <input
                            type="number"
                            min={MIN_TEMP}
                            max={MAX_TEMP}
                            value={entry.temperature}
                            onChange={e => handleTempChange('heat', idx, parseInt(e.target.value))}
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              fontSize: '1rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              textAlign: 'center',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveEntry('heat', idx)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cool Schedule */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0 }}>❄️ Cool Schedule</h4>
              <button
                onClick={() => handleAddEntry('cool')}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                + Add Entry
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff', border: '1px solid #ddd' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>Time (AM/PM)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>Temperature (°F)</th>
                    <th style={{ padding: '0.75rem', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDay.cool.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
                        No cool schedule entries. Click "Add Entry" to create one.
                      </td>
                    </tr>
                  ) : (
                    currentDay.cool.map((entry, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                          <input
                            type="text"
                            placeholder="12:00 PM"
                            value={convertTo12Hour(entry.time)}
                            onChange={e => handleTimeChange('cool', idx, convertFrom12Hour(e.target.value))}
                            style={{
                              padding: '0.5rem',
                              fontSize: '1rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              textAlign: 'center',
                              width: '100px',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center', borderRight: '1px solid #ddd' }}>
                          <input
                            type="number"
                            min={MIN_TEMP}
                            max={MAX_TEMP}
                            value={entry.temperature}
                            onChange={e => handleTempChange('cool', idx, parseInt(e.target.value))}
                            style={{
                              width: '80px',
                              padding: '0.5rem',
                              fontSize: '1rem',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              textAlign: 'center',
                            }}
                          />
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <button
                            onClick={() => handleRemoveEntry('cool', idx)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Buttons */}
          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd', flexWrap: 'wrap' }}>
            <button
              onClick={handleSaveDay}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '💾 Saving...' : `💾 Save ${currentDay.dayName}`}
            </button>

            <button
              onClick={handleSaveAllDays}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '💾 Saving...' : '🌍 Save All Days'}
            </button>

            <button
              onClick={onCancel}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: saving ? 0.6 : 1,
              }}
            >
              ✕ Cancel
            </button>
          </div>
        </>
      )}

      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
        <p>💡 Temperature range: {MIN_TEMP}°F - {MAX_TEMP}°F</p>
        <p>💡 You can add/remove schedule entries and edit both time and temperature</p>
      </div>
    </div>
  );
};

export default ScheduleEditorAdvanced;
