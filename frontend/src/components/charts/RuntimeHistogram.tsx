import React from 'react';
import {
  BarChart,
  Bar,
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

interface RuntimeHistogramProps {
  data: ChartData[];
}

const RuntimeHistogram: React.FC<RuntimeHistogramProps> = ({ data }) => {
  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '1rem',
        backgroundColor: '#f9f9f9',
      }}
    >
      <h4>System Runtime (minutes per hour)</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data.slice(-48)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="hour"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={Math.max(0, Math.floor(data.length / 12))}
            fontSize={12}
          />
          <YAxis label={{ value: 'Runtime (minutes)', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
          <Legend />
          <Bar dataKey="totalRuntime" fill="#4caf50" name="Total Runtime" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RuntimeHistogram;
