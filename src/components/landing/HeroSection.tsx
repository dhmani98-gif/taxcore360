interface HeroSectionProps {
  onNavigateToAuth?: (screen: 'signin' | 'register') => void;
}

export function HeroSection({ onNavigateToAuth }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-6">
              Comprehensive Platform for
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {' '}Payroll & Taxes
              </span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Smart solutions for payroll management, tax forms, and compliance for the US market in one easy-to-use platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => onNavigateToAuth?.('register')}
                className="px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl hover:shadow-xl hover:shadow-blue-500/25 transition-all transform hover:-translate-y-1"
              >
                Start Free
              </button>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-4 text-lg font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-2xl hover:border-blue-500 hover:text-blue-600 transition-all"
              >
                Explore Features
              </button>
            </div>
            <div className="mt-12 flex items-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">500+</p>
                <p className="text-sm text-slate-600">Companies</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">10K+</p>
                <p className="text-sm text-slate-600">Employees</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">99%</p>
                <p className="text-sm text-slate-600">Satisfaction</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl shadow-blue-500/25">
              <div className="bg-white rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M12 2v20m-5-5 5 5 5-5m-5-15 5 5-5-5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Payroll Management</p>
                    <p className="text-sm text-slate-600">Automated Processing</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">Active Employees</span>
                    <span className="font-bold text-slate-900">156</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">Total Payroll</span>
                    <span className="font-bold text-slate-900">$1.2M</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="text-sm text-slate-700">Taxes Remitted</span>
                    <span className="font-bold text-green-600">$180K</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 h-20 w-20 bg-yellow-400 rounded-full opacity-50 blur-xl" />
            <div className="absolute -bottom-4 -left-4 h-20 w-20 bg-blue-400 rounded-full opacity-50 blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
