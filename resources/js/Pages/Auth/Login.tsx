import React, { useState, useEffect } from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldCheck, Chrome } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);

  const { props } = usePage<any>();
  const site = props.site || {};
  const siteName = site.name || 'Rafvex';
  const siteLogo = site.logo 
    ? (site.logo.startsWith('http') ? site.logo : `https://rafvex.com${site.logo}`)
    : 'https://rafvex.com/storage/settings/logo/vI8j4DzG40GuTkdVi7IEcmphAAmkBzOm0M0IZBeM.png';
  const loginBg = site.login_bg_image || '/images/cms_login_bg.jpg';

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/ourcms/login');
  };

  useEffect(() => {
    const checkGoogle = () => {
      try {
        window.google?.accounts.id.initialize({
          client_id: '424918974382-qbnphracdndii7vf9fhc1vf0n5e7qdgp.apps.googleusercontent.com',
          callback: handleGoogleCallback,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        setGoogleReady(true);
      } catch (err) {
        console.error('Google initialization error:', err);
      }
    };

    if (window.google?.accounts?.id) {
      checkGoogle();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = checkGoogle;
    document.head.appendChild(script);
  }, []);

  const handleGoogleCallback = async (response: any) => {
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

      const res = await fetch('/ourcms/auth/google/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ id_token: response.credential }),
      });

      const json = await res.json();

      if (json.success) {
        window.location.href = json.redirect ?? '/ourcms/dashboard';
      } else {
        setGoogleError(json.message ?? 'Google sign-in failed.');
        setGoogleLoading(false);
      }
    } catch (err) {
      setGoogleError('Network error. Please try again.');
      setGoogleLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    if (!googleReady || !window.google) {
      setGoogleError('Google Sign-In is not ready yet. Please wait a moment and try again.');
      return;
    }
    setGoogleError(null);
    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const container = document.getElementById('google-btn-container');
        if (container) {
          container.innerHTML = '';
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: 400,
          });
          const btn = container.querySelector('div[role="button"]') as HTMLElement;
          btn?.click();
        }
      }
    });
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#ffffff' }}>
      <Head title="Log in - Rafvex Editorial" />
      
      {/* ── LEFT PANE: BRANDING & 1280x1280 BACKGROUND ── */}
      <div
        className="hidden lg:flex w-1/2 flex-col justify-between"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.82) 0%, rgba(127, 29, 29, 0.68) 55%, rgba(153, 27, 27, 0.75) 100%), url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          padding: '64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 320, height: 320,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -100, left: -60, width: 400, height: 400,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,0,0,0.5) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <img
            src={siteLogo}
            alt={siteName}
            className="h-14 w-auto object-contain max-w-[260px] drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)] mb-6"
          />
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', padding: '5px 14px', borderRadius: 20, marginBottom: 14 }}>
            <ShieldCheck size={14} color="#fca5a5" />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffffff' }}>Editorial CMS</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
            Publishing Workspace
          </h1>
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(32px, 3.8vw, 46px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.16, marginBottom: 20, color: '#ffffff', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
            Shaping the narrative<br />of modern knowledge.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.9)', maxWidth: 440, lineHeight: 1.65, textShadow: '0 1px 6px rgba(0,0,0,0.3)' }}>
            Access the verified publishing desk to craft stories, curate trending intelligence, and broadcast discoveries seamlessly.
          </p>
        </div>
        
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
          <span>&copy; {new Date().getFullYear()} Rafvex.</span>
          <span>Enterprise Editorial Security</span>
        </div>
      </div>

      {/* ── RIGHT PANE: LOGIN FORM ── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24" style={{ background: '#ffffff' }}>
        
        {/* Mobile Header with Official Logo */}
        <div className="lg:hidden mb-10 flex flex-col items-center">
          <img
            src={siteLogo}
            alt={siteName}
            className="h-12 w-auto object-contain max-w-[220px] mb-3"
          />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#dc2626' }}>
            Publishing Workspace
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md"
        >
          <div style={{ marginBottom: 32 }}>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 mb-2.5">
              <ShieldCheck size={13} /> CMS Admin Portal
            </span>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: '#141414', letterSpacing: '-0.03em', marginBottom: 6 }}>
              Administrator Sign In
            </h2>
            <p style={{ fontSize: 14, color: '#6b7280' }}>
              Reserved strictly for CMS administrators, editors, and editorial staff.
            </p>

            {props.auth?.user && !props.auth.user.is_staff && (
              <div style={{ marginTop: 14, padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, fontSize: 12.5, color: '#92400e', lineHeight: 1.45 }}>
                You are currently signed in to the public website as a reader (<strong>{props.auth.user.name}</strong>). Please enter your CMS Administrator credentials below to open the publishing workspace.
              </div>
            )}
          </div>

          {/* ── Google Sign-In Button ── */}
          <div style={{ marginBottom: 28 }}>
            <button
              id="google-signin-btn"
              type="button"
              onClick={triggerGoogleSignIn}
              disabled={googleLoading}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                padding: '13px 20px', fontSize: 14, fontWeight: 600, color: '#374151',
                background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
                cursor: googleLoading ? 'wait' : 'pointer',
                transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                opacity: googleLoading ? 0.7 : 1,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#dc2626';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(220,38,38,0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)';
              }}
            >
              {googleLoading ? (
                <span style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid #e5e7eb', borderTopColor: '#dc2626', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {googleLoading ? 'Signing in with Google...' : 'Continue with Google'}
            </button>

            {/* Hidden container for Google button fallback */}
            <div id="google-btn-container" style={{ display: 'none' }} />

            {googleError && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: 8, fontSize: 13, color: '#dc2626', lineHeight: 1.5,
                }}
              >
                {googleError}
              </motion.div>
            )}
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
            <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, whiteSpace: 'nowrap' }}>or sign in with email</span>
            <div style={{ flex: 1, height: 1, background: '#f3f4f6' }} />
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={data.email}
                autoComplete="username"
                onChange={(e) => setData('email', e.target.value)}
                placeholder="admin@rafvex.com"
                style={{
                  width: '100%', padding: '14px 0', fontSize: 15, border: 'none', borderBottom: '1.5px solid #e5e7eb', 
                  background: 'transparent', outline: 'none', transition: 'border-color 0.2s', color: '#111827'
                }}
                onFocus={e => e.currentTarget.style.borderBottomColor = '#dc2626'}
                onBlur={e => e.currentTarget.style.borderBottomColor = '#e5e7eb'}
              />
              {errors.email && <span style={{ color: '#dc2626', fontSize: 13, marginTop: 6, display: 'block' }}>{errors.email}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div style={{ position: 'relative', width: '100%' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={data.password}
                  autoComplete="current-password"
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '14px 42px 14px 0', fontSize: 15, border: 'none', borderBottom: '1.5px solid #e5e7eb', 
                    background: 'transparent', outline: 'none', transition: 'border-color 0.2s', color: '#111827'
                  }}
                  onFocus={e => e.currentTarget.style.borderBottomColor = '#dc2626'}
                  onBlur={e => e.currentTarget.style.borderBottomColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)',
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
                    color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 6, transition: 'color 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span style={{ color: '#dc2626', fontSize: 13, marginTop: 6, display: 'block' }}>{errors.password}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="remember"
                  checked={data.remember}
                  onChange={(e) => setData('remember', e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: '#dc2626', width: 16, height: 16 }}
                />
                <span style={{ marginLeft: 10, fontSize: 14, color: '#4b5563' }}>Remember me</span>
              </label>

              <a href="#" style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', textDecoration: 'none' }}>
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={processing}
              style={{
                marginTop: 20, width: '100%', padding: '15px', background: '#dc2626', color: '#ffffff', 
                fontSize: 14, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', 
                border: 'none', borderRadius: 10, cursor: processing ? 'wait' : 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.28)'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#b91c1c';
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(220, 38, 38, 0.38)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#dc2626';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(220, 38, 38, 0.28)';
              }}
            >
              {processing ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
