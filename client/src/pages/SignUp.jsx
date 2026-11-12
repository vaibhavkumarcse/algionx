import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await register(name, email, password);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantGoogleDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const inputEmail = document.querySelector('input[type="email"]')?.value || '';
      const inputName = document.querySelector('input[name="name"]')?.value || '';
      if (!inputEmail) {
        setError('Please fill in your email to continue with Google.');
        setLoading(false);
        return;
      }
      const demoGoogleProfile = {
        name: inputName || inputEmail.split('@')[0],
        email: inputEmail,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        id: 'google_user_' + Date.now(),
      };
      await loginWithGoogle(null, demoGoogleProfile);
      navigate(redirectPath);
    } catch (err) {
      setError(err.message || 'Google signup error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 bg-[#FCFCFA]">
      {/* Left: Editorial Visual */}
      <div className="hidden lg:relative lg:flex flex-col justify-between p-12 bg-zinc-950 text-white overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=85"
          alt="Editorial Fashion Sign Up"
          className="absolute inset-0 w-full h-full object-cover filter brightness-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40"></div>

        <div className="relative z-10">
          <Link to="/" className="font-serif tracking-widest text-2xl font-bold uppercase text-white">
            ALGIONX
          </Link>
        </div>

        <div className="relative z-10 space-y-4 max-w-md">
          <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-300">
            Artisanal Registry
          </span>
          <h2 className="text-4xl font-serif font-light leading-snug">
            Craft your signature luxury wardrobe profile.
          </h2>
          <p className="text-xs text-zinc-300 leading-relaxed font-light">
            Receive exclusive seasonal capsule lookbooks, priority worldwide express dispatch, and Razorpay-protected checkout.
          </p>
        </div>

        <div className="relative z-10 text-[11px] text-zinc-400 font-mono">
          PARIS · MILAN · TOKYO · NEW YORK
        </div>
      </div>

      {/* Right: Registration Form */}
      <div className="flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-16 max-w-lg mx-auto w-full">
        <div className="space-y-2 mb-8">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Registration
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif text-zinc-950 font-medium">
            Create Your Account
          </h1>
          <p className="text-xs text-zinc-500">
            Already have an atelier account?{' '}
            <Link to={`/signin?redirect=${redirectPath}`} className="text-black font-semibold underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {error}
          </div>
        )}

        {/* Google Signup Button */}
        <div className="mb-6">
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
            <span>Sign up with Google</span>
          </button>
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-zinc-200 w-full"></div>
          <span className="bg-[#FCFCFA] px-3 text-[11px] text-zinc-400 uppercase tracking-widest font-mono">
            or with email
          </span>
          <div className="border-t border-zinc-200 w-full"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Full Legal Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Eleanor Vance"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 bg-white"
              />
            </div>
          </div>

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
                placeholder="name@algionx.luxury"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-zinc-300 focus:border-zinc-950 focus:outline-none text-xs text-zinc-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Password (at least 6 characters)
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
            <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

