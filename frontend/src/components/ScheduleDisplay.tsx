import React, { useState, useEffect } from 'react';
import { info, removeToast, error as showError } from '../utils/toast';

interface ScheduleEntry {
  day: string;
  time: string; // HH:MM format
  temperature: number;
}

interface ScheduleDisplayProps {
  ipAddress: string;
  mode: 'heat' | 'cool';
  refreshKey?: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBREVIATIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ScheduleDisplay: React.FC<ScheduleDisplayProps> = ({ ipAddress, mode, refreshKey }) => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        const toastId = info('Loading schedule...');
        setLoadingToastId(toastId);

        // The thermostat API returns all 7 days in one response
        // Just fetch day 0 to get all days
        const response = await fetch(
          `/api/thermostats/${ipAddress}/program/${mode}/0`,
          { method: 'GET' }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch schedule: ${response.statusText}`);
        }

        const data = await response.json();
        const fullWeekData = data.data || {};

        // Parse schedule data from the single response containing all 7 days
        const scheduleData: ScheduleEntry[] = [];

        for (let day = 0; day < 7; day++) {
          const dayArray = fullWeekData[day.toString()] || [];
          
          // dayArray format: [time_mins, temp, time_mins, temp, ...]
          for (let i = 0; i < dayArray.length; i += 2) {
            const timeMins = dayArray[i];
            const temp = dayArray[i + 1];

            if (typeof timeMins === 'number' && typeof temp === 'number') {
              // Convert minutes from start of day to HH:MM format
              const hours = Math.floor(timeMins / 60);
              const mins = timeMins % 60;
              const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;

              scheduleData.push({
                day: DAYS[day],
                time: timeStr,
                temperature: temp,
              });
            }
          }
        }

        if (scheduleData.length === 0) {
          throw new Error('No schedule data received from thermostat');
        }

        setSchedule(scheduleData);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load schedule';
        setError(errorMsg);
        showError(errorMsg);
      } finally {
        setLoading(false);
        if (loadingToastId) {
          removeToast(loadingToastId);
          setLoadingToastId(null);
        }
      }
    };

    fetchSchedule();
  }, [ipAddress, mode, refreshKey, loadingToastId]);

  if (loading) {
    return null; // Loading message now shown as toast
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>{mode === 'heat' ? '🔥 Heating' : '❄️ Cooling'} Schedule</h3>

      {error && (
        <div
          style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#f8d7da',
            borderRadius: '4px',
            color: '#721c24',
          }}
        >
          Note: {error}
        </div>
      )}

      {/* Weekly Schedule Display - Show actual schedule entries */}
      <div
        style={{
          overflowX: 'auto',
          marginBottom: '1rem',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>
                Day
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>
                Schedule Entries
              </th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIdx) => {
              const dayEntries = schedule.filter((entry) => entry.day === day);
              return (
                <tr
                  key={day}
                  style={{
                    backgroundColor: dayIdx % 2 === 0 ? '#fff' : '#f9f9f9',
                    borderBottom: '1px solid #ddd',
                  }}
                >
                  <td
                    style={{
                      padding: '0.75rem',
                      fontWeight: 'bold',
                      backgroundColor: mode === 'heat' ? '#fff3cd' : '#d1ecf1',
                      minWidth: '80px',
                    }}
                  >
                    {DAY_ABBREVIATIONS[dayIdx]}
                  </td>
                  <td
                    style={{
                      padding: '0.75rem',
                    }}
                  >
                    {dayEntries.length === 0 ? (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>No schedule entries</span>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '1rem',
                        }}
                      >
                        {dayEntries.map((entry, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '0.5rem 0.75rem',
                              backgroundColor: mode === 'heat' ? '#fff9e6' : '#e6f7ff',
                              border: `1px solid ${mode === 'heat' ? '#ffc107' : '#0071b8'}`,
                              borderRadius: '4px',
                              display: 'flex',
                              gap: '0.5rem',
                              alignItems: 'center',
                            }}
                          >
                            <span style={{ fontWeight: 'bold' }}>{entry.time}</span>
                            <span style={{ color: '#666' }}>→</span>
                            <span style={{ fontWeight: 'bold', color: mode === 'heat' ? '#d97706' : '#0071b8' }}>
                              {entry.temperature}°F
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
        <p>💡 <em>Displays the actual schedule entries for each day. Click "✏️ Edit Schedule" to make changes.</em></p>
      </div>
    </div>
  );
};

export default ScheduleDisplay;
