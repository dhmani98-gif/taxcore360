export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: '0',
      period: 'Free',
      description: 'For small startups',
      features: [
        'Up to 5 employees',
        'Basic payroll processing',
        'W-2 tax forms',
        'Basic financial reports',
        'Email support'
      ],
      cta: 'Start Free',
      popular: false
    },
    {
      name: 'Professional',
      price: '99',
      period: 'monthly',
      description: 'For growing companies',
      features: [
        'Up to 50 employees',
        'Advanced payroll processing',
        'W-2 and W-3 tax forms',
        'Detailed financial reports',
        'Phone and email support',
        'Accounting system integration',
        'Task and report management'
      ],
      cta: 'Subscribe Now',
      popular: true
    },
    {
      name: 'Enterprise',
      price: '299',
      period: 'monthly',
      description: 'For large companies',
      features: [
        'Unlimited employees',
        'Automated payroll processing',
        'All tax forms',
        'Custom financial reports',
        '24/7 support',
        'Advanced API integration',
        'Advanced permission management',
        'Dedicated team training'
      ],
      cta: 'Contact Us',
      popular: false
    }
  ];

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">
            Plans That Fit Your Needs
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            جرب أي خطة مجاناً لمدة 14 يوم — لا يحتاج بطاقة ائتمان
          </p>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mt-2">
            Choose the right plan for your business with the ability to upgrade anytime
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl border-2 transition-all ${
                plan.popular
                  ? 'border-blue-500 bg-white shadow-xl shadow-blue-500/10 scale-105'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-black text-slate-900">
                    ${plan.price}
                  </span>
                  <span className="text-slate-600">
                    {plan.period}
                  </span>
                </div>
                <p className="text-slate-600 mt-2">
                  {plan.description}
                </p>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-green-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/25'
                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
