import React, { useState, useEffect } from 'react';
import { info, removeToast, error as showError } from '../utils/toast';

interface ScheduleEntry {
  day: string;
  time: string; // HH:MM format
  temperature: number;
}

interface ScheduleDisplayCombinedProps {
  ipAddress: string;
  refreshKey?: number;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBREVIATIONS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ScheduleDisplayCombined: React.FC<ScheduleDisplayCombinedProps> = ({ ipAddress, refreshKey }) => {
  const [heatSchedule, setHeatSchedule] = useState<ScheduleEntry[]>([]);
  const [coolSchedule, setCoolSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingToastId, setLoadingToastId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const toastId = info('Loading schedules...');
        setLoadingToastId(toastId);
        setLoading(true);
        setError(null);

        // Fetch both heat and cool schedules in parallel
        const [heatRes, coolRes] = await Promise.all([
          fetch(`/api/thermostats/${ipAddress}/program/heat/0`, { method: 'GET' }),
          fetch(`/api/thermostats/${ipAddress}/program/cool/0`, { method: 'GET' }),
        ]);

        if (!heatRes.ok || !coolRes.ok) {
          throw new Error('Failed to fetch schedules');
        }

        const heatData = await heatRes.json();
        const coolData = await coolRes.json();

        const parseSchedules = (data: any) => {
          const fullWeekData = data.data || {};
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

          return scheduleData;
        };

        setHeatSchedule(parseSchedules(heatData));
        setCoolSchedule(parseSchedules(coolData));
      } catch (err) {
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

    fetchSchedules();
  }, [ipAddress, refreshKey, loadingToastId]);

  if (loading) {
    return null; // Loading shown as toast
  }

  // Group schedules by day
  const heatByDay = DAYS.reduce((acc, day) => {
    acc[day] = heatSchedule.filter((entry) => entry.day === day);
    return acc;
  }, {} as Record<string, ScheduleEntry[]>);

  const coolByDay = DAYS.reduce((acc, day) => {
    acc[day] = coolSchedule.filter((entry) => entry.day === day);
    return acc;
  }, {} as Record<string, ScheduleEntry[]>);

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>🌡️ Weekly Schedule Overview</h3>

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

      {/* Combined Schedule Table */}
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
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold', minWidth: '80px' }}>
                Day
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>
                🔥 Heat Schedule Entries
              </th>
              <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>
                ❄️ Cool Schedule Entries
              </th>
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day, dayIdx) => (
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
                    backgroundColor: '#f0f0f0',
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
                  {heatByDay[day].length === 0 ? (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>No entries</span>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      {heatByDay[day].map((entry, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.4rem 0.6rem',
                            backgroundColor: '#fff9e6',
                            border: '1px solid #ffc107',
                            borderRadius: '3px',
                            display: 'flex',
                            gap: '0.4rem',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>{entry.time}</span>
                          <span style={{ color: '#999' }}>→</span>
                          <span style={{ fontWeight: 'bold', color: '#d97706' }}>
                            {entry.temperature}°F
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: '0.75rem',
                  }}
                >
                  {coolByDay[day].length === 0 ? (
                    <span style={{ color: '#999', fontStyle: 'italic' }}>No entries</span>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      {coolByDay[day].map((entry, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '0.4rem 0.6rem',
                            backgroundColor: '#e6f7ff',
                            border: '1px solid #0071b8',
                            borderRadius: '3px',
                            display: 'flex',
                            gap: '0.4rem',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                          }}
                        >
                          <span style={{ fontWeight: 'bold' }}>{entry.time}</span>
                          <span style={{ color: '#999' }}>→</span>
                          <span style={{ fontWeight: 'bold', color: '#0071b8' }}>
                            {entry.temperature}°F
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
        <p>💡 <em>Shows the actual schedule entries for each day. Click "✏️ Edit Schedule" to make changes.</em></p>
      </div>
    </div>
  );
};

export default ScheduleDisplayCombined;
