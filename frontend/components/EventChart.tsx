'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  timestamp: string;
  occupancy: number;
}

interface EventChartProps {
  data: ChartDataPoint[];
  title: string;
}

export function EventChart({ data, title }: EventChartProps) {
  const chartData = data
    .map((item) => ({
      ...item,
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }))
    .slice(-30); // Last 30 points

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-gray-500 text-sm">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="occupancy"
              stroke="#3b82f6"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
