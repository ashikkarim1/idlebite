'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const TEST_CREDENTIALS = {
  restaurant_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  user_id: 'b1234567-89ab-cdef-0123-456789abcdef',
};

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    // Store credentials in sessionStorage (MVP - replace with real auth)
    sessionStorage.setItem('restaurant_id', TEST_CREDENTIALS.restaurant_id);
    sessionStorage.setItem('user_id', TEST_CREDENTIALS.user_id);
    router.push('/dashboard');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
      <div className="card w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Kitchen Optimizer</h1>
          <p className="mt-2 text-gray-600">Restaurant Operations Dashboard</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            <strong>Demo Mode:</strong> Click below to access the test restaurant.
          </p>
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 py-2 px-4 text-white font-semibold rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Enter Dashboard'}
          </button>
        </div>

        <div className="mt-8 border-t pt-4">
          <p className="text-xs text-gray-500">
            Test Restaurant • Admin Account
          </p>
        </div>
      </div>
    </div>
  );
}
