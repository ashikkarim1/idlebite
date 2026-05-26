'use client';

interface OccupancyGaugeProps {
  count: number;
  capacity: number;
  zone: string;
}

export function OccupancyGauge({ count, capacity, zone }: OccupancyGaugeProps) {
  const percentage = (count / capacity) * 100;
  let color = 'green';
  let label = 'Normal';

  if (percentage > 80) {
    color = 'red';
    label = 'At Capacity';
  } else if (percentage > 60) {
    color = 'yellow';
    label = 'Busy';
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{zone}</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-gray-900">{count}</span>
          <span className={`badge badge-${color}`}>{label}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all bg-${color === 'red' ? 'red' : color === 'yellow' ? 'yellow' : 'green'}-500`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {percentage.toFixed(0)}% of {capacity} capacity
        </p>
      </div>
    </div>
  );
}
