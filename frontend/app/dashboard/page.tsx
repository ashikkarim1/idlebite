'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';
import { OccupancyGauge } from '@/components/OccupancyGauge';
import { EventChart } from '@/components/EventChart';
import { OrderList } from '@/components/OrderList';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'cooking' | 'ready' | 'picked_up';
  created_at: string;
  ready_at: string | null;
}

interface Event {
  id: string;
  event_type: string;
  data: { count?: number; timestamp?: string };
  timestamp: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [restaurant_id, setRestaurantId] = useState('');
  const [user_id, setUserId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [occupancyEvents, setOccupancyEvents] = useState<Event[]>([]);
  const [diningRoomOccupancy, setDiningRoomOccupancy] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(false);
  }, [router]);

  // Fetch initial data
  useEffect(() => {
    if (!restaurant_id || !user_id) return;

    const fetchData = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        'x-restaurant-id': restaurant_id,
        'x-user-id': user_id,
      };

      try {
        const [ordersRes, eventsRes] = await Promise.all([
          fetch(`${apiUrl}/api/restaurants/me/orders`, { headers }),
          fetch(`${apiUrl}/api/events`, { headers }),
        ]);

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData);
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setOccupancyEvents(eventsData.filter((e: Event) => e.event_type === 'occupancy'));

          // Get latest occupancy count
          const latestOccupancy = eventsData
            .filter((e: Event) => e.event_type === 'occupancy')
            .sort((a: Event, b: Event) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

          if (latestOccupancy?.data?.count) {
            setDiningRoomOccupancy(latestOccupancy.data.count);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [restaurant_id, user_id]);

  // Listen for real-time events
  useSocketEvent('event', (event: unknown) => {
    const evt = event as Event;

    if (evt.event_type === 'occupancy') {
      setOccupancyEvents((prev) => [...prev, evt].slice(-100)); // Keep last 100
      if (evt.data?.count !== undefined) {
        setDiningRoomOccupancy(evt.data.count);
      }
    }

    if (evt.event_type === 'order') {
      // Refresh orders on new order event
      if (socket) {
        socket.emit('refresh_orders');
      }
    }
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Kitchen Optimizer</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {connected ? 'Live' : 'Offline'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Top Row - Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <OccupancyGauge
            count={diningRoomOccupancy}
            capacity={100}
            zone="Dining Room"
          />
          <OccupancyGauge count={0} capacity={20} zone="Kitchen Queue" />
          <OccupancyGauge
            count={orders.filter((o) => o.status === 'ready').length}
            capacity={30}
            zone="Pickup Desk"
          />
        </div>

        {/* Middle - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EventChart
            title="Dining Room Occupancy (Last 30 min)"
            data={occupancyEvents.map((e) => ({
              timestamp: e.timestamp,
              occupancy: e.data?.count || 0,
            }))}
          />
          <OrderList orders={orders} />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <a href="/dashboard/merchant" className="card text-center hover:shadow-lg transition bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900">💰 Revenue</h3>
            <p className="text-sm text-purple-700 mt-2">Offers & metrics</p>
          </a>
          <a href="/dashboard/kitchen" className="card text-center hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900">🍳 Kitchen</h3>
            <p className="text-sm text-gray-600 mt-2">Order flow & prep status</p>
          </a>
          <a href="/dashboard/dining-room" className="card text-center hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900">🪑 Dining Room</h3>
            <p className="text-sm text-gray-600 mt-2">Occupancy & capacity</p>
          </a>
          <a href="/dashboard/pickupdesk" className="card text-center hover:shadow-lg transition">
            <h3 className="text-lg font-semibold text-gray-900">📦 Pickup</h3>
            <p className="text-sm text-gray-600 mt-2">Ready orders & timing</p>
          </a>
        </div>
      </main>
    </div>
  );
}
