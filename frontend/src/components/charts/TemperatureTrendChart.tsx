import React from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartData {
  hour: string;
  avgTemp: number;
  minTemp: number;
  maxTemp: number;
  totalRuntime: number;
}

interface TemperatureTrendChartProps {
  data: ChartData[];
}

const TemperatureTrendChart: React.FC<TemperatureTrendChartProps> = ({ data }) => {
  return (
    <div
      style={{
        marginBottom: '2rem',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h4>Temperature Trend</h4>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={data.slice(-48)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={Math.max(0, Math.floor(data.length / 12))}
            fontSize={12}
          />
          <YAxis label={{ value: 'Temperature (°F)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="avgTemp"
            stroke="#ff9800"
            name="Avg Temp"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="maxTemp"
            stroke="#f44336"
            name="Max Temp"
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="minTemp"
            stroke="#2196f3"
            name="Min Temp"
            strokeDasharray="5 5"
            strokeWidth={1}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TemperatureTrendChart;
