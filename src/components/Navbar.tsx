import { useState, FormEvent, useEffect } from 'react';
import { MapPin, Menu, X, PlusCircle, Lock, LogOut, CheckCircle2, User } from 'lucide-react';
import KPLogo from './KPLogo';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { firebaseAuth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

interface NavbarProps {
  currentScreen: 'home' | 'listings' | 'detail' | 'upload' | 'dashboard' | 'privacy' | 'terms';
  setScreen: (screen: 'home' | 'listings' | 'detail' | 'upload' | 'dashboard' | 'privacy' | 'terms') => void;
  onFilterChange?: (filters: any) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  userRole: 'buyer' | 'seller' | null;
  setUserRole: (role: 'buyer' | 'seller' | null) => void;
  triggerSellerLoginCounter?: number;
}

interface MockUser {
  name?: string;
  email: string;
  phone: string;
  role: 'buyer' | 'seller';
}
// Memory store to persist local sandbox registration roles across logins
const mockUserDb: Record<string, MockUser> = {};

export default function Navbar({ 
  currentScreen, 
  setScreen, 
  onFilterChange, 
  isAdmin, 
  setIsAdmin,
  userEmail,
  setUserEmail,
  userRole,
  setUserRole,
  triggerSellerLoginCounter
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password' | 'phone-login' | 'phone-otp' | 'complete-phone-signup'>('login');
  const [signupRole, setSignupRole] = useState<'buyer' | 'seller'>('buyer');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [phoneCountryCode, setPhoneCountryCode] = useState('+91');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignUpVerification, setIsSignUpVerification] = useState(false);

  useEffect(() => {
    if (triggerSellerLoginCounter && triggerSellerLoginCounter > 0) {
      setAuthMode('signup');
      setSignupRole('seller');
      setIsLoginOpen(true);
    }
  }, [triggerSellerLoginCounter]);

  useEffect(() => {
    if (isSupabaseConfigured && supabase !== null) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setAuthMode('reset-password');
          setIsLoginOpen(true);
        }
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

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

  const initRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            // reCAPTCHA solved
          }
        });
      } catch (error: any) {
        console.error('reCAPTCHA init error:', error);
      }
    }
  };

  const sendSmsOtp = async (targetPhone: string, isSignUp: boolean = false) => {
    setLoginError('');
    setIsSubmitting(true);
    setIsSignUpVerification(isSignUp);
    
    let formattedPhone = targetPhone.trim();
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }
      formattedPhone = `${phoneCountryCode}${formattedPhone}`;
    }

    try {
      initRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(firebaseAuth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      setPhone(formattedPhone);
      setAuthMode('phone-otp');
    } catch (err: any) {
      console.error("SMS OTP error:", err);
      setLoginError(err?.message || "Failed to send verification SMS. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifySmsOtp = async (code: string) => {
    if (!confirmationResult) {
      setLoginError("No verification session found. Please request a code first.");
      return;
    }
    setLoginError('');
    setIsSubmitting(true);
    try {
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      const verifiedPhone = user.phoneNumber || phone;

      if (isSignUpVerification) {
        // Continue standard Supabase / Mock SignUp
        if (isSupabaseConfigured && supabase !== null) {
          const { error } = await supabase.auth.signUp({
            email: username,
            password: password,
            options: {
              data: {
                role: signupRole,
                phone: verifiedPhone,
                name: fullName,
                full_name: fullName
              }
            }
          });
          if (error) {
            setLoginError(error.message);
            return;
          }
          mockUserDb[username.toLowerCase()] = {
            name: fullName,
            email: username,
            phone: verifiedPhone,
            role: signupRole
          };
          setSignupSuccess(true);
        } else {
          // Sandbox sign up
          mockUserDb[username.toLowerCase()] = {
            name: fullName,
            email: username,
            phone: verifiedPhone,
            role: signupRole
          };
          setSignupSuccess(true);
        }
      } else {
        // Phone Login path
        if (isSupabaseConfigured && supabase !== null) {
          const { data: profile, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('phone', verifiedPhone)
            .maybeSingle();

          if (profileErr) {
            setLoginError(profileErr.message);
            return;
          }

          if (profile) {
            // Existing user - log in
            setLoginSuccess(true);
            setTimeout(() => {
              const email = profile.email;
              setUserEmail(email);
              if (email?.toLowerCase() === 'gopalnaidu085@gmail.com') {
                setIsAdmin(true);
                setUserRole('seller');
              } else {
                setIsAdmin(false);
                setUserRole(profile.role);
              }
              setIsLoginOpen(false);
              setLoginSuccess(false);
              setUsername('');
              setPassword('');
              setPhone('');
              setFullName('');
              setOtp('');
              setConfirmationResult(null);
            }, 1000);
          } else {
            // New phone registration - complete profile fields
            setAuthMode('complete-phone-signup');
          }
        } else {
          // Local sandbox phone login
          const mockUser = Object.values(mockUserDb).find(u => u.phone === verifiedPhone);
          if (mockUser) {
            setLoginSuccess(true);
            setTimeout(() => {
              setUserEmail(mockUser.email);
              setIsAdmin(mockUser.email?.toLowerCase() === 'gopalnaidu085@gmail.com');
              setUserRole(mockUser.role);
              setIsLoginOpen(false);
              setLoginSuccess(false);
              setUsername('');
              setPassword('');
              setPhone('');
              setFullName('');
              setOtp('');
              setConfirmationResult(null);
            }, 1000);
          } else {
            setAuthMode('complete-phone-signup');
          }
        }
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setLoginError(err?.message || "Invalid OTP code. Please enter the correct 6-digit code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompletePhoneSignup = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const uniqueEmail = username.trim() || `${phone.replace('+', '')}@krishnaproperties.com`;
      const uid = firebaseAuth.currentUser?.uid || String(Date.now());
      
      if (isSupabaseConfigured && supabase !== null) {
        // Upsert direct profile
        const { error } = await supabase.from('profiles').upsert({
          id: uid,
          email: uniqueEmail,
          role: signupRole,
          phone: phone,
          name: fullName
        });
        if (error) {
          setLoginError(error.message);
          return;
        }
      }
      
      // Save in mock DB as fallback
      mockUserDb[uniqueEmail.toLowerCase()] = {
        name: fullName,
        email: uniqueEmail,
        phone: phone,
        role: signupRole
      };

      setLoginSuccess(true);
      setTimeout(() => {
        setUserEmail(uniqueEmail);
        setIsAdmin(uniqueEmail.toLowerCase() === 'gopalnaidu085@gmail.com');
        setUserRole(signupRole);
        setIsLoginOpen(false);
        setLoginSuccess(false);
        setUsername('');
        setPassword('');
        setPhone('');
        setFullName('');
        setOtp('');
        setConfirmationResult(null);
      }, 1000);
    } catch (err: any) {
      setLoginError(err?.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (authMode === 'phone-login') {
      await sendSmsOtp(phone, false);
      return;
    }
    if (authMode === 'phone-otp') {
      await verifySmsOtp(otp);
      return;
    }
    
    // Check credentials locally first as bypass for sandboxes
    const isAdminCreds = username.toLowerCase() === 'gopalnaidu085@gmail.com' && password === 'Naidu@gopal#2207';

    let resolvedEmail = username;

    if (isSupabaseConfigured && supabase !== null) {
      setIsSubmitting(true);
      try {
        if (authMode === 'forgot-password') {
          const { error } = await supabase.auth.resetPasswordForEmail(username, {
            redirectTo: `${window.location.origin}/`,
          });
          if (error) {
            setLoginError(error.message);
            return;
          }
          setForgotSuccess(true);
          return;
        }

        if (authMode === 'reset-password') {
          const { error } = await supabase.auth.updateUser({
            password: password,
          });
          if (error) {
            setLoginError(error.message);
            return;
          }
          setResetSuccess(true);
          return;
        }

        if (authMode === 'login') {
          // If login identifier doesn't have '@', we assume it's a phone number and query profiles
          if (!username.includes('@')) {
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('email')
              .eq('phone', username)
              .maybeSingle();

            if (profileErr || !profile) {
              // Try mock DB lookup first just in case
              const mockUser = Object.values(mockUserDb).find(u => u.phone === username);
              if (mockUser) {
                resolvedEmail = mockUser.email;
              } else if (isAdminCreds) {
                resolvedEmail = 'Gopalnaidu085@gmail.com';
              } else {
                setLoginError("No account registered with this phone number.");
                setIsSubmitting(false);
                return;
              }
            } else {
              resolvedEmail = profile.email;
            }
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: resolvedEmail,
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
                setPhone('');
              }, 1000);
              return;
            }
            setLoginError(error.message);
            return;
          }
          const email = data.user?.email || resolvedEmail;
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
            setPhone('');
            setFullName('');
          }, 1000);
        } else {
          // Sign Up mode
          if (!fullName.trim()) {
            setLoginError("Name is required to register an account.");
            return;
          }
          if (!phone.trim()) {
            setLoginError("Phone number is required to register an account.");
            return;
          }
          await sendSmsOtp(phone, true);
        }
      } catch (err: any) {
        setLoginError(err?.message || String(err));
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Local sandbox logic
      if (authMode === 'login') {
        let userRoleObj: 'buyer' | 'seller' = 'buyer';
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
            setPhone('');
          }, 1000);
          return;
        }

        // Look up by email or phone in mock database
        let foundUser: MockUser | undefined;
        if (username.includes('@')) {
          foundUser = mockUserDb[username.toLowerCase()];
        } else {
          foundUser = Object.values(mockUserDb).find(u => u.phone === username);
        }

        if (foundUser) {
          resolvedEmail = foundUser.email;
          userRoleObj = foundUser.role;
        } else {
          // fallback auto-generation if not found
          resolvedEmail = username;
          userRoleObj = username.toLowerCase().includes('seller') ? 'seller' : 'buyer';
        }

        setLoginSuccess(true);
        setTimeout(() => {
          setIsAdmin(false);
          setUserEmail(resolvedEmail);
          setUserRole(userRoleObj);
          setIsLoginOpen(false);
          setLoginSuccess(false);
          setUsername('');
          setPassword('');
          setPhone('');
          setFullName('');
        }, 1000);
      } else if (authMode === 'signup') {
        // Sign Up in local sandbox
        if (!fullName.trim()) {
          setLoginError("Name is required to register an account.");
          return;
        }
        if (!phone.trim()) {
          setLoginError("Phone number is required to register an account.");
          return;
        }
        await sendSmsOtp(phone, true);
      } else if (authMode === 'forgot-password') {
        setForgotSuccess(true);
      } else if (authMode === 'reset-password') {
        setResetSuccess(true);
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
    try {
      await firebaseAuth.signOut();
    } catch (e) {
      console.error(e);
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
                  {authMode === 'login' 
                    ? 'Login' 
                    : authMode === 'signup' 
                    ? 'Create Account' 
                    : authMode === 'forgot-password' 
                    ? 'Forgot Password' 
                    : authMode === 'reset-password'
                    ? 'Reset Password'
                    : authMode === 'phone-login'
                    ? 'Phone Login'
                    : authMode === 'phone-otp'
                    ? 'Verify Phone'
                    : 'Complete Registration'}
                </h3>
                <p className="text-xs text-brand-on-surface-variant font-light mt-0.5">
                  {authMode === 'login' 
                    ? 'Log in to browse properties and manage listings.' 
                    : authMode === 'signup'
                    ? 'Sign up to register a new user account.'
                    : authMode === 'forgot-password'
                    ? 'Enter your email address to receive a secure password reset link.'
                    : authMode === 'reset-password'
                    ? 'Choose a strong new password for your account.'
                    : authMode === 'phone-login'
                    ? 'Enter your mobile number to receive a one-time SMS verification code.'
                    : authMode === 'phone-otp'
                    ? `Please enter the 6-digit OTP code sent to ${phone}.`
                    : 'We just need a few more details to set up your profile.'}
                </p>
              </div>
            </div>

            {/* Login / Signup mode tabs */}
            {(authMode === 'login' || authMode === 'signup') && (
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
            )}

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
            ) : forgotSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-brand-primary/15 rounded-full flex items-center justify-center mx-auto text-brand-primary animate-bounce">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-brand-on-surface">Reset Link Sent</h4>
                  <p className="text-xs text-brand-on-surface-variant font-light mt-2 px-2 leading-relaxed">
                    A password reset link has been dispatched to <span className="font-bold text-brand-primary">{username}</span>.
                    Please check your inbox and click the recovery link to set your new password.
                  </p>
                  
                  {/* Developers sandbox simulation bypass option */}
                  {!isSupabaseConfigured && (
                    <button
                      type="button"
                      onClick={() => {
                        setForgotSuccess(false);
                        setAuthMode('reset-password');
                      }}
                      className="mt-4 text-[10px] uppercase font-bold tracking-widest text-brand-secondary hover:underline cursor-pointer block mx-auto"
                    >
                      [Simulate Redirect Link Click]
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setForgotSuccess(false);
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
            ) : resetSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-brand-primary/15 rounded-full flex items-center justify-center mx-auto text-brand-primary animate-bounce">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>
                <div>
                  <h4 className="font-display font-extrabold text-base text-brand-on-surface">Password Updated</h4>
                  <p className="text-xs text-brand-on-surface-variant font-light mt-2 px-2 leading-relaxed">
                    Your password has been changed successfully. You can now use your new password to sign in.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setResetSuccess(false);
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
              <form onSubmit={authMode === 'complete-phone-signup' ? handleCompletePhoneSignup : handleLoginSubmit} className="space-y-4">
                <div id="recaptcha-container"></div>
                {loginError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-semibold text-center">
                    {loginError}
                  </div>
                )}

                {(authMode === 'signup' || authMode === 'complete-phone-signup') && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Gopal Naidu"
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                    />
                  </div>
                )}

                {(authMode === 'login' || authMode === 'signup' || authMode === 'forgot-password' || authMode === 'complete-phone-signup') && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">
                      {authMode === 'login' ? 'Email or Phone Number' : 'Email Address'}
                    </label>
                    <input
                      type={authMode === 'login' ? 'text' : 'email'}
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={authMode === 'login' ? 'e.g. name@example.com or 9638177321' : 'name@example.com'}
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                    />
                  </div>
                )}

                {(authMode === 'phone-login' || authMode === 'signup') && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="px-2 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (AE)</option>
                      </select>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9638177321"
                        className="flex-1 px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                )}

                {authMode === 'phone-otp' && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">
                      OTP Verification Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 123456"
                      className="w-full px-3.5 py-2.5 text-center text-lg font-mono tracking-widest bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                    />
                  </div>
                )}

                {(authMode === 'login' || authMode === 'signup' || authMode === 'reset-password') && (
                  <div>
                    <label className="block text-[10px] font-bold text-brand-on-surface-variant uppercase tracking-widest mb-1">
                      {authMode === 'reset-password' ? 'New Password' : 'Password'}
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-brand-on-surface focus:outline-hidden focus:ring-1 focus:ring-brand-secondary focus:bg-white transition-all"
                    />
                  </div>
                )}

                {authMode === 'login' && (
                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('phone-login');
                        setLoginError('');
                      }}
                      className="text-[10px] font-bold text-brand-secondary hover:underline uppercase tracking-widest cursor-pointer text-left"
                    >
                      Login with Phone OTP
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot-password');
                        setLoginError('');
                      }}
                      className="text-[10px] font-bold text-gray-400 hover:text-brand-secondary uppercase tracking-widest cursor-pointer hover:underline text-right"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {authMode === 'phone-login' && (
                  <div className="flex justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('login');
                        setLoginError('');
                      }}
                      className="text-[10px] font-bold text-brand-secondary hover:underline uppercase tracking-widest cursor-pointer"
                    >
                      Login with Password
                    </button>
                  </div>
                )}

                {(authMode === 'signup' || authMode === 'complete-phone-signup') && (
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
                      if (authMode === 'forgot-password' || authMode === 'reset-password' || authMode === 'phone-login' || authMode === 'phone-otp' || authMode === 'complete-phone-signup') {
                        setAuthMode('login');
                        setLoginError('');
                        setPhone('');
                        setOtp('');
                      } else {
                        setIsLoginOpen(false);
                        setLoginError('');
                        setUsername('');
                        setPassword('');
                        setFullName('');
                        setPhone('');
                        setOtp('');
                      }
                    }}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-gray-500 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer text-center"
                  >
                    {authMode === 'forgot-password' || authMode === 'reset-password' || authMode === 'phone-login' || authMode === 'phone-otp' || authMode === 'complete-phone-signup' ? 'Back' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-brand-primary hover:bg-brand-primary/95 rounded-lg shadow-sm transition-colors cursor-pointer text-center disabled:opacity-50"
                  >
                    {isSubmitting 
                      ? 'Wait...' 
                      : authMode === 'login' 
                      ? 'Log In' 
                      : authMode === 'signup' 
                      ? 'Sign Up' 
                      : authMode === 'forgot-password' 
                      ? 'Send Link' 
                      : authMode === 'reset-password'
                      ? 'Save Password'
                      : authMode === 'phone-login'
                      ? 'Send OTP'
                      : authMode === 'phone-otp'
                      ? 'Verify OTP'
                      : 'Register'}
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
