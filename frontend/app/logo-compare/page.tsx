'use client';

export default function LogoCompare() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6">Choose Your Logo</h1>
        <p className="text-center text-gray-600 mb-16">Pick which one you like best</p>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Option 1 */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center hover:border-blue-500 transition cursor-pointer">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-slate-50 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-slate-900" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M32 50 L32 18 M24 26 L32 18 L40 26" stroke="currentColor" strokeWidth="3"/>
                  <ellipse cx="32" cy="48" rx="20" ry="6" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M12 48 Q12 36 32 32 Q52 36 52 48" stroke="currentColor" strokeWidth="2.5" fill="none"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Option 1</h2>
            <p className="text-gray-600 mb-4">Plate + Upward Arrow</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Clean and modern</li>
              <li>✓ Food-focused</li>
              <li>✓ Upward growth symbolism</li>
              <li>✓ Works at any size</li>
            </ul>
          </div>

          {/* Option 3 */}
          <div className="bg-white rounded-lg border-2 border-gray-200 p-12 text-center hover:border-blue-500 transition cursor-pointer">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto bg-slate-50 rounded-lg flex items-center justify-center">
                <svg className="w-24 h-24 text-slate-900" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 48 L18 20 Q18 14 24 14 L40 14 Q46 14 46 20 L46 48" stroke="currentColor" strokeWidth="2.5"/>
                  <line x1="24" y1="14" x2="24" y2="48" stroke="currentColor" strokeWidth="2.5"/>
                  <line x1="32" y1="14" x2="32" y2="48" stroke="currentColor" strokeWidth="2.5"/>
                  <line x1="40" y1="14" x2="40" y2="48" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M50 35 L50 25 M46 29 L50 25 L54 29" stroke="currentColor" strokeWidth="2.5"/>
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Option 3</h2>
            <p className="text-gray-600 mb-4">Fork + Arrow Accent</p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>✓ Restaurant classic</li>
              <li>✓ Dynamic with arrow</li>
              <li>✓ Balanced design</li>
              <li>✓ Professional</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <p className="text-gray-700 mb-4">Tell me which one you prefer:</p>
          <div className="flex gap-4 justify-center">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Choose Option 1
            </button>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Choose Option 3
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
