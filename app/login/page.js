'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, User as UserIcon, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, login, register } = useAuth();

  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // If already authenticated, redirect to account
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/account');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (tab === 'login') {
      const res = await login(email, password);
      if (res.success) {
        router.push('/account');
      }
    } else {
      const res = await register(name, email, password);
      if (res.success) {
        router.push('/account');
      }
    }

    setLoading(false);
  };

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-2xl font-serif-luxury font-bold tracking-[0.2em] text-stone-900 uppercase">
              NÖRDIKA
            </span>
          </Link>
          <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
            Customer Sanctuary & Orders Portal
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xl">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-2 bg-stone-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setTab('login')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                tab === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab('register')}
              className={`py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all ${
                tab === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Freja Lind"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="demo@nordika.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pl-10 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {tab === 'login' && (
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-600">
                <p className="font-semibold text-stone-900 mb-0.5">Demo Account Credentials:</p>
                <p>Email: <code className="bg-white px-1.5 py-0.5 rounded border text-stone-800">demo@nordika.com</code></p>
                <p className="mt-0.5">Password: <code className="bg-white px-1.5 py-0.5 rounded border text-stone-800">password123</code></p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white py-3.5 px-6 rounded-xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                ) : (
                  <>
                    <span>{tab === 'login' ? 'Sign In to Account' : 'Register Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 flex items-center justify-center gap-2 text-[11px] text-stone-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Session & Password Hashing</span>
          </div>
        </div>
      </div>
    </div>
  );
}
