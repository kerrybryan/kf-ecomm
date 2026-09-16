'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminTopBar from '@/components/admin/layout/AdminTopBar';
import QuickCalcAssistant from '@/components/admin/ai/QuickCalcAssistant';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  const fetchAdminSession = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setAdminUser(data.user);
      } else {
        setAdminUser(null);
        if (!isLoginPage) {
          router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin session:', err);
      setAdminUser(null);
      if (!isLoginPage) router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminSession();
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      setAdminUser(null);
      router.push('/admin/login');
    } catch (err) {
      window.location.href = '/admin/login';
    }
  };

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#111009] text-white flex flex-col">{children}</div>
    );
  }

  return (
    <div
      id="admin-shell"
      className="min-h-screen flex antialiased font-sans text-zinc-900"
      style={{ background: 'linear-gradient(135deg, #F8F7F4 0%, #F2EFE9 100%)' }}
    >
      {/* Sidebar */}
      <AdminSidebar
        user={adminUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminTopBar
          user={adminUser}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Floating Gemini AI Quick Calculation Assistant */}
      <QuickCalcAssistant />
    </div>
  );
}
