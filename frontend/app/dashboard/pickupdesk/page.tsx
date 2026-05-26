'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/useSocket';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'cooking' | 'ready' | 'picked_up';
  created_at: string;
  ready_at: string | null;
}

export default function PickupDeskDashboard() {
  const router = useRouter();
  const [restaurant_id, setRestaurantId] = useState('');
  const [user_id, setUserId] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
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

    const fetchOrders = async () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers = {
        'x-restaurant-id': restaurant_id,
        'x-user-id': user_id,
      };

      try {
        const res = await fetch(`${apiUrl}/api/restaurants/me/orders`, { headers });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [restaurant_id, user_id]);

  const handlePickup = async (order_id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const headers = {
      'x-restaurant-id': restaurant_id,
      'x-user-id': user_id,
    };

    try {
      await fetch(`${apiUrl}/api/restaurants/me/orders/${order_id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'picked_up' }),
      });

      setOrders((prev) =>
        prev.map((o) => (o.id === order_id ? { ...o, status: 'picked_up' } : o))
      );
    } catch (err) {
      console.error('Failed to mark pickup:', err);
    }
  };

  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">📦 Pickup Desk</h1>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-700 mb-6">
            Ready for Pickup ({readyOrders.length})
          </h2>

          {readyOrders.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <p className="text-lg">No orders ready for pickup</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyOrders.map((order) => {
                const waitTime = order.ready_at
                  ? Math.floor(
                      (new Date().getTime() - new Date(order.ready_at).getTime()) / 60000
                    )
                  : 0;

                return (
                  <div
                    key={order.id}
                    className={`card border-2 ${waitTime > 5 ? 'border-red-300' : 'border-green-300'} bg-green-50`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-4xl font-bold text-green-700">#{order.order_number}</span>
                      <span className={`badge ${waitTime > 5 ? 'badge-red' : 'badge-green'}`}>
                        {waitTime}m waiting
                      </span>
                    </div>
                    <button
                      onClick={() => handlePickup(order.id)}
                      className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition"
                    >
                      ✓ Picked Up
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
