'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Shield, Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import BrandLogo from '@/components/ui/BrandLogo';

const DEMO_ACCOUNTS = [
  {
    roleName: 'Super Admin',
    email: 'admin@kbfurniture.com',
    password: 'password123',
    badge: 'Full Access',
    desc: 'Unrestricted system control, settings, user management, and financials.',
  },
  {
    roleName: 'Product Manager',
    email: 'pm@kbfurniture.com',
    password: 'password123',
    badge: 'Catalog & Content',
    desc: 'Manage inventory, specs, categories, CSV bulk imports, and homepage.',
  },
  {
    roleName: 'Sales Director',
    email: 'sales@kbfurniture.com',
    password: 'password123',
    badge: 'Orders & Agents',
    desc: 'Fulfill orders, approve trade agents, calculate commissions and payouts.',
  },
  {
    roleName: 'Customer Support',
    email: 'support@kbfurniture.com',
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
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kbfurniture.com"
              className="w-full bg-[#1A1613] border border-[#3A3127] rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder:text-[#6E6356] focus:outline-none focus:border-[#A8875E] transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#D5CCC0] mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#A8875E]">
              <Lock className="w-4 h-4" />
            </div>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#1A1613] border border-[#3A3127] rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder:text-[#6E6356] focus:outline-none focus:border-[#A8875E] transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#A8875E] hover:bg-[#96764E] disabled:opacity-50 text-[#1A1613] font-bold py-3.5 px-4 rounded-xl text-xs uppercase tracking-[0.18em] transition-all shadow-lg shadow-[#A8875E]/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Access Admin Portal</span>
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

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 flex flex-col items-center">
        <BrandLogo variant="white" size="xl" className="justify-center mx-auto mb-2" href="/admin" />
        <p className="mt-1 text-xs uppercase tracking-widest text-[#A8875E] font-bold">
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
            ← Return to KB Furniture Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
