import React, { useState, useEffect } from 'react';
import { success, error as showError, info, removeToast } from '../utils/toast';

interface TimeSlot {
  time: string;
  hour: number;
  temperature: number;
}

interface DaySchedule {
  day: number;
  dayName: string;
  slots: TimeSlot[];
}

interface ScheduleEditorProps {
  ipAddress: string;
  mode: 'heat' | 'cool';
  onSave?: () => Promise<void>;
  onCancel?: () => void;
}

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { time: '06:00', hour: 6 },
  { time: '08:00', hour: 8 },
  { time: '10:00', hour: 10 },
  { time: '12:00', hour: 12 },
  { time: '14:00', hour: 14 },
  { time: '16:00', hour: 16 },
  { time: '18:00', hour: 18 },
  { time: '20:00', hour: 20 },
  { time: '22:00', hour: 22 },
];

const MIN_TEMP = 50;
const MAX_TEMP = 90;

const ScheduleEditor: React.FC<ScheduleEditorProps> = ({
  ipAddress,
  mode,
  onSave,
  onCancel,
}) => {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  // Load schedule on mount
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const toastId = info('Loading schedule...');
        setLoadingToastId(toastId);
        setLoading(true);
        setError(null);

        // The thermostat API returns all days in one response.
        // Format: { "0": [time_mins, temp, time_mins, temp, ...], "1": [...], ... }
        // We only need to fetch once, not for each day.
        const response = await fetch(
          `/api/thermostats/${ipAddress}/program/${mode}/0`
        );

        if (!response.ok) {
          throw new Error('Failed to load schedule');
        }

        const data = await response.json();
        const fullWeekData = data.data || {};

        // Parse schedule data for each day
        const schedules: DaySchedule[] = [];

        for (let day = 0; day < 7; day++) {
          // The API returns all 7 days in the response, keyed by day number
          const dayArray = fullWeekData[day.toString()] || [];

          // dayArray format: [time_mins, temp, time_mins, temp, ...]
          // Convert to TimeSlot objects
          const slots: TimeSlot[] = [];

          // Parse the alternating time/temp pairs
          for (let i = 0; i < dayArray.length; i += 2) {
            const timeMins = dayArray[i];
            const temp = dayArray[i + 1];

            if (typeof timeMins === 'number' && typeof temp === 'number') {
              // Convert minutes from start of day to HH:MM format
              const hours = Math.floor(timeMins / 60);
              const mins = timeMins % 60;
              const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

              slots.push({
                time: timeStr,
                hour: hours,
                temperature: temp,
              });
            }
          }

          schedules.push({
            day,
            dayName: DAYS_OF_WEEK[day],
            slots,
          });
        }

        setSchedule(schedules);
      } catch (err) {
        console.error('Schedule load error:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to load schedule';
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

    loadSchedule();
  }, [ipAddress, mode, loadingToastId]);

  const validateTemperature = (temp: number): boolean => {
    return !isNaN(temp) && temp >= MIN_TEMP && temp <= MAX_TEMP;
  };

  const handleTemperatureChange = (slotIndex: number, value: number) => {
    if (!validateTemperature(value)) return;

    const updated = [...schedule];
    updated[selectedDay].slots[slotIndex].temperature = value;
    setSchedule(updated);
  };

  // Helper function to convert day schedule to thermostat format
  const convertScheduleToThermostatFormat = (daySchedule: DaySchedule): number[] => {
    const thermostatSchedule: number[] = [];
    for (const slot of daySchedule.slots) {
      // Convert HH:MM format back to minutes from start of day
      const [hours, mins] = slot.time.split(':').map(Number);
      const totalMins = hours * 60 + mins;
      thermostatSchedule.push(totalMins);
      thermostatSchedule.push(slot.temperature);
    }
    return thermostatSchedule;
  };

  // Helper function to save a single day
  const saveSingleDay = async (day: number): Promise<boolean> => {
    const daySchedule = schedule[day];
    if (!daySchedule.slots.every(slot => validateTemperature(slot.temperature))) {
      throw new Error(`Invalid temperatures for ${daySchedule.dayName}`);
    }

    const thermostatSchedule = convertScheduleToThermostatFormat(daySchedule);

    const response = await fetch(
      `/api/thermostats/${ipAddress}/program/${mode}/${day}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: thermostatSchedule }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Failed to save schedule for ${daySchedule.dayName}`);
    }

    return true;
  };

  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate all temperatures for current day
      const currentDay = schedule[selectedDay];
      if (!currentDay.slots.every(slot => validateTemperature(slot.temperature))) {
        setError('All temperatures must be between 50°F and 90°F');
        return;
      }

      await saveSingleDay(selectedDay);
      success('Schedule saved successfully!');
      await onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  // Save weekday schedule (Mon-Fri: days 0-4)
  const handleSaveWeekdaySchedule = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate all temperatures for all weekdays
      for (let day = 0; day <= 4; day++) {
        if (!schedule[day].slots.every(slot => validateTemperature(slot.temperature))) {
          setError(`Invalid temperatures for ${schedule[day].dayName}`);
          return;
        }
      }

      // Save all weekdays
      for (let day = 0; day <= 4; day++) {
        await saveSingleDay(day);
      }

      success('Weekday schedule saved successfully!');
      await onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weekday schedule');
    } finally {
      setSaving(false);
    }
  };

  // Save weekend schedule (Sat-Sun: days 5-6)
  const handleSaveWeekendSchedule = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate all temperatures for all weekend days
      for (let day = 5; day <= 6; day++) {
        if (!schedule[day].slots.every(slot => validateTemperature(slot.temperature))) {
          setError(`Invalid temperatures for ${schedule[day].dayName}`);
          return;
        }
      }

      // Save all weekend days
      for (let day = 5; day <= 6; day++) {
        await saveSingleDay(day);
      }

      success('Weekend schedule saved successfully!');
      await onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save weekend schedule');
    } finally {
      setSaving(false);
    }
  };

  // Save global schedule (all days)
  const handleSaveGlobalSchedule = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate all temperatures for all days
      for (let day = 0; day <= 6; day++) {
        if (!schedule[day].slots.every(slot => validateTemperature(slot.temperature))) {
          setError(`Invalid temperatures for ${schedule[day].dayName}`);
          return;
        }
      }

      // Save all 7 days
      for (let day = 0; day <= 6; day++) {
        await saveSingleDay(day);
      }

      success('Global schedule saved successfully!');
      await onSave?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save global schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null; // Loading shown as toast
  }

  if (error && schedule.length === 0) {
    return (
      <div
        style={{
          padding: '1rem',
          backgroundColor: '#f8d7da',
          borderRadius: '4px',
          color: '#721c24',
          marginBottom: '1rem',
        }}
      >
        Error: {error}
        <button
          onClick={onCancel}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          ✕ Close
        </button>
      </div>
    );
  }

  const currentDay = schedule[selectedDay];

  return (
    <div
      style={{
        marginTop: '2rem',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
      }}
    >
      <h3>📅 Edit {mode.charAt(0).toUpperCase() + mode.slice(1)} Schedule</h3>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            color: '#721c24',
            marginBottom: '1rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Day Selector */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
          Select Day:
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '0.5rem',
          }}
        >
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

      {/* Temperature Grid */}
      {currentDay && (
        <div style={{ marginBottom: '1.5rem', overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              backgroundColor: '#fff',
              border: '1px solid #ddd',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#e9ecef', borderBottom: '2px solid #ddd' }}>
                <th
                  style={{
                    padding: '0.75rem',
                    textAlign: 'center',
                    borderRight: '1px solid #ddd',
                  }}
                >
                  Time
                </th>
                <th style={{ padding: '0.75rem', textAlign: 'center' }}>Temperature (°F)</th>
              </tr>
            </thead>
            <tbody>
              {currentDay.slots.map((slot, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td
                    style={{
                      padding: '0.75rem',
                      textAlign: 'center',
                      backgroundColor: '#f9f9f9',
                      borderRight: '1px solid #ddd',
                      fontWeight: 'bold',
                    }}
                  >
                    {slot.time}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <input
                      type="number"
                      min={MIN_TEMP}
                      max={MAX_TEMP}
                      value={slot.temperature}
                      onChange={e =>
                        handleTemperatureChange(idx, parseFloat(e.target.value))
                      }
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
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
            Temperature range: {MIN_TEMP}°F - {MAX_TEMP}°F
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
        {/* Primary Save Options */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleSaveSchedule}
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
            {saving ? '💾 Saving...' : `💾 Save ${schedule[selectedDay]?.dayName || 'Day'}`}
          </button>

          {/* Weekday/Weekend buttons only if not already selected */}
          {selectedDay <= 4 ? (
            <button
              onClick={handleSaveWeekdaySchedule}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0056b3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '💾 Saving...' : '💼 Save Weekday Schedule'}
            </button>
          ) : (
            <button
              onClick={handleSaveWeekendSchedule}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0056b3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {saving ? '💾 Saving...' : '🎉 Save Weekend Schedule'}
            </button>
          )}

          {/* Global button */}
          <button
            onClick={handleSaveGlobalSchedule}
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
            {saving ? '💾 Saving...' : '🌍 Save Global Schedule'}
          </button>
        </div>

        {/* Cancel Button */}
        <div>
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
      </div>

      <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
        <p>💡 Editing schedule for <strong>{currentDay?.dayName}</strong> in <strong>{mode}</strong> mode</p>
      </div>
    </div>
  );
};

export default ScheduleEditor;
