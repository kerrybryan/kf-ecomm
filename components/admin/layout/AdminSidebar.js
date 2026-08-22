'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  MessageSquareQuote,
  Briefcase,
  Users,
  Layers,
  Settings,
  ExternalLink,
  Shield,
  LogOut,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Share2,
  Hammer,
  Truck,
  DollarSign,
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

const NAV_ITEMS = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
    roles: ['super_admin', 'product_manager', 'sales_manager', 'support', 'admin'],
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Package,
    roles: ['super_admin', 'product_manager', 'admin'],
  },
  {
    name: 'Source Studio',
    href: '/admin/source-studio',
    icon: Sparkles,
    badge: 'AI',
    roles: ['super_admin', 'product_manager', 'admin'],
  },
  {
    name: 'Image Studio',
    href: '/admin/image-studio',
    icon: Wand2,
    roles: ['super_admin', 'product_manager', 'admin'],
  },
  {
    name: 'Social Media',
    href: '/admin/social',
    icon: Share2,
    badge: 'Hub',
    roles: ['super_admin', 'product_manager', 'sales_manager', 'admin'],
  },
  {
    name: 'Manufacturing',
    href: '/admin/manufacturing',
    icon: Hammer,
    badge: 'Workshop',
    roles: ['super_admin', 'product_manager', 'admin'],
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
    roles: ['super_admin', 'sales_manager', 'support', 'admin'],
  },
  {
    name: 'Logistics & Delivery',
    href: '/admin/fulfillment',
    icon: Truck,
    badge: 'Fleet',
    roles: ['super_admin', 'sales_manager', 'support', 'admin'],
  },
  {
    name: 'Finance & P&L',
    href: '/admin/finance',
    icon: DollarSign,
    roles: ['super_admin', 'admin'],
  },
  {
    name: 'Custom Quotes & Wholesale',
    href: '/admin/inquiries',
    icon: MessageSquareQuote,
    roles: ['super_admin', 'product_manager', 'sales_manager', 'support', 'admin'],
  },
  {
    name: 'Agents',
    href: '/admin/agents',
    icon: Briefcase,
    roles: ['super_admin', 'sales_manager', 'admin'],
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
    roles: ['super_admin', 'sales_manager', 'support', 'admin'],
  },
  {
    name: 'Content & Marketing',
    href: '/admin/content',
    icon: Layers,
    roles: ['super_admin', 'product_manager', 'admin'],
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    roles: ['super_admin', 'admin'],
  },
];

export default function AdminSidebar({ user, onLogout, isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();
  const currentRole = user?.role || 'super_admin';

  const isItemActive = (href) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(currentRole));

  const SidebarContent = (
    <div className="flex flex-col h-full bg-[#1A1613] text-[#F3ECE1] border-r border-[#2C2520] select-none">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-[#2C2520] flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A8875E] to-[#785E3B] flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-lg font-bold tracking-wider text-white">NORDIKA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] bg-[#A8875E]/15 px-1.5 py-0.5 rounded border border-[#A8875E]/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#A3998D] font-light">Internal Operations Hub</p>
          </div>
        </Link>
      </div>

      {/* Admin User Mini Card */}
      {user && (
        <div className="px-5 py-3.5 mx-3 mt-4 rounded-xl bg-[#231E1A] border border-[#352D26] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#A8875E]/20 border border-[#A8875E]/40 flex items-center justify-center text-[#A8875E] font-bold text-xs uppercase">
            {user.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <div className="mt-0.5">
              <StatusBadge status={user.role} size="xs" showDot={false} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#7C7265] mb-2">
          Management
        </p>

        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                active
                  ? 'bg-[#A8875E] text-[#1A1613] font-semibold shadow-sm'
                  : 'text-[#CFC4B6] hover:bg-[#26201B] hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    active ? 'text-[#1A1613]' : 'text-[#A8875E]'
                  }`}
                />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    active
                      ? 'bg-[#1A1613] text-[#A8875E]'
                      : 'bg-[#A8875E]/20 text-[#A8875E] border border-[#A8875E]/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Utilities */}
      <div className="p-3 border-t border-[#2C2520] space-y-1 bg-[#15120F]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-[#A3998D] hover:bg-[#26201B] hover:text-white transition-colors group"
        >
          <span className="flex items-center gap-2.5">
            <ExternalLink className="w-3.5 h-3.5 text-[#A8875E]" />
            View Live Store
          </span>
          <span className="text-[10px] text-[#7C7265] group-hover:text-zinc-400">Storefront ↗</span>
        </Link>

        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs text-rose-300 hover:bg-rose-950/40 hover:text-rose-200 transition-colors cursor-pointer text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
