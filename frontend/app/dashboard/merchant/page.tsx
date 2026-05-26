'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket, useSocketEvent } from '@/hooks/useSocket';

interface Offer {
  id: string;
  title: string;
  discount_percentage: number;
  status: string;
  valid_from: string;
  valid_until: string;
  auto_generated: boolean;
  created_at: string;
}

interface Event {
  id: string;
  event_type: string;
  data: { count?: number };
  timestamp: string;
}

export default function MerchantDashboard() {
  const router = useRouter();
  const [restaurant_id, setRestaurantId] = useState('');
  const [user_id, setUserId] = useState('');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [occupancy, setOccupancy] = useState(0);
  const [capacityScore, setCapacityScore] = useState(0);
  const [capacityLevel, setCapacityLevel] = useState('normal');
  const [offerMetrics, setOfferMetrics] = useState<any>({});
  const [deliveryMetrics, setDeliveryMetrics] = useState<any>({});
  const [config, setConfig] = useState<any>(null);
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
        const [offersRes, configRes, metricsRes, deliveryRes] = await Promise.all([
          fetch(`${apiUrl}/api/offers`, { headers }),
          fetch(`${apiUrl}/api/offers/config`, { headers }),
          fetch(`${apiUrl}/api/offers/metrics`, { headers }),
          fetch(`${apiUrl}/api/delivery/metrics`, { headers }),
        ]);

        if (offersRes.ok) {
          const offersData = await offersRes.json();
          setOffers(offersData);
        }

        if (configRes.ok) {
          const configData = await configRes.json();
          setConfig(configData);
        }

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json();
          setOfferMetrics(metricsData);
        }

        if (deliveryRes.ok) {
          const deliveryData = await deliveryRes.json();
          setDeliveryMetrics(deliveryData);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    fetchData();
  }, [restaurant_id, user_id]);

  // Listen for real-time occupancy updates
  useSocketEvent('event', (event: unknown) => {
    const evt = event as Event;

    if (evt.event_type === 'occupancy' && evt.data?.count !== undefined) {
      setOccupancy(evt.data.count);

      // Calculate capacity score: 75% kitchen + 25% pickup
      const score = evt.data.count * 0.75;
      setCapacityScore(Math.round(score));

      // Determine level
      if (score < 40) setCapacityLevel('underutilized');
      else if (score < 70) setCapacityLevel('normal');
      else if (score < 85) setCapacityLevel('caution');
      else setCapacityLevel('protection');

      // Auto-trigger offer logic (or could be backend-driven)
      if (score < 40 && offers.filter(o => o.status === 'active').length === 0) {
        triggerAutoLaunch();
      }
    }
  });

  const triggerAutoLaunch = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const headers = {
      'x-restaurant-id': restaurant_id,
      'x-user-id': user_id,
    };

    try {
      const res = await fetch(`${apiUrl}/api/offers/auto-launch`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitchen_occupancy: occupancy,
          pickup_congestion: 0,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log('Auto-launch result:', result);

        // Refresh offers
        const offersRes = await fetch(`${apiUrl}/api/offers`, { headers });
        if (offersRes.ok) {
          const offersData = await offersRes.json();
          setOffers(offersData);
        }
      }
    } catch (err) {
      console.error('Auto-launch failed:', err);
    }
  };

  const getCapacityColor = (level: string) => {
    switch (level) {
      case 'underutilized':
        return 'text-blue-600';
      case 'caution':
        return 'text-yellow-600';
      case 'protection':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  };

  const getCapacityBgColor = (level: string) => {
    switch (level) {
      case 'underutilized':
        return 'bg-blue-50 border-blue-200';
      case 'caution':
        return 'bg-yellow-50 border-yellow-200';
      case 'protection':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">💰 Revenue Optimizer</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">{connected ? 'Live' : 'Offline'}</span>
            </div>
            <a href="/dashboard" className="text-blue-600 hover:text-blue-700">
              Back
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Capacity Alert */}
        <div className={`mb-8 p-6 rounded-lg border-2 ${getCapacityBgColor(capacityLevel)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${getCapacityColor(capacityLevel)}`}>
                Capacity: {capacityLevel.toUpperCase()}
              </h2>
              <p className="text-gray-600 mt-2">
                Current occupancy: {occupancy}% | Capacity Score: {capacityScore}/100
              </p>
            </div>
            <div className="text-right">
              {capacityLevel === 'underutilized' && (
                <button
                  onClick={triggerAutoLaunch}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Launch Offer Now
                </button>
              )}
              {capacityLevel === 'protection' && (
                <p className="text-red-600 font-semibold">⚠️ At Capacity - Offers Paused</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Active Offers */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎯 Active Offers ({offers.filter(o => o.status === 'active').length})
              </h3>

              {offers.filter(o => o.status === 'active').length === 0 ? (
                <p className="text-gray-500">No active offers</p>
              ) : (
                <div className="space-y-3">
                  {offers
                    .filter(o => o.status === 'active')
                    .map(offer => (
                      <div key={offer.id} className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded border border-green-300">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-lg font-bold text-green-900">{offer.title}</p>
                            <p className="text-sm text-green-700">
                              {offer.discount_percentage}% off{offer.auto_generated ? ' (Auto-generated)' : ''}
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Expires: {new Date(offer.valid_until).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className="bg-green-600 text-white px-3 py-1 rounded text-sm font-semibold">
                            LIVE
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {offers.filter(o => o.status === 'draft' || o.status === 'paused').length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold text-gray-700 mb-3">Other Offers</h4>
                  {offers
                    .filter(o => o.status !== 'active')
                    .map(offer => (
                      <div key={offer.id} className="p-3 bg-gray-50 rounded mb-2 flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-900">{offer.title}</p>
                          <p className="text-sm text-gray-600">{offer.status}</p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 text-sm">Edit</button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Metrics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Metrics (24h)</h3>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Offers Launched</p>
                <p className="text-3xl font-bold text-blue-600">{offerMetrics.launched || 0}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Total Redemptions</p>
                <p className="text-3xl font-bold text-green-600">{offerMetrics.redeemed || 0}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Additional Revenue</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${offerMetrics.total_revenue ? offerMetrics.total_revenue.toFixed(2) : '0.00'}
                </p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">Avg Orders/Offer</p>
                <p className="text-2xl font-bold text-gray-900">
                  {offerMetrics.avg_orders_per_offer || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Metrics */}
        {Object.keys(deliveryMetrics).length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚗 Delivery Performance</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(deliveryMetrics).map(([platform, metrics]: any) => (
                <div key={platform} className="p-4 bg-gray-50 rounded">
                  <p className="font-semibold text-gray-900 capitalize">{platform}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {metrics.total_orders} orders
                  </p>
                  <p className="text-xs text-gray-500">
                    Avg: ${metrics.avg_cost?.toFixed(2) || '0.00'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration */}
        {config && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚙️ Configuration</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Food Cost %</p>
                <p className="text-lg font-semibold text-gray-900">{config.food_cost_percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Target Margin %</p>
                <p className="text-lg font-semibold text-gray-900">{config.target_margin_percentage}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Offer Cooldown</p>
                <p className="text-lg font-semibold text-gray-900">{config.offer_cooldown_minutes}m</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Auto Offers</p>
                <p className="text-lg font-semibold text-gray-900">
                  {config.auto_offers_enabled ? '✓ Enabled' : '✗ Disabled'}
                </p>
              </div>
            </div>

            <button className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-semibold">
              Edit Configuration
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
