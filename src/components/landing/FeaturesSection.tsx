export function FeaturesSection() {
  const features = [
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: 'Employee Management',
      description: 'Comprehensive management of employee data, payroll, and leave in an easy-to-use interface'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v20m-5-5 5 5 5-5m-5-15 5 5-5-5z" />
        </svg>
      ),
      title: 'Payroll Processing',
      description: 'Automatic calculation of payroll and taxes with support for multiple currencies and bank transfers'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" />
          <path d="M16 17H8" />
          <path d="M10 9H8" />
        </svg>
      ),
      title: 'Tax Forms',
      description: 'Automatic generation of W-2, W-3, and 1099 forms with IRS compliance'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10m10-5v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5m10 0v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5m10 0v-5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v5" />
        </svg>
      ),
      title: 'Financial Reports',
      description: 'Detailed reports on payroll, taxes, and financial performance with interactive charts'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      title: 'Security & Privacy',
      description: 'Advanced data encryption with SOC 2 and GDPR compliance'
    },
    {
      icon: (
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      title: 'Speed & Efficiency',
      description: 'Instant data processing with support for accounting system integrations'
    }
  ];

  return (
    <section id="features" className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Powerful Features for Your Success
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Everything you need for payroll and tax management in one integrated platform
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-8 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all group"
            >
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mb-6 group-hover:from-blue-600 group-hover:to-indigo-600 transition-all">
                <div className="text-blue-600 group-hover:text-white transition-all">
                  {feature.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
