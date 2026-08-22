'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    roleName: 'Super Admin',
    email: 'admin@nordika.com',
    password: 'password123',
    badge: 'Full Access',
    desc: 'Unrestricted system control, settings, user management, and financials.',
  },
  {
    roleName: 'Product Manager',
    email: 'pm@nordika.com',
    password: 'password123',
    badge: 'Catalog & Content',
    desc: 'Manage inventory, specs, categories, CSV bulk imports, and homepage.',
  },
  {
    roleName: 'Sales Director',
    email: 'sales@nordika.com',
    password: 'password123',
    badge: 'Orders & Agents',
    desc: 'Fulfill orders, approve trade agents, calculate commissions and payouts.',
  },
  {
    roleName: 'Customer Support',
    email: 'support@nordika.com',
    password: 'password123',
    badge: 'Support & CRM',
    desc: 'Track customer orders, respond to quotes, and view CRM customer files.',
  },
];

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="bg-[#231E1A] border border-[#3A3127] py-8 px-6 sm:px-10 rounded-2xl shadow-2xl space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-2.5 text-xs text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#D5CCC0] mb-1.5">
            Staff Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8475]" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nordika.com"
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1613] border border-[#3A3127] rounded-xl text-xs text-white placeholder:text-[#6E6455] focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#D5CCC0] mb-1.5">
            Access Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8475]" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-4 py-2.5 bg-[#1A1613] border border-[#3A3127] rounded-xl text-xs text-white placeholder:text-[#6E6455] focus:outline-none focus:border-[#A8875E] focus:ring-1 focus:ring-[#A8875E] transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#A8875E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Verifying credentials...</span>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Quick Demo Role Switcher */}
      <div className="pt-5 border-t border-[#332A21] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8E8475]">
            Quick Demo Role Switcher
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#A8875E]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.roleName}
              type="button"
              onClick={() => handleQuickDemo(acc)}
              className="p-2.5 rounded-xl bg-[#1A1613] hover:bg-[#2B231D] border border-[#3A3127] hover:border-[#A8875E]/50 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-white group-hover:text-[#A8875E] transition-colors">
                  {acc.roleName}
                </span>
              </div>
              <p className="text-[10px] text-[#A3998D] truncate">{acc.email}</p>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-center text-[#786D5F]">
          Default password for all seeded roles: <code className="text-[#A8875E]">password123</code>
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#1A1613] text-[#F3ECE1] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#A8875E]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#A8875E] to-[#785E3B] mx-auto flex items-center justify-center shadow-xl shadow-[#A8875E]/20 mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
          NORDIKA STUDIO
        </h1>
        <p className="mt-1 text-xs uppercase tracking-widest text-[#A8875E] font-medium">
          Operations Control Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-[#A8875E] bg-[#231E1A] rounded-2xl border border-[#3A3127]">
              Loading login console...
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-[#A8875E] hover:text-[#C5A376] hover:underline underline-offset-4 transition-colors"
          >
            ← Return to Nordika Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
