import React, { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Mail, Lock, User, Eye, EyeOff, CheckCircle2, 
  AlertCircle, Sparkles, ArrowRight, ShieldCheck 
} from 'lucide-react';
import axios from 'axios';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  customTitle?: string;
  customSubtitle?: string;
}

const GOOGLE_CLIENT_ID = '424918974382-qbnphracdndii7vf9fhc1vf0n5e7qdgp.apps.googleusercontent.com';

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = 'login',
  customTitle,
  customSubtitle,
}: AuthModalProps) {
  const { site } = usePage().props as any;
  const clientId = site?.google_client_id || GOOGLE_CLIENT_ID;

  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [remember, setRemember] = useState(true);

  // Google GSI State
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(defaultMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [defaultMode, isOpen]);

  // Load and initialize Google Identity Services
  useEffect(() => {
    if (!isOpen) return;

    const initializeGsi = () => {
      if ((window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCallback,
          });
          setGoogleReady(true);
        } catch (err) {
          console.error('Google GSI init failed:', err);
        }
      }
    };

    if ((window as any).google?.accounts?.id) {
      initializeGsi();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGsi;
      document.body.appendChild(script);
    }
  }, [isOpen, clientId]);

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) return;
    setGoogleLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.post('/auth/google', {
        id_token: response.credential,
      });

      if (res.data.success) {
        setSuccessMessage(res.data.message || 'Signed in successfully!');
        if (typeof (window as any).initPusherBeams === 'function') {
          const isStaff = res.data.user?.roles?.some((r: string) => ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'].includes(r));
          (window as any).initPusherBeams(isStaff ? 'admin' : 'member', res.data.user?.id);
        }
        setTimeout(() => {
          onClose();
          router.reload();
        }, 600);
      } else {
        setErrorMessage(res.data.message || 'Google sign-in failed.');
      }
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Google sign-in encountered an error. Please try again.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    if (!googleReady || !(window as any).google) {
      setErrorMessage('Google Sign-In is still loading. Please wait a second and retry.');
      return;
    }
    setErrorMessage(null);
    (window as any).google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const container = document.getElementById('google-btn-modal-container');
        if (container) {
          container.style.display = 'block';
          (window as any).google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: mode === 'register' ? 'signup_with' : 'signin_with',
          });
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await axios.post('/auth/login', {
          email,
          password,
          remember,
        });

        if (res.data.success) {
          setSuccessMessage(res.data.message || 'Welcome back!');
          if (typeof (window as any).initPusherBeams === 'function') {
            const isStaff = res.data.user?.roles?.some((r: string) => ['Super Admin', 'Administrator', 'Editor', 'Writer', 'Author'].includes(r));
            (window as any).initPusherBeams(isStaff ? 'admin' : 'member', res.data.user?.id);
          }
          setTimeout(() => {
            onClose();
            router.reload();
          }, 600);
        }
      } else {
        if (password !== passwordConfirmation) {
          setErrorMessage('Password confirmation does not match.');
          setLoading(false);
          return;
        }

        const res = await axios.post('/auth/register', {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        });

        if (res.data.success) {
          setSuccessMessage(res.data.message || 'Account created successfully!');
          if (typeof (window as any).initPusherBeams === 'function') {
            (window as any).initPusherBeams('member', res.data.user?.id);
          }
          setTimeout(() => {
            onClose();
            router.reload();
          }, 600);
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : 'An unexpected error occurred. Please try again.');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.35, bounce: 0.1 }}
            className="relative w-full max-w-[420px] sm:max-w-[440px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-4"
          >
            {/* Top Bar Decorator */}
            <div className="h-1 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            <div className="p-5 sm:p-7">
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div className="text-center mb-4">
                <div className="flex items-center justify-center mb-2">
                  <img
                    src={site?.favicon || '/favicon.png'}
                    alt={site?.name || 'Rafvex'}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/favicon.png';
                    }}
                    className="w-11 h-11 sm:w-12 sm:h-12 object-contain drop-shadow-sm hover:scale-105 transition-transform"
                  />
                </div>
                <h3
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight"
                >
                  {customTitle || (mode === 'login' ? 'Welcome Back' : 'Create Free Account')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                  {customSubtitle ||
                    (mode === 'login'
                      ? 'Sign in to sync your bookmarks, reading history and notifications.'
                      : 'Join our community of readers, save articles, and get instant updates.')}
                </p>
              </div>

              {/* Mode Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Google Sign-In Button */}
              <button
                type="button"
                onClick={triggerGoogleSignIn}
                disabled={googleLoading || loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-all shadow-2xs hover:border-slate-300 disabled:opacity-60 cursor-pointer mb-3.5"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                )}
                <span>
                  {googleLoading
                    ? 'Connecting to Google...'
                    : mode === 'register'
                    ? 'Continue with Google'
                    : 'Sign in with Google'}
                </span>
              </button>

              {/* Hidden container for Google GSI fallback render */}
              <div id="google-btn-modal-container" className="mb-3 hidden" />

              {/* Divider */}
              <div className="relative flex items-center justify-center mb-3.5">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                  Or with email
                </span>
              </div>

              {/* Feedback Alerts */}
              {errorMessage && (
                <div className="mb-3.5 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-3.5 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                  <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Johnson"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'}
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="Repeat your password"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span>Keep me signed in</span>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer mt-3.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In to Rafvex' : 'Create Account'}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="mt-4 text-center text-xs text-slate-500">
                {mode === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('register');
                        setErrorMessage(null);
                      }}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Register for free
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setErrorMessage(null);
                      }}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
