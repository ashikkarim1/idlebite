'use client';

interface Order {
  id: string;
  order_number: string;
  status: 'pending' | 'cooking' | 'ready' | 'picked_up';
  created_at: string;
  ready_at: string | null;
}

interface OrderListProps {
  orders: Order[];
}

const statusColors: Record<Order['status'], string> = {
  pending: 'blue',
  cooking: 'yellow',
  ready: 'green',
  picked_up: 'gray',
};

export function OrderList({ orders }: OrderListProps) {
  const recentOrders = orders.slice(0, 10);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
      <div className="space-y-3">
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No orders yet</p>
        ) : (
          recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div>
                <p className="font-semibold text-gray-900">{order.order_number}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <span className={`badge badge-${statusColors[order.status]}`}>
                {order.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
