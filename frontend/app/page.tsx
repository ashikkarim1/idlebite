'use client';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-slate-900" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Outer plate circle */}
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5"/>
              {/* Inner plate rim */}
              <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
              {/* Fork on right side */}
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 42 44 L 42 20"/>
                <line x1="37" y1="20" x2="37" y2="26"/>
                <line x1="42" y1="20" x2="42" y2="26"/>
                <line x1="47" y1="20" x2="47" y2="26"/>
                <path d="M 37 26 Q 42 28 47 26"/>
              </g>
              {/* Knife on left side */}
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 22 44 L 22 24"/>
                <path d="M 22 24 Q 20 22 22 18 Q 24 22 22 24" fill="none"/>
              </g>
            </svg>
            <span className="text-xl font-semibold text-gray-900">IdleBite</span>
          </div>
          <a
            href="/dashboard"
            className="bg-slate-900 text-white px-6 py-2.5 rounded-md font-medium hover:bg-slate-800 transition"
          >
            Live Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <span className="inline-block text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-full">
              For Restaurants & Delivery Platforms
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 leading-tight tracking-tight">
            Stop paying for dead kitchen time
          </h1>

          <p className="text-xl text-gray-700 mb-12 leading-relaxed max-w-3xl mx-auto">
            IdleBite connects to your kitchen vision, learns your patterns, and automatically pushes intelligent offers across all delivery platforms. Fill your kitchen capacity. Protect your dining room. Eliminate wasted hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition text-lg"
            >
              See It In Action
            </a>
            <button
              className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:border-gray-400 transition text-lg"
            >
              Talk to Sales
            </button>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-8 pt-12 border-t border-gray-200">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">4-6 hrs</div>
              <div className="text-sm text-gray-600">Daily lost kitchen capacity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">$120k+</div>
              <div className="text-sm text-gray-600">Annual revenue opportunity</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-2">Real-Time</div>
              <div className="text-sm text-gray-600">Pricing across all platforms</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - The Three Steps */}
      <section className="py-24 px-6 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Three Steps to Kitchen Optimization</h2>
            <p className="text-lg text-gray-600">Simple. Clear. Proven.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1: Connect */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-2xl mb-6 mx-auto">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Connect</h3>
              <p className="text-gray-700 text-center mb-6 leading-relaxed">
                Seamless connection to your IP camera system. We read your kitchen's real-time state: occupancy, prep time, equipment status.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-gray-900">What we see:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Live kitchen occupancy</li>
                  <li>✓ Prep queue length</li>
                  <li>✓ Equipment activity</li>
                  <li>✓ Zero privacy risk (GDPR/PIPEDA)</li>
                </ul>
              </div>
            </div>

            {/* Step 2: Learn */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold text-2xl mb-6 mx-auto">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Learn</h3>
              <p className="text-gray-700 text-center mb-6 leading-relaxed">
                Our AI learns your kitchen's unique patterns: when you're under capacity, peak hours, demand elasticity by daypart and season.
              </p>
              <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-gray-900">We understand:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Your demand curves</li>
                  <li>✓ Seasonal patterns</li>
                  <li>✓ Cost structure per menu item</li>
                  <li>✓ Margin protection floors</li>
                </ul>
              </div>
            </div>

            {/* Step 3: Sell */}
            <div className="bg-white rounded-xl p-8 border border-gray-200">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold text-2xl mb-6 mx-auto">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Sell</h3>
              <p className="text-gray-700 text-center mb-6 leading-relaxed">
                Push intelligent offers to customers across Uber, DoorDash, Skip, and your native channels. Fill your kitchen. Protect your margins.
              </p>
              <div className="bg-green-50 rounded-lg p-4 space-y-2">
                <div className="text-sm font-semibold text-gray-900">We execute:</div>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ Multi-platform sync</li>
                  <li>✓ Real-time offer generation</li>
                  <li>✓ Auto-pause at 85% capacity</li>
                  <li>✓ Autonomous 24/7 operation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Timeline visualization */}
          <div className="mt-20 pt-20 border-t border-gray-200">
            <div className="bg-slate-900 rounded-lg p-8 text-white text-center">
              <div className="mb-8">
                <p className="text-lg font-semibold mb-4">Your Kitchen Flow</p>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="text-center">
                    <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mb-2">📹</div>
                    <div className="text-xs font-medium">Kitchen</div>
                    <div className="text-xs text-slate-400">Capacity 30%</div>
                  </div>
                  <div className="text-2xl text-slate-500">→</div>
                  <div className="text-center">
                    <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mb-2">🧠</div>
                    <div className="text-xs font-medium">AI Decides</div>
                    <div className="text-xs text-slate-400">15% off optimal</div>
                  </div>
                  <div className="text-2xl text-slate-500">→</div>
                  <div className="text-center">
                    <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center font-bold text-sm mb-2">📱</div>
                    <div className="text-xs font-medium">All Platforms</div>
                    <div className="text-xs text-slate-400">Customer sees offer</div>
                  </div>
                </div>
              </div>
              <p className="text-slate-300 text-sm">
                All happening every 5 seconds. 24/7. Autonomous. No manual work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem We Solve */}
      <section className="py-24 px-6 bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">The Problem You're Solving</h2>
            <p className="text-lg text-gray-600">Every restaurant loses 4-6 hours daily to empty kitchen time. It's not a staffing problem. It's a demand problem.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What You're Paying For Today</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <span className="text-red-500 font-bold text-xl">✕</span>
                  <div>
                    <div className="font-semibold text-gray-900">Dead kitchen time</div>
                    <div className="text-sm text-gray-600">Staff waiting. Equipment idle. No orders.</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-red-500 font-bold text-xl">✕</span>
                  <div>
                    <div className="font-semibold text-gray-900">Static pricing guesses</div>
                    <div className="text-sm text-gray-600">Same offer to everyone. No regard for your actual capacity state.</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-red-500 font-bold text-xl">✕</span>
                  <div>
                    <div className="font-semibold text-gray-900">Manual intervention</div>
                    <div className="text-sm text-gray-600">You manually adjust pricing when you notice capacity drops.</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-red-500 font-bold text-xl">✕</span>
                  <div>
                    <div className="font-semibold text-gray-900">Margin erosion</div>
                    <div className="text-sm text-gray-600">$120k-180k annual revenue opportunity left on the table per restaurant.</div>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">What IdleBite Changes</h3>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Automatic demand generation</div>
                    <div className="text-sm text-gray-600">Intelligent offers fill capacity without manual work.</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Real-time price optimization</div>
                    <div className="text-sm text-gray-600">Every offer respects your kitchen state and margin floors.</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Autonomous 24/7 operation</div>
                    <div className="text-sm text-gray-600">No manual intervention. System works while you sleep.</div>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="text-green-500 font-bold text-xl">✓</span>
                  <div>
                    <div className="font-semibold text-gray-900">Multi-platform execution</div>
                    <div className="text-sm text-gray-600">Uber, DoorDash, Skip, and your own channels in perfect sync.</div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Built For Restaurants & Platforms */}
      <section className="py-24 px-6 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Scale</h2>
            <p className="text-lg text-gray-600">Works for independent restaurants. Works for restaurant groups. Works for delivery platforms.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="text-2xl font-bold text-slate-900 mb-2">For Restaurants</div>
              <p className="text-gray-600 text-sm mb-6">
                Reclaim dead kitchen time. Generate demand when you have capacity. Protect margins. Eliminate guessing.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ $120k+ annual revenue recovery</li>
                <li>✓ Zero labor overhead</li>
                <li>✓ Privacy-first implementation</li>
                <li>✓ All platforms integrated</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="text-2xl font-bold text-slate-900 mb-2">For Delivery Platforms</div>
              <p className="text-gray-600 text-sm mb-6">
                Increase restaurant supply. Reduce order rejection. Build reliable capacity network. Higher margins for partners.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Predictable order fulfillment</li>
                <li>✓ Reduced customer cancellations</li>
                <li>✓ Restaurant demand growth</li>
                <li>✓ Margin-friendly pricing</li>
              </ul>
            </div>

            <div className="bg-white rounded-lg p-8 border border-gray-200">
              <div className="text-2xl font-bold text-slate-900 mb-2">For Everyone</div>
              <p className="text-gray-600 text-sm mb-6">
                Customers win with better prices at the moment they matter. Businesses win with full kitchens and protected margins.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Intelligent pricing</li>
                <li>✓ No hidden fees</li>
                <li>✓ Transparent, real-time</li>
                <li>✓ Fair margins preserved</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to stop wasting kitchen capacity?</h2>
          <p className="text-lg text-slate-300 mb-12 max-w-2xl mx-auto">
            See how restaurants are filling idle kitchen time and reclaiming $120k+ in annual revenue.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center justify-center bg-white text-slate-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Live Demo
            </a>
            <button className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition text-lg">
              Schedule Call
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12 px-6">
        <div className="container mx-auto max-w-6xl text-center text-gray-600 text-sm">
          <p>IdleBite © 2025. Helping restaurants and platforms optimize kitchen capacity in real-time.</p>
        </div>
      </footer>
    </div>
  );
}
