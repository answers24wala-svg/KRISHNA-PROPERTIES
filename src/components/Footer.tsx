import { Globe, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';
import { useState, FormEvent } from 'react';

interface FooterProps {
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload' | 'dashboard' | 'privacy' | 'terms') => void;
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-gray-200">
          
          {/* Logo & Info */}
          <div className="space-y-4">
            <span className="font-display text-xl font-extrabold text-brand-on-surface">
              Krishna <span className="text-brand-secondary">Properties</span>
            </span>
            <p className="text-sm text-brand-on-surface-variant max-w-xs leading-relaxed">
              Providing premium real estate solutions in Ahmedabad with unmatched trust, transparency, and high quality services.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://www.instagram.com/_krishna_properties" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white hover:bg-brand-secondary hover:text-white transition-colors text-brand-on-surface-variant shadow-xs flex items-center justify-center"
                title="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
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
                <button 
                  onClick={() => {
                    setScreen('terms');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-brand-secondary cursor-pointer hover:underline transition-all text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    setScreen('privacy');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                  className="hover:text-brand-secondary cursor-pointer hover:underline transition-all text-left"
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Localities */}
          <div>
            <h3 className="font-display text-sm font-bold text-brand-on-surface uppercase tracking-wider mb-4">
              Localities
            </h3>
            <ul className="space-y-2.5 text-sm text-brand-on-surface-variant">
              {['CTM', 'Narol', 'Lambha', 'Isanpur', 'Maninagar'].map((locality) => (
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
