import { useState, FormEvent } from 'react';
import { MapPin, Menu, X, PlusCircle, Lock, LogOut, CheckCircle2 } from 'lucide-react';
import KPLogo from './KPLogo';

interface NavbarProps {
  currentScreen: 'home' | 'listings' | 'detail' | 'upload';
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload') => void;
  onFilterChange?: (filters: any) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export default function Navbar({ currentScreen, setScreen, onFilterChange, isAdmin, setIsAdmin }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const navItems = [
    { label: 'Home', screen: 'home' as const },
    { label: 'Buy', screen: 'listings' as const, typeFilter: 'Apartment' },
    { label: 'Rent', screen: 'listings' as const, statusFilter: 'Ready to Move' },
    { label: 'Commercial', screen: 'listings' as const, typeFilter: 'Commercial' },
    { label: 'Services', screen: 'home' as const, scrollId: 'why-choose' },
    { label: 'About', screen: 'home' as const, scrollId: 'why-choose' },
  ];

  const handleNavClick = (item: typeof navItems[number]) => {
    setScreen(item.screen);
    setIsOpen(false);
    
    if (item.screen === 'listings' && onFilterChange) {
      if (item.typeFilter) {
        onFilterChange({ propertyType: item.typeFilter });
      } else if (item.statusFilter) {
        onFilterChange({ listingStatus: item.statusFilter });
      } else {
        onFilterChange({});
      }
    }

    if (item.scrollId) {
      setTimeout(() => {
        const element = document.getElementById(item.scrollId!);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Check credentials (Gopalnaidu085@gmail.com / Naidu@gopal#2207)
    if (username.toLowerCase() === 'gopalnaidu085@gmail.com' && password === 'Naidu@gopal#2207') {
      setLoginSuccess(true);
      setTimeout(() => {
        setIsAdmin(true);
        setIsLoginOpen(false);
        setLoginSuccess(false);
        setUsername('');
        setPassword('');
      }, 1500);
    } else {
      setLoginError('Invalid admin email or password.');
    }
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = () => {
    setIsAdmin(false);
    setLogoutConfirmOpen(false);
    if (currentScreen === 'upload') {
      setScreen('home');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-(--size-container-max) mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2 sm:py-3">
          
          {/* Logo - Stacked vertically above brand text */}
          <div 
            className="flex flex-col items-center cursor-pointer group"
            onClick={() => setScreen('home')}
            onDoubleClick={() => setIsLoginOpen(true)}
            title="Double click to open Admin Login"
          >
            <KPLogo className="w-9 h-9 transition-transform group-hover:scale-105" />
            <span className="font-display text-[11px] sm:text-[13px] font-black tracking-widest text-brand-primary uppercase -mt-0.5 leading-none text-center">
              Krishna <span className="text-brand-primary">Properties</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-7">
            {navItems.map((item) => {
              const isActive = currentScreen === item.screen;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`relative py-2 text-[13px] font-semibold tracking-wider uppercase transition-colors hover:text-brand-secondary cursor-pointer ${
                    isActive 
                      ? 'text-brand-secondary' 
                      : 'text-brand-on-surface-variant'
                  }`}
                >
                  {item.label}
                  {isActive && currentScreen === 'home' && !item.scrollId && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-secondary rounded-full" />
                  )}
                  {isActive && currentScreen === 'listings' && item.screen === 'listings' && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-secondary rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3.5">
            {/* Ahmedabad Location indicator */}
            <div className="flex items-center text-xs font-semibold text-brand-on-surface gap-1.5 px-3 py-2 bg-brand-surface-container-low rounded-full border border-gray-100">
              <MapPin className="w-3.5 h-3.5 text-brand-secondary" />
              <span>Ahmedabad</span>
            </div>

            {/* Admin Status / Login Indicator */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[11px] font-bold text-brand-secondary bg-brand-secondary/10 px-2.5 py-1.5 rounded-md border border-brand-secondary/20 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Admin Mode
                </span>
                <button
                  onClick={handleLogoutClick}
                  className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 border border-gray-100 transition-colors cursor-pointer"
                  title="Log out of Admin Mode"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button 
                className="p-2 text-gray-500 hover:text-brand-secondary rounded-md hover:bg-gray-50 border border-gray-200 transition-all cursor-pointer flex items-center justify-center"
                onClick={() => setIsLoginOpen(true)}
                title="Admin Portal Login"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* List Property - visible ONLY to Admin */}
            {isAdmin && (
              <button
                onClick={() => setScreen('upload')}
                className={`flex items-center gap-1.5 px-4.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  currentScreen === 'upload'
                    ? 'bg-brand-secondary text-white shadow-md'
                    : 'bg-brand-primary text-white hover:bg-brand-primary/90'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>List Property</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <div className="flex items-center text-[10px] font-bold text-brand-on-surface gap-1 px-2.5 py-1.5 bg-brand-surface-container-low rounded-full border border-gray-100">
              <MapPin className="w-3 h-3 text-brand-secondary" />
              <span>Ahmedabad</span>
            </div>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-brand-on-surface hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-inner">
          <div className="px-4 pt-2 pb-4 space-y-1 sm:px-6">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="block w-full text-left px-3 py-2.5 rounded-md text-[13px] font-bold uppercase tracking-wider text-brand-on-surface hover:bg-gray-50 hover:text-brand-secondary transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              {isAdmin ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 bg-brand-secondary/5 rounded-md border border-brand-secondary/10">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-brand-secondary uppercase tracking-wider">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Admin Mode Active
                    </span>
                    <button
                      onClick={() => { setIsOpen(false); handleLogoutClick(); }}
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3 h-3" />
                      Log out
                    </button>
                  </div>
                  <button 
                    className="block w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-md bg-brand-primary text-white cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                      setScreen('upload');
                    }}
                  >
                    List Property
                  </button>
                </>
              ) : (
                <button 
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    setIsLoginOpen(true);
                  }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </header>

      {/* Elegant Admin Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-sm my-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            
            {/* Header decor - Mini logo */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <KPLogo className="w-14 h-14" />
              <div>
                <h3 className="font-display text-lg font-black tracking-tight text-brand-on-surface">Admin Portal Login</h3>
                <p className="text-xs text-brand-on-surface-variant font-light mt-0.5">Use administrative credentials to manage listings.</p>
              </div>
            </div>

            {/* Form or Success indicator */}
            {loginSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-brand-primary/15 rounded-full flex items-center justify-center mx-auto text-brand-primary animate-pulse">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-brand-on-surface">Successfully Authorized</h4>
                  <p className="text-xs text-brand-on-surface-variant font-light mt-1.5">Switching to administrator workspace...</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">Email Address</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Gopalnaidu085@gmail.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 font-mono italic">Tip: Use your registered administrator email</p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginOpen(false);
                      setLoginError('');
                      setUsername('');
                      setPassword('');
                    }}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-primary/95 rounded-lg shadow-sm transition-colors cursor-pointer text-center"
                  >
                    Authorize
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Elegant Custom Logout Dialog */}
      {logoutConfirmOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-sm my-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 text-center space-y-5 overflow-y-auto max-h-[90vh]">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-base text-brand-on-surface">Exit Admin Workspace?</h3>
              <p className="text-xs text-brand-on-surface-variant font-light leading-relaxed">
                Are you sure you want to log out of Admin Mode? You will lose temporary edit and delete privileges until you authorize again.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Confirm Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
