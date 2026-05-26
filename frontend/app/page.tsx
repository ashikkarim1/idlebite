'use client';

export default function HomePage() {
  return (
    <div className="bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-slate-900" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5"/>
              <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1" opacity="0.5"/>
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M 42 44 L 42 20"/>
                <line x1="37" y1="20" x2="37" y2="26"/>
                <line x1="42" y1="20" x2="42" y2="26"/>
                <line x1="47" y1="20" x2="47" y2="26"/>
                <path d="M 37 26 Q 42 28 47 26"/>
              </g>
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
      <section className="pt-24 pb-12 px-6 bg-white border-b border-gray-100">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: Copy */}
            <div>
              <div className="mb-6">
                <span className="inline-block text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-full">
                  For Restaurants & Delivery Platforms
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Stop paying for dead kitchen time
              </h1>

              <p className="text-xl text-gray-700 mb-8 leading-relaxed">
                IdleBite connects to your kitchen vision, learns your patterns, and automatically pushes intelligent offers across all delivery platforms. Fill your kitchen capacity. Protect your dining room.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
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

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">4-6 hrs</div>
                  <div className="text-sm text-gray-600">Daily lost capacity</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">$120k+</div>
                  <div className="text-sm text-gray-600">Annual revenue opportunity</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900 mb-2">Real-Time</div>
                  <div className="text-sm text-gray-600">Multi-platform pricing</div>
                </div>
              </div>
            </div>

            {/* Right: Product Demo Visual */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 overflow-hidden">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="text-white font-semibold text-sm">Kitchen Capacity Monitor</div>
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Kitchen Occupancy</span>
                    <span className="text-blue-400 font-semibold">32%</span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">Optimal Price</span>
                    <span className="text-green-400 font-semibold">-18% Discount</span>
                  </div>
                  <div className="text-xs text-slate-400">System calculated based on capacity, costs, and margin floor</div>
                </div>

                <div className="bg-slate-700 rounded-lg p-4">
                  <div className="text-slate-300 text-xs mb-2">Publishing to platforms...</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-300 text-xs">Uber Eats</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-slate-300 text-xs">DoorDash</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-slate-300 text-xs">SkipTheDishes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center">
                  <div className="text-blue-400 text-xs font-semibold">LIVE</div>
                  <div className="text-slate-200 text-xs mt-1">Offer pushed to all platforms</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 px-6 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Trusted by leading restaurant groups</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            {/* Customer Logos */}
            {[
              { name: 'Fired Pie', initials: 'FP' },
              { name: 'Freshii', initials: 'FH' },
              { name: 'Panago', initials: 'PG' },
              { name: 'Thai Express', initials: 'TE' },
              { name: 'Mary Brown', initials: 'MB' }
            ].map((customer) => (
              <div key={customer.initials} className="w-full">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{customer.initials}</span>
                </div>
                <p className="text-center text-xs text-gray-600 mt-2">{customer.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - The Three Steps */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Three Steps to Kitchen Optimization</h2>
            <p className="text-lg text-gray-600">Simple. Clear. Proven.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
          <div className="mt-12 pt-12 border-t border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-white">
              <h3 className="text-2xl font-bold mb-12 text-center">Your Kitchen Flow</h3>

              <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                {/* Step 1: Kitchen */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">Kitchen</div>
                    <div className="text-blue-100 text-sm">Capacity 32%</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center">
                  <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10 10.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Step 2: AI */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5a4 4 0 100-8 4 4 0 000 8z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">AI Decides</div>
                    <div className="text-blue-100 text-sm">-18% optimal</div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex items-center">
                  <svg className="w-8 h-8 text-white/60" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 10 10.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {/* Step 3: Platforms */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white flex items-center justify-center mb-4">
                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-lg">All Platforms</div>
                    <div className="text-blue-100 text-sm">Customer sees offer</div>
                  </div>
                </div>
              </div>

              <div className="text-center border-t border-white/20 pt-6">
                <p className="text-white font-medium">
                  All happening every 5 seconds. 24/7. Autonomous. No manual work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Platforms */}
      <section className="py-16 px-6 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto max-w-6xl text-center">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-8">Connected to all major platforms</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Uber Eats', color: 'bg-black' },
              { name: 'DoorDash', color: 'bg-red-600' },
              { name: 'Skip', color: 'bg-green-600' },
              { name: 'Native API', color: 'bg-blue-600' }
            ].map((platform) => (
              <div key={platform.name} className="flex flex-col items-center">
                <div className={`w-16 h-16 ${platform.color} rounded-lg mb-3`}></div>
                <p className="text-sm text-gray-600">{platform.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 px-6 bg-white border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Real results from real restaurants</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "We've increased revenue by $28,000 monthly with IdleBite. It's like having a pricing team working 24/7 for us.",
                author: "Marcus Chen",
                title: "Owner, Fired Pie",
                initials: "MC"
              },
              {
                quote: "The AI understands our kitchen better than we do. Pricing is now optimized automatically across all platforms.",
                author: "Sarah Patel",
                title: "Operations Manager, Freshii",
                initials: "SP"
              },
              {
                quote: "Dead kitchen time is gone. We're filling capacity during off-peak hours and protecting margins. Game changer.",
                author: "James Rodriguez",
                title: "GM, Panago Franchise Group",
                initials: "JR"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-8 border border-gray-200">
                <div className="flex gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{testimonial.author}</div>
                    <div className="text-xs text-gray-600">{testimonial.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-16 px-6 bg-slate-50 border-b border-gray-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Proven Results</h2>
            <p className="text-lg text-gray-600">What restaurants achieve with IdleBite</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { metric: '$28.5K', label: 'Average monthly revenue increase' },
              { metric: '4.2 hrs', label: 'Daily dead time eliminated' },
              { metric: '18%', label: 'Average discount optimization' },
              { metric: '99.9%', label: 'System uptime SLA' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 border border-gray-200 text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">{stat.metric}</div>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
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
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-slate-900" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5"/>
                </svg>
                <span className="font-semibold text-gray-900">IdleBite</span>
              </div>
              <p className="text-sm text-gray-600">Kitchen optimization operating system</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Features</a></li>
                <li><a href="#" className="hover:text-gray-900">Pricing</a></li>
                <li><a href="#" className="hover:text-gray-900">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">About</a></li>
                <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                <li><a href="#" className="hover:text-gray-900">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                <li><a href="#" className="hover:text-gray-900">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600 text-sm">
            <p>© 2025 IdleBite. All rights reserved. GDPR & PIPEDA compliant.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
