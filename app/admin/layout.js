'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import AdminTopBar from '@/components/admin/layout/AdminTopBar';

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
      if (!isLoginPage) {
        router.push('/admin/login');
      }
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
      console.error('Logout error:', err);
      window.location.href = '/admin/login';
    }
  };

  // If on login page, render children directly without admin layout chrome
  if (isLoginPage) {
    return <div className="min-h-screen bg-[#1A1613] text-white flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col lg:flex-row antialiased font-sans text-zinc-900 selection:bg-[#A8875E]/20">
      {/* Dark persistent sidebar */}
      <AdminSidebar
        user={adminUser}
        onLogout={handleLogout}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Admin Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopBar
          user={adminUser}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
