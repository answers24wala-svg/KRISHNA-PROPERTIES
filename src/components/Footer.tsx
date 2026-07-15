import { Globe, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface FooterProps {
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload') => void;
  onSelectLocality?: (locality: string) => void;
}

export default function Footer({ setScreen, onSelectLocality }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const handleLocalityClick = (locality: string) => {
    setScreen('listings');
    if (onSelectLocality) {
      onSelectLocality(locality);
    }
  };

  return (
    <footer className="bg-brand-surface-container-low border-t border-gray-100 text-brand-on-surface pt-16 pb-8">
      <div className="max-w-(--size-container-max) mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-gray-200">
          
          {/* Logo & Info */}
          <div className="space-y-4">
            <span className="font-display text-xl font-extrabold text-brand-on-surface">
              Krishna <span className="text-brand-secondary">Properties</span>
            </span>
            <p className="text-sm text-brand-on-surface-variant max-w-xs leading-relaxed">
              Providing premium real estate solutions in Ahmedabad with unmatched trust, transparency, and high quality services.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-full bg-white hover:bg-brand-secondary hover:text-white transition-colors text-brand-on-surface-variant shadow-xs">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white hover:bg-brand-secondary hover:text-white transition-colors text-brand-on-surface-variant shadow-xs">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white hover:bg-brand-secondary hover:text-white transition-colors text-brand-on-surface-variant shadow-xs">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white hover:bg-brand-secondary hover:text-white transition-colors text-brand-on-surface-variant shadow-xs">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-sm font-bold text-brand-on-surface uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-on-surface-variant">
              <li>
                <button onClick={() => setScreen('listings')} className="hover:text-brand-secondary cursor-pointer hover:underline transition-all">
                  Buy Property
                </button>
              </li>
              <li>
                <button onClick={() => setScreen('upload')} className="hover:text-brand-secondary cursor-pointer hover:underline transition-all">
                  List Property
                </button>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Terms of Service agreement'); }} className="hover:text-brand-secondary hover:underline transition-all">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Privacy policy document'); }} className="hover:text-brand-secondary hover:underline transition-all">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Localities */}
          <div>
            <h3 className="font-display text-sm font-bold text-brand-on-surface uppercase tracking-wider mb-4">
              Localities
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-on-surface-variant">
              {['Prahlad Nagar', 'Satellite', 'South Bopal', 'Bodakdev'].map((locality) => (
                <li key={locality}>
                  <button 
                    onClick={() => handleLocalityClick(locality)}
                    className="hover:text-brand-secondary text-left cursor-pointer hover:underline transition-all"
                  >
                    {locality}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-display text-sm font-bold text-brand-on-surface uppercase tracking-wider mb-4">
              Newsletter
            </h3>
            <p className="text-sm text-brand-on-surface-variant mb-4">
              Stay updated with the latest properties in Ahmedabad.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-md text-sm text-brand-on-surface placeholder:text-gray-400 focus:outline-hidden focus:ring-1 focus:ring-brand-secondary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-primary text-white hover:bg-black/95 text-sm font-semibold py-2.5 rounded-md transition-colors shadow-sm cursor-pointer"
              >
                {subscribed ? 'Subscribed ✓' : 'Subscribe'}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-xs text-brand-on-surface-variant">
          <span>
            © {new Date().getFullYear()} Krishna Properties. All rights reserved.
          </span>
          <span className="mt-2 sm:mt-0 text-gray-400 font-mono">
            Premium Real Estate Solutions • Ahmedabad
          </span>
        </div>
      </div>
    </footer>
  );
}
