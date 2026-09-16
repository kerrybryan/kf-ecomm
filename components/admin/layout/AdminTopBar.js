'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  Search,
  LogOut,
  ExternalLink,
  ChevronDown,
  Moon,
  Sun,
  Bell,
  Plus,
  Package,
  ShoppingBag,
} from 'lucide-react';
import AdminBreadcrumbs from './AdminBreadcrumbs';
import StatusBadge from '../ui/StatusBadge';

export default function AdminTopBar({ user, onLogout, onToggleMobileMenu }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dark mode toggle on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header
      id="admin-topbar"
      className="h-14 bg-white/95 backdrop-blur-md border-b border-zinc-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-xs"
    >
      {/* Left: Mobile Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          id="admin-mobile-menu-btn"
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <AdminBreadcrumbs />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">

        {/* Quick search */}
        <div ref={searchRef} className="relative">
          {searchOpen ? (
            <form onSubmit={handleSearch}>
              <input
                id="admin-search"
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-44 sm:w-60 bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#A8875E] focus:bg-white transition-all"
              />
            </form>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              id="admin-search-btn"
              className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          id="dark-mode-toggle"
          className="p-2 rounded-xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          aria-label="Toggle dark mode"
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* View Storefront */}
        <Link
          href="/"
          target="_blank"
          id="view-storefront-link"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 transition-all"
          title="Open Live Store"
        >
          <span>Storefront</span>
          <ExternalLink className="w-3 h-3 text-[#A8875E]" />
        </Link>

        {/* Role badge */}
        {user?.role && (
          <div className="hidden sm:block">
            <StatusBadge status={user.role} size="sm" />
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-zinc-200 mx-1 hidden sm:block" />

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            id="admin-user-dropdown-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#A8875E] to-[#6B5235] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-zinc-900 leading-tight truncate max-w-[100px]">
                {user?.name || 'Admin'}
              </p>
              <p className="text-[10px] text-zinc-400 font-medium capitalize truncate max-w-[100px]">
                {user?.role?.replace(/_/g, ' ') || 'Super Admin'}
              </p>
            </div>
            <ChevronDown
              className={`hidden sm:block w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div
              id="admin-user-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200/80 py-2 z-50 overflow-hidden"
              style={{ animation: 'dropIn 0.18s ease both' }}
            >
              {/* User info header */}
              <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/80">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A8875E] to-[#6B5235] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">{user?.name || 'Admin'}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/admin/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <span className="text-[#A8875E] text-xs">⚙</span>
                  </div>
                  <span>Settings</span>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <ExternalLink className="w-3 h-3 text-[#A8875E]" />
                  </div>
                  <span>View Storefront</span>
                </Link>
              </div>

              <div className="border-t border-zinc-100 pt-1">
                <button
                  onClick={() => { setDropdownOpen(false); onLogout && onLogout(); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center">
                    <LogOut className="w-3 h-3 text-rose-500" />
                  </div>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </header>
  );
}
