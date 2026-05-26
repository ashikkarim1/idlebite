'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { EventChart } from '@/components/EventChart';
import { OccupancyGauge } from '@/components/OccupancyGauge';

interface Event {
  timestamp: string;
  data: { count?: number };
  event_type: string;
}

export default function DiningRoomDashboard() {
  const router = useRouter();
  const [restaurant_id, setRestaurantId] = useState('');
  const [user_id, setUserId] = useState('');
  const [occupancyEvents, setOccupancyEvents] = useState<Event[]>([]);
  const [currentOccupancy, setCurrentOccupancy] = useState(0);
  const { socket, connected } = useSocket(restaurant_id, user_id);

  useEffect(() => {
    const stored_restaurant_id = sessionStorage.getItem('restaurant_id');
    const stored_user_id = sessionStorage.getItem('user_id');

    if (!stored_restaurant_id || !stored_user_id) {
      router.push('/');
      return;
    }

    setRestaurantId(stored_restaurant_id);
    setUserId(stored_user_id);
  }, [router]);

  useEffect(() => {
    if (!restaurant_id || !user_id) return;

    const fetchData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        'x-restaurant-id': restaurant_id,
        'x-user-id': user_id,
      };

      try {
        const res = await fetch(`${apiUrl}/api/events`, { headers });
        if (res.ok) {
          const data = await res.json();
          const occupancy = data.filter((e: Event) => e.event_type === 'occupancy');
          setOccupancyEvents(occupancy);

          const latest = occupancy.sort(
            (a: Event, b: Event) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];

          if (latest?.data?.count) {
            setCurrentOccupancy(latest.data.count);
          }
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    fetchData();
  }, [restaurant_id, user_id]);

  useSocketEvent('event', (event: unknown) => {
    const evt = event as Event;
    if (evt.event_type === 'occupancy') {
      setOccupancyEvents((prev) => [...prev, evt].slice(-200));
      if (evt.data?.count !== undefined) {
        setCurrentOccupancy(evt.data.count);
      }
    }
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🪑 Dining Room Monitor</h1>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <OccupancyGauge count={currentOccupancy} capacity={100} zone="Current Occupancy" />
        </div>

        <EventChart
          title="Occupancy Trend (Last 2 hours)"
          data={occupancyEvents.map((e) => ({
            timestamp: e.timestamp,
            occupancy: e.data?.count || 0,
          }))}
        />
      </div>
    </div>
  );
}
