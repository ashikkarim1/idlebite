'use client';

export default function LogoStove() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 px-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-5xl font-bold text-white text-center mb-4">IdleBite</h1>
        <p className="text-center text-slate-300 mb-20 text-lg">Kitchen Optimization Operating System</p>

        <div className="bg-white rounded-2xl shadow-2xl p-16 mb-12">
          <div className="flex items-center justify-center mb-12">
            <svg className="w-48 h-48 text-slate-900" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {/* Outer plate circle */}
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5"/>

              {/* Inner plate rim */}
              <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1" opacity="0.5"/>

              {/* Fork on right side */}
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Fork handle */}
                <path d="M 42 44 L 42 20"/>
                {/* Fork prongs */}
                <line x1="37" y1="20" x2="37" y2="26"/>
                <line x1="42" y1="20" x2="42" y2="26"/>
                <line x1="47" y1="20" x2="47" y2="26"/>
                {/* Fork base connecting prongs */}
                <path d="M 37 26 Q 42 28 47 26"/>
              </g>

              {/* Knife on left side */}
              <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {/* Knife handle */}
                <path d="M 22 44 L 22 24"/>
                {/* Knife blade */}
                <path d="M 22 24 Q 20 22 22 18 Q 24 22 22 24" fill="none"/>
              </g>

            </svg>
          </div>

          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Plate + Cutlery + Optimization</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Clean, elegant, and immediately recognizable as a dining establishment. A plate with knife and fork represents the restaurant experience, while the blue upward accent symbolizes optimization and revenue growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">Why This Works</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>✓ Universally recognized as "fine dining" / restaurant</li>
                <li>✓ Elegant and professional aesthetic</li>
                <li>✓ Scales perfectly at any size (favicon to billboard)</li>
                <li>✓ Simple geometry = timeless design</li>
                <li>✓ Knife & fork = food service excellence</li>
                <li>✓ Blue accent = optimization, growth, AI</li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-3">What It Represents</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>🍽️ Plate = Restaurant dining experience</li>
                <li>🔪 Cutlery = Food service, excellence</li>
                <li>💙 Blue arrow = Real-time optimization</li>
                <li>📈 Upward = Revenue growth, profit</li>
                <li>🎯 Together = IdleBite kitchen OS</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-slate-300 mb-6">Does this feel right for IdleBite?</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-lg font-semibold text-lg transition">
            Yes, Use This Logo
          </button>
        </div>
      </div>
    </div>
  );
}
