'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  LogOut,
  Clock,
  ArrowRight,
  ShieldCheck,
  Truck,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/lib/utils';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'addresses' | 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!user?.email) return;
      try {
        setLoadingOrders(true);
        const res = await fetch(`/api/orders?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (isAuthenticated && user) {
      fetchUserOrders();
    }
  }, [isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-700" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="bg-[#FAF9F6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Welcome Banner */}
        <div className="bg-white rounded-3xl p-8 border border-stone-200 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-stone-900 text-stone-100 flex items-center justify-center text-xl font-bold font-serif-luxury shadow-md">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 block">
                Customer Account Sanctuary
              </span>
              <h1 className="text-2xl font-serif-luxury font-bold text-stone-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-xs text-stone-500">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-600 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors w-fit"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <aside className="lg:col-span-3 bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'orders'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Orders & Tracking</span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
                {orders.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 p-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'addresses'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </button>

            <Link
              href="/wishlist"
              className="w-full flex items-center justify-between p-3.5 rounded-2xl text-xs font-semibold uppercase tracking-wider text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4" />
                <span>Saved Wishlist</span>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400" />
            </Link>
          </aside>

          {/* Tab Content Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-6">
                  <h2 className="text-base font-serif-luxury font-bold text-stone-900">
                    Order History & Live Status
                  </h2>
                  <span className="text-xs text-stone-500">
                    {orders.length} Recorded Orders
                  </span>
                </div>

                {loadingOrders ? (
                  <div className="py-16 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-xs">Fetching orders from MongoDB...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16">
                    <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-stone-800">No Orders Yet</h3>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      You haven’t placed any furniture orders with this account yet.
                    </p>
                    <Link
                      href="/shop"
                      className="mt-6 inline-block bg-stone-900 text-white text-xs font-semibold px-6 py-3 rounded-xl uppercase tracking-widest hover:bg-stone-800"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orders.map((ord) => (
                      <div
                        key={ord._id || ord.orderNumber}
                        className="bg-stone-50 rounded-2xl p-6 border border-stone-200/80 transition-all hover:border-stone-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 pb-4 mb-4 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Order Number
                            </span>
                            <span className="font-mono font-bold text-stone-900 text-sm">
                              {ord.orderNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Date Placed
                            </span>
                            <span className="text-stone-700 font-medium">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Status
                            </span>
                            <span className="inline-flex items-center gap-1 bg-stone-900 text-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider">
                              <Truck className="w-3 h-3" />
                              {ord.status}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-stone-400 block">
                              Total
                            </span>
                            <span className="font-bold text-stone-900 text-sm">
                              {formatPrice(ord.total)}
                            </span>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="space-y-2">
                          {ord.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs py-1">
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-lg object-cover border"
                                  />
                                )}
                                <div>
                                  <p className="font-semibold text-stone-900">{item.name}</p>
                                  <p className="text-[11px] text-stone-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <span className="font-bold text-stone-800">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-stone-200/60 flex justify-end">
                          <Link
                            href={`/orders/${ord._id || ord.orderNumber}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-stone-900 hover:text-amber-700 transition-colors"
                          >
                            <span>View Full Receipt & Tracking Timeline</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Addresses */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <h2 className="text-base font-serif-luxury font-bold text-stone-900">
                    Saved Delivery Addresses
                  </h2>
                </div>

                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs text-stone-700 space-y-1 relative"
                      >
                        {addr.isDefault && (
                          <span className="absolute top-4 right-4 bg-stone-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                        <p className="font-bold text-stone-900">{user.name}</p>
                        <p>{addr.street}</p>
                        {addr.apartment && <p>{addr.apartment}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p>{addr.country}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-stone-500 text-xs">
                    <MapPin className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                    <p>No addresses saved yet. Addresses entered during checkout will appear here.</p>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
