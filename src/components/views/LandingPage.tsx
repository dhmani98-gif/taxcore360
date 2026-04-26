import { useState } from 'react';
import { HeroSection } from '../../components/landing/HeroSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { PricingSection } from '../../components/landing/PricingSection';
import { ContactForm } from '../../components/landing/ContactForm';

interface LandingPageProps {
  onNavigateToAuth: (screen: 'signin' | 'register') => void;
}

export function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/images/logo.png" 
              alt="TaxCore360" 
              className="h-12 w-auto max-w-[200px] object-contain"
              onError={(e) => {
                // Fallback if logo doesn't load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                      <span class="text-white font-bold text-xl">TC</span>
                    </div>
                    <span class="text-2xl font-bold text-slate-900">TaxCore360</span>
                  `;
                }
              }}
            />
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowContactForm(true)}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
            >
              Contact Us
            </button>
            <button 
              onClick={() => onNavigateToAuth('signin')}
              className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection onNavigateToAuth={onNavigateToAuth} />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
              <button 
                onClick={() => setShowContactForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ContactForm onClose={() => setShowContactForm(false)} />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/images/logo.png" 
                  alt="TaxCore360" 
                  className="h-11 w-auto max-w-[180px] object-contain brightness-200"
                />
              </div>
              <p className="text-slate-400 text-sm">
                Comprehensive platform for payroll management, tax forms, and compliance
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Services</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>Payroll Management</li>
                <li>Tax Forms</li>
                <li>Financial Reports</li>
                <li>Employee Management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>About Us</li>
                <li>Our Team</li>
                <li>Careers</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Contact</h3>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>info@taxcore360.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA, USA</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2024 TaxCore360. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
