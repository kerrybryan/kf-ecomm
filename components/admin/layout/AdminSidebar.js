'use client';

import React, { useState } from 'react';
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
  LogOut,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Share2,
  Hammer,
  Truck,
  DollarSign,
  Calculator,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Send,
} from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import BrandLogo from '@/components/ui/BrandLogo';

// Grouped nav structure
const NAV_GROUPS = [
  {
    group: 'Overview',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, roles: ['super_admin', 'product_manager', 'sales_manager', 'support', 'admin'] },
    ],
  },
  {
    group: 'Pricing & Sourcing',
    items: [
      { name: 'Pricing Calculator', href: '/admin/pricing/calculate', icon: Calculator, badge: 'Birr', roles: ['super_admin', 'product_manager', 'admin'] },
      { name: 'Material Rates', href: '/admin/pricing/materials', icon: DollarSign, roles: ['super_admin', 'product_manager', 'admin'] },
      { name: 'Category Formulas', href: '/admin/pricing/categories', icon: Layers, roles: ['super_admin', 'product_manager', 'admin'] },
      { name: 'Source Studio', href: '/admin/source-studio', icon: Sparkles, roles: ['super_admin', 'product_manager', 'admin'] },
    ],
  },
  {
    group: 'Products & Studio',
    items: [
      { name: 'Products', href: '/admin/products', icon: Package, roles: ['super_admin', 'product_manager', 'admin'] },
      { name: 'Content Studio', href: '/admin/content-studio', icon: Wand2, badge: 'Studio', roles: ['super_admin', 'product_manager', 'admin'] },
      { name: 'Publishing Queue', href: '/admin/publishing', icon: Calendar, badge: 'Queue', roles: ['super_admin', 'product_manager', 'sales_manager', 'admin'] },
      { name: 'Manufacturing', href: '/admin/manufacturing', icon: Hammer, badge: 'Workshop', roles: ['super_admin', 'product_manager', 'admin'] },
    ],
  },
  {
    group: 'Sales & Operations',
    items: [
      { name: 'Orders', href: '/admin/orders', icon: ShoppingBag, roles: ['super_admin', 'sales_manager', 'support', 'admin'] },
      { name: 'Logistics & Delivery', href: '/admin/fulfillment', icon: Truck, badge: 'Fleet', roles: ['super_admin', 'sales_manager', 'support', 'admin'] },
      { name: 'Custom Quotes', href: '/admin/inquiries', icon: MessageSquareQuote, roles: ['super_admin', 'product_manager', 'sales_manager', 'support', 'admin'] },
      { name: 'Agents', href: '/admin/agents', icon: Briefcase, roles: ['super_admin', 'sales_manager', 'admin'] },
      { name: 'Finance & P&L', href: '/admin/finance', icon: DollarSign, roles: ['super_admin', 'admin'] },
    ],
  },
  {
    group: 'Growth',
    items: [
      { name: 'Social Media', href: '/admin/social', icon: Share2, badge: 'Hub', roles: ['super_admin', 'product_manager', 'sales_manager', 'admin'] },
      { name: 'Content & Marketing', href: '/admin/content', icon: Layers, roles: ['super_admin', 'product_manager', 'admin'] },
      { name: 'Customers', href: '/admin/customers', icon: Users, roles: ['super_admin', 'sales_manager', 'support', 'admin'] },
    ],
  },
  {
    group: 'System',
    items: [
      { name: 'Settings', href: '/admin/settings', icon: Settings, roles: ['super_admin', 'admin'] },
    ],
  },
];

export default function AdminSidebar({ user, onLogout, isMobileOpen, setIsMobileOpen }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const currentRole = user?.role || 'super_admin';

  const isItemActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const SidebarContent = (
    <div className={`flex flex-col h-full bg-[#111009] text-[#F3ECE1] border-r border-[#1E1A14] select-none transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Brand Header */}
      <div className={`px-4 py-5 border-b border-[#1E1A14] flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed ? (
          <BrandLogo variant="white" size="sm" href="/admin" />
        ) : (
          <BrandLogo variant="white" size="sm" showText={false} href="/admin" />
        )}

        {!collapsed && (
          <button
            onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-[#6B5E4E] hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* User card */}
      {user && !collapsed && (
        <div className="mx-3 mt-3 px-3.5 py-3 rounded-xl bg-[#1A1613] border border-[#2C2520] flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#A8875E] to-[#6B5235] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
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

      {/* Nav Groups */}
      <div className="flex-1 px-2 py-4 overflow-y-auto space-y-5">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) => item.roles.includes(currentRole));
          if (!visibleItems.length) return null;

          return (
            <div key={group.group}>
              {!collapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[#4E4336] mb-1.5">
                  {group.group}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                      title={collapsed ? item.name : undefined}
                      className={`flex items-center ${collapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group relative ${active
                          ? 'bg-gradient-to-r from-[#A8875E] to-[#8B6C44] text-white shadow-md'
                          : 'text-[#B8AFA4] hover:bg-[#1E1A14] hover:text-white'
                        }`}
                    >
                      <div className={`flex items-center ${collapsed ? '' : 'gap-3'}`}>
                        <Icon
                          className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-[#A8875E] group-hover:text-[#D99A2B]'} transition-colors`}
                        />
                        {!collapsed && <span>{item.name}</span>}
                      </div>

                      {!collapsed && item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${active ? 'bg-white/20 text-white' : 'bg-[#A8875E]/20 text-[#D99A2B] border border-[#A8875E]/30'
                            }`}
                        >
                          {item.badge}
                        </span>
                      )}

                      {/* Active indicator line */}
                      {active && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#D99A2B] rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-[#1E1A14] bg-[#0D0B08] space-y-0.5">
        {!collapsed && (
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs text-[#8E8475] hover:bg-[#1E1A14] hover:text-white transition-colors group"
          >
            <span className="flex items-center gap-2.5">
              <ExternalLink className="w-3.5 h-3.5 text-[#A8875E]" />
              View Live Store
            </span>
            <span className="text-[10px] text-[#4E4336] group-hover:text-zinc-400">↗</span>
          </Link>
        )}

        {onLogout && (
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-2' : 'gap-2.5 px-3'} py-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-colors cursor-pointer`}
            title={collapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-3.5 h-3.5" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        )}
      </div>

      {/* Collapse toggle — desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#A8875E] text-white items-center justify-center shadow-lg hover:bg-[#8B6C44] transition-colors z-10"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex h-screen sticky top-0 shrink-0 z-30 relative overflow-visible">
        {SidebarContent}
      </aside>


      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10">
            {SidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
