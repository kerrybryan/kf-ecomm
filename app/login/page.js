'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import BrandLogo from '@/components/ui/BrandLogo';

function GoogleIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
  );
}

function FacebookIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="#1877F2" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login, register } = useAuth();

  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('/account');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'register') setTab('register');
      if (params.get('redirect')) setRedirectUrl(params.get('redirect'));

      const error = params.get('error');
      if (error === 'google_denied') setErrorMessage('Google login was cancelled.');
      else if (error === 'facebook_denied') setErrorMessage('Facebook login was cancelled.');
      else if (error) setErrorMessage('Social sign-in failed. Please try again or use email.');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl);
    }
  }, [isAuthenticated, router, redirectUrl]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (tab === 'login') {
      const res = await login(email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMessage(res.error || 'Login failed');
      }
    } else {
      const res = await register(name, email, password);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setErrorMessage(res.error || 'Registration failed');
      }
    }

    setLoading(false);
  };

  const handleSocialLogin = (provider) => {
    window.location.href = `/api/auth/social/${provider}?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-14 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <BrandLogo variant="terracotta" size="lg" className="justify-center mx-auto" />
          <p className="text-xs text-[#6B6459] mt-2 font-normal">
            Sign in to view your orders, saved furniture, and account details.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-[#E5DDD3] shadow-lg">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1.5 rounded-xl mb-6 border border-[#E5DDD3]">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMessage(''); }}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-[#201C18] shadow-xs border border-[#E5DDD3]'
                  : 'text-[#6B6459] hover:text-[#201C18]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMessage(''); }}
              className={`py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-[#201C18] shadow-xs border border-[#E5DDD3]'
                  : 'text-[#6B6459] hover:text-[#201C18]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full bg-white hover:bg-[#FAF8F5] text-[#201C18] border-2 border-[#E5DDD3] hover:border-[#B8551F] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full bg-white hover:bg-[#FAF8F5] text-[#201C18] border-2 border-[#E5DDD3] hover:border-[#B8551F] py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer active:scale-[0.99]"
            >
              <FacebookIcon className="w-4 h-4" />
              <span>Continue with Facebook</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-[#E5DDD3] w-full" />
            <span className="bg-white px-3 text-xs text-[#6B6459] font-medium uppercase tracking-wider shrink-0">
              or continue with email
            </span>
            <div className="border-t border-[#E5DDD3] w-full" />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Abebe Kebede"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 pl-10 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                  <UserIcon className="w-4 h-4 text-[#6B6459] absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="abebe@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 pl-10 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
                <Mail className="w-4 h-4 text-[#6B6459] absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-3 pl-10 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
                <Lock className="w-4 h-4 text-[#6B6459] absolute left-3.5 top-3.5" />
              </div>
            </div>

            {tab === 'login' && (
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] text-[11px] text-[#6B6459]">
                <p className="font-bold text-[#201C18] mb-0.5">Demo Account:</p>
                <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E5DDD3] text-[#201C18]">demo@kbfurniture.com</code></p>
                <p className="mt-0.5">Password: <code className="bg-white px-1.5 py-0.5 rounded border border-[#E5DDD3] text-[#201C18]">password123</code></p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99] cursor-pointer"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Sign In to Account' : 'Create My Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E5DDD3] flex items-center justify-center gap-2 text-[11px] text-[#6B6459]">
            <ShieldCheck className="w-4 h-4 text-[#4C7A3D]" />
            <span>Secure 256-Bit Encrypted Session</span>
          </div>
        </div>
      </div>
    </div>
  );
}
