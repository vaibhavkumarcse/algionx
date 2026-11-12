import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Lock, ShieldCheck, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function SignIn() {
  const [authMethod, setAuthMethod] = useState('otp'); // 'otp' | 'password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpPreview, setOtpPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithOTP, requestOTP, loginWithGoogle, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath);
    }
  }, [isAuthenticated, navigate, redirectPath]);

  // Initialize Google Identity Services with client ID from backend
  useEffect(() => {
    /* global google */
    const initGoogleAuth = async () => {
      let activeClientId = '180370796024-pv0a34blg2sc43i3ijl6dg69696a3oec.apps.googleusercontent.com';
      try {
        const sys = await api.getSystemStatus();
        if (sys?.googleAuth?.clientId && sys.googleAuth.clientId !== 'demo_mode_ready') {
          activeClientId = sys.googleAuth.clientId;
        }
      } catch (e) {
        // use fallback
      }

      if (typeof window !== 'undefined' && window.google) {
        try {
          window.google.accounts.id.initialize({
            client_id: activeClientId,
            callback: async (response) => {
              try {
                setLoading(true);
                await loginWithGoogle(response.credential);
                navigate(redirectPath);
              } catch (err) {
                setError(err.message || 'Google authentication failed');
              } finally {
                setLoading(false);
              }
            },
          });

          const googleBtnDiv = document.getElementById('googleSignInOfficialBtn');
          if (googleBtnDiv) {
            window.google.accounts.id.renderButton(googleBtnDiv, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              shape: 'pill',
            });
          }
        } catch (err) {
          console.warn('Google Identity Services note:', err);
        }
      }
    };

    initGoogleAuth();
  }, [loginWithGoogle, navigate, redirectPath]);

  // Handle Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');

    setError('');
    setLoading(true);
    try {
      const res = await requestOTP(email);
      setOtpSent(true);
      if (res?.otpPreview) {
        setOtpPreview(res.otpPreview);
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp) return setError('Please enter the 6-digit code');

    setError('');
    setLoading(true);
    try {
      await loginWithOTP(email, otp);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Verification code failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantGoogleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const demoGoogleProfile = {
        name: email ? email.split('@')[0] : 'Guest User',
        email: email || '',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        id: 'google_user_' + Date.now(),
      };
      if (!demoGoogleProfile.email) {
        setError('Please enter your Gmail address first, then click Continue with Google.');
        setLoading(false);
        return;
      }
      await loginWithGoogle(null, demoGoogleProfile);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Google sign-in error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-[#FCFCFA]">
      {/* Left: Editorial Fashion Visual */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1400&q=85"
          alt="Editorial Fashion Sign In"
          className="absolute inset-0 w-full h-full object-cover filter brightness-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40"></div>

        <div className="relative z-10">
          <Link to="/" className="font-serif tracking-widest text-2xl font-bold uppercase text-white">
            ALGIONX
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
            Private Member Access
          </span>
          <h2 className="text-4xl font-serif font-light leading-snug">
            Welcome to the collective of <span className="italic font-normal">creative</span> minds.
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed font-light">
            Enjoy personalized atelier curation, instant order tracking with Razorpay protection, and private invitation drops.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-zinc-400 font-mono">
          © {new Date().getFullYear()} ALGIONX Luxury Platform · PARIS · NEW YORK
        </div>
      </div>

      {/* Right: Sign In Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 max-w-lg mx-auto w-full">
        <div className="space-y-2 mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Sign In
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-zinc-950 font-medium">
            Access Your Wardrobe
          </h1>
          <p className="text-xs text-zinc-500">
            Don't have an account yet?{' '}
            <Link to={`/signup?redirect=${redirectPath}`} className="text-black font-semibold underline underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Google Authentication */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            onClick={handleInstantGoogleDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-50 border border-zinc-300 hover:border-zinc-400 text-zinc-800 py-3.5 px-4 rounded-full font-semibold text-xs transition-all shadow-xs hover:shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
          </button>

          {/* Official Google Button mount */}
          <div id="googleSignInOfficialBtn" className="w-full flex justify-center"></div>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-zinc-200 w-full"></div>
          <span className="bg-[#FCFCFA] px-3 text-[11px] text-zinc-400 uppercase tracking-widest font-mono">
            or sign in with email
          </span>
          <div className="border-t border-zinc-200 w-full"></div>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="flex bg-[#F6F5F2] p-1.5 rounded-2xl mb-6 border border-zinc-200">
          <button
            type="button"
            onClick={() => setAuthMethod('otp')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              authMethod === 'otp' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Login with OTP (Code)
          </button>
          <button
            type="button"
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
              authMethod === 'password' ? 'bg-zinc-950 text-white shadow-xs' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Password
          </button>
        </div>

        {/* Tab 1: OTP Login Flow */}
        {authMethod === 'otp' ? (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Your Gmail / Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-black text-white py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01]"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{loading ? 'Sending Code...' : 'Send 6-Digit OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4 animate-slide-up">
                {otpPreview && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Verification Code for {email}:</span>
                    </div>
                    <strong className="text-sm font-mono tracking-widest bg-emerald-100 px-2.5 py-1 rounded-lg">
                      {otpPreview}
                    </strong>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-800">
                      Enter 6-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-zinc-400 hover:text-black underline"
                    >
                      Change Email
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    autoFocus
                    className="w-full px-4 py-3 text-center text-lg tracking-[0.3em] font-mono rounded-2xl border border-zinc-300 focus:border-zinc-950 focus:outline-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-950 hover:bg-black text-white py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01]"
                >
                  <span>{loading ? 'Verifying...' : 'Verify Code & Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Tab 2: Standard Password Form */
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Gmail address"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-zinc-950 hover:bg-black text-white py-3.5 rounded-full font-semibold text-xs tracking-wider uppercase transition-all shadow-xl hover:scale-[1.01]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
