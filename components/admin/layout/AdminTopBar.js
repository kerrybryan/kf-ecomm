'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Menu,
  Bell,
  Search,
  User,
  Shield,
  LogOut,
  ExternalLink,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import StatusBadge from '../ui/StatusBadge';

export default function AdminTopBar({ user, onLogout, onToggleMobileMenu }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-zinc-200/80 sticky top-0 z-20 px-4 sm:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <AdminBreadcrumbs />
      </div>

      {/* Right: Quick actions, Role badge, Notifications & Profile */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        {user?.role && (
          <div className="hidden sm:block">
            <StatusBadge status={user.role} size="sm" />
          </div>
        )}

        {/* View Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
          title="Open Live Store in New Tab"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3 text-[#A8875E]" />
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[120px]">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[10px] text-zinc-400 font-medium capitalize truncate max-w-[120px]">
                {user?.role?.replace(/_/g, ' ') || 'Super Admin'}
              </p>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-zinc-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-zinc-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-zinc-100">
                <p className="text-xs font-bold text-zinc-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#A8875E]" />
                  <span>Admin Settings</span>
                </Link>

                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#A8875E]" />
                  <span>View Storefront</span>
                </Link>
              </div>

              <div className="border-t border-zinc-100 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout && onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
