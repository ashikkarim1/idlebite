'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'cooking' | 'ready' | 'picked_up';
  created_at: string;
  items: Record<string, unknown>[];
}

export default function KitchenDashboard() {
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

  // Fetch orders
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
  }, [restaurant_id, user_id]);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const cookingOrders = orders.filter((o) => o.status === 'cooking');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  const handleStatusChange = async (order_id: string, new_status: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const headers = {
      'x-restaurant-id': restaurant_id,
      'x-user-id': user_id,
    };

    try {
      await fetch(`${apiUrl}/api/restaurants/me/orders/${order_id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: new_status }),
      });

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === order_id ? { ...o, status: new_status as any } : o))
      );
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const OrderCard = ({ order }: { order: Order }) => (
    <div className="card bg-white border-2 border-gray-200 mb-3">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xl font-bold text-gray-900">#{order.order_number}</span>
        <span className="text-xs text-gray-500">
          {new Date(order.created_at).toLocaleTimeString()}
        </span>
      </div>
      <div className="mb-3">
        {order.items && order.items.length > 0 ? (
          <ul className="text-sm text-gray-700 space-y-1">
            {order.items.map((item, i) => (
              <li key={i}>• {JSON.stringify(item)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">No items</p>
        )}
      </div>
      <div className="flex gap-2">
        {order.status === 'pending' && (
          <button
            onClick={() => handleStatusChange(order.id, 'cooking')}
            className="flex-1 bg-yellow-500 text-white py-2 rounded font-semibold hover:bg-yellow-600"
          >
            Start Cooking
          </button>
        )}
        {order.status === 'cooking' && (
          <button
            onClick={() => handleStatusChange(order.id, 'ready')}
            className="flex-1 bg-green-500 text-white py-2 rounded font-semibold hover:bg-green-600"
          >
            Ready
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200 mb-8">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">🍳 Kitchen Display</h1>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Back to Dashboard
            </a>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Pending ({pendingOrders.length})
            </h2>
            {pendingOrders.length === 0 ? (
              <div className="card text-gray-500 text-center py-8">No pending orders</div>
            ) : (
              pendingOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>

          {/* Cooking */}
          <div>
            <h2 className="text-lg font-bold text-yellow-700 mb-4">
              Cooking ({cookingOrders.length})
            </h2>
            {cookingOrders.length === 0 ? (
              <div className="card text-gray-500 text-center py-8">No cooking orders</div>
            ) : (
              cookingOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>

          {/* Ready */}
          <div>
            <h2 className="text-lg font-bold text-green-700 mb-4">
              Ready ({readyOrders.length})
            </h2>
            {readyOrders.length === 0 ? (
              <div className="card text-gray-500 text-center py-8">No ready orders</div>
            ) : (
              readyOrders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
