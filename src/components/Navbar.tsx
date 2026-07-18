import { useState, FormEvent } from 'react';
import { MapPin, Menu, X, PlusCircle, Lock, LogOut, CheckCircle2, User } from 'lucide-react';
import KPLogo from './KPLogo';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

interface NavbarProps {
  currentScreen: 'home' | 'listings' | 'detail' | 'upload' | 'dashboard';
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload' | 'dashboard') => void;
  onFilterChange?: (filters: any) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  userRole: 'buyer' | 'seller' | null;
  setUserRole: (role: 'buyer' | 'seller' | null) => void;
}

// Memory store to persist local sandbox registration roles across logins
const mockUserDb: Record<string, 'buyer' | 'seller'> = {};

export default function Navbar({ 
  currentScreen, 
  setScreen, 
  onFilterChange, 
  isAdmin, 
  setIsAdmin,
  userEmail,
  setUserEmail,
  userRole,
  setUserRole
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupRole, setSignupRole] = useState<'buyer' | 'seller'>('buyer');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navItems = [
    { label: 'Home', screen: 'home' as const },
    { label: 'Buy', screen: 'listings' as const, typeFilter: 'Apartment' },
    { label: 'Rent', screen: 'listings' as const, statusFilter: 'Ready to Move' },
    { label: 'Commercial', screen: 'listings' as const, typeFilter: 'Commercial' },
    { label: 'Services', screen: 'home' as const, scrollId: 'why-choose' },
    { label: 'About', screen: 'home' as const, scrollId: 'why-choose' },
    ...(isAdmin ? [{ label: 'Dashboard', screen: 'dashboard' as const }] : [])
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

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Check credentials locally first as bypass for sandboxes
    const isAdminCreds = username.toLowerCase() === 'gopalnaidu085@gmail.com' && password === 'Naidu@gopal#2207';

    if (isSupabaseConfigured && supabase !== null) {
      setIsSubmitting(true);
      try {
        if (authMode === 'login') {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
          });
          if (error) {
            // Local admin bypass
            if (isAdminCreds) {
              setLoginSuccess(true);
              setTimeout(() => {
                setIsAdmin(true);
                setUserEmail('Gopalnaidu085@gmail.com');
                setUserRole('seller');
                setIsLoginOpen(false);
                setLoginSuccess(false);
                setUsername('');
                setPassword('');
              }, 1000);
              return;
            }
            setLoginError(error.message);
            return;
          }
          const email = data.user?.email || username;
          const role = data.user?.user_metadata?.role || 'buyer';
          setLoginSuccess(true);
          setTimeout(() => {
            if (email.toLowerCase() === 'gopalnaidu085@gmail.com') {
              setIsAdmin(true);
              setUserRole('seller');
            } else {
              setIsAdmin(false);
              setUserRole(role);
            }
            setUserEmail(email);
            setIsLoginOpen(false);
            setLoginSuccess(false);
            setUsername('');
            setPassword('');
          }, 1000);
        } else {
          const { error } = await supabase.auth.signUp({
            email: username,
            password: password,
            options: {
              data: {
                role: signupRole
              }
            }
          });
          if (error) {
            setLoginError(error.message);
            return;
          }
          mockUserDb[username.toLowerCase()] = signupRole;
          setSignupSuccess(true);
        }
      } catch (err: any) {
        setLoginError(err?.message || String(err));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local sandbox logic
      if (authMode === 'login') {
        if (isAdminCreds) {
          setLoginSuccess(true);
          setTimeout(() => {
            setIsAdmin(true);
            setUserEmail('Gopalnaidu085@gmail.com');
            setUserRole('seller');
            setIsLoginOpen(false);
            setLoginSuccess(false);
            setUsername('');
            setPassword('');
          }, 1000);
        } else {
          // Look up in mock database
          const role = mockUserDb[username.toLowerCase()] || (username.toLowerCase().includes('seller') ? 'seller' : 'buyer');
          setLoginSuccess(true);
          setTimeout(() => {
            setIsAdmin(false);
            setUserEmail(username);
            setUserRole(role);
            setIsLoginOpen(false);
            setLoginSuccess(false);
            setUsername('');
            setPassword('');
          }, 1000);
        }
      } else {
        mockUserDb[username.toLowerCase()] = signupRole;
        setSignupSuccess(true);
      }
    }
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const confirmLogout = async () => {
    if (isSupabaseConfigured && supabase !== null) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error(e);
      }
    }
    setIsAdmin(false);
    setUserEmail(null);
    setUserRole(null);
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
                  {isActive && currentScreen === 'dashboard' && (
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

            {/* Login / Auth Indicator */}
            {isAdmin || userEmail ? (
              <div className="flex items-center gap-2 bg-brand-primary/10 border border-brand-primary/20 px-3 py-1.5 rounded-full text-xs font-semibold text-brand-primary">
                <User className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate max-w-[150px]">
                  {isAdmin ? 'Admin Mode' : `${userEmail?.split('@')[0]} (${userRole === 'seller' ? 'Seller' : 'Buyer'})`}
                </span>
                <button 
                  onClick={handleLogoutClick}
                  className="ml-1 text-gray-400 hover:text-red-500 cursor-pointer shrink-0"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setIsLoginOpen(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:border-brand-primary hover:bg-brand-surface rounded-full text-xs font-semibold text-brand-on-surface hover:text-brand-primary transition-all cursor-pointer flex items-center justify-center"
                title="Login / Signup"
              >
                <User className="w-4 h-4" />
                <span>Login / Signup</span>
              </button>
            )}

            {/* List Property - visible ONLY to Admin */}
            {(isAdmin || userRole === 'seller') && (
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
              {isAdmin || userEmail ? (
                <>
                  <div className="flex items-center justify-between px-3 py-2 bg-brand-secondary/5 rounded-md border border-brand-secondary/10">
                    <span className="flex items-center gap-1 text-[11px] font-bold text-brand-secondary uppercase tracking-wider truncate max-w-[180px]">
                      <User className="w-3.5 h-3.5 shrink-0" />
                      <span>{isAdmin ? 'Admin Mode Active' : `${userEmail?.split('@')[0]} (${userRole === 'seller' ? 'Seller' : 'Buyer'})`}</span>
                    </span>
                    <button
                      onClick={() => { setIsOpen(false); handleLogoutClick(); }}
                      className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log out</span>
                    </button>
                  </div>
                  {(isAdmin || userRole === 'seller') && (
                    <button 
                      className="block w-full text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-md bg-brand-primary text-white cursor-pointer"
                      onClick={() => {
                        setIsOpen(false);
                        setScreen('upload');
                      }}
                    >
                      List Property
                    </button>
                  )}
                </>
              ) : (
                <button 
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setIsOpen(false);
                    setAuthMode('login');
                    setIsLoginOpen(true);
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Login / Signup</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </header>

      {/* Elegant Login / Signup Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-sm my-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            
            {/* Header decor - Mini logo */}
            <div className="flex flex-col items-center text-center space-y-3 mb-6">
              <KPLogo className="w-14 h-14" />
              <div>
                <h3 className="font-display text-lg font-black tracking-tight text-brand-on-surface">
                  {authMode === 'login' ? 'Login' : 'Create Account'}
                </h3>
                <p className="text-xs text-brand-on-surface-variant font-light mt-0.5">
                  {authMode === 'login' 
                    ? 'Log in to browse properties and manage listings.' 
                    : 'Sign up to register a new user account.'}
                </p>
              </div>
            </div>

            {/* Login / Signup mode tabs */}
            <div className="flex bg-gray-50 p-1 rounded-lg mb-6 border border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setLoginError('');
                  setSignupSuccess(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  authMode === 'login' 
                    ? 'bg-white text-brand-primary shadow-xs' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setLoginError('');
                  setSignupSuccess(false);
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  authMode === 'signup' 
                    ? 'bg-white text-brand-primary shadow-xs' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form or Success indicator */}
            {loginSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-brand-primary/15 rounded-full flex items-center justify-center mx-auto text-brand-primary animate-pulse">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-brand-on-surface">Successfully Authenticated</h4>
                  <p className="text-xs text-brand-on-surface-variant font-light mt-1.5">Loading account workspace...</p>
                </div>
              </div>
            ) : signupSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-brand-primary/15 rounded-full flex items-center justify-center mx-auto text-brand-primary animate-bounce">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-brand-on-surface">Account Created</h4>
                  <p className="text-xs text-brand-on-surface-variant font-light mt-2 px-2 leading-relaxed">
                    You have successfully signed up as a <span className="font-bold text-brand-primary uppercase">{signupRole}</span>.
                    You can now select "Login" above to sign in to your new account.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSignupSuccess(false);
                      setAuthMode('login');
                      setUsername('');
                      setPassword('');
                    }}
                    className="mt-6 w-full py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-xs transition-colors cursor-pointer text-center"
                  >
                    Go to Login
                  </button>
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
                    type="email"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="name@example.com"
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
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-2 text-left">Register As</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSignupRole('buyer')}
                        className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signupRole === 'buyer'
                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-xs'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-bold">Buyer</span>
                        <span className="text-[9px] font-light opacity-80">Buy Property</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupRole('seller')}
                        className={`py-2 px-3 text-xs font-bold border rounded-lg transition-all cursor-pointer flex flex-col items-center gap-1 ${
                          signupRole === 'seller'
                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary shadow-xs'
                            : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                      >
                        <span className="font-bold">Seller</span>
                        <span className="text-[9px] font-light opacity-80">Sell Property</span>
                      </button>
                    </div>
                  </div>
                )}

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
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-primary/95 rounded-lg shadow-sm transition-colors cursor-pointer text-center disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? 'Wait...' 
                      : (authMode === 'login' ? 'Log In' : 'Sign Up')}
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
              <h3 className="font-display font-extrabold text-base text-brand-on-surface">Exit Account Session?</h3>
              <p className="text-xs text-brand-on-surface-variant font-light leading-relaxed">
                Are you sure you want to log out of your session?
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
