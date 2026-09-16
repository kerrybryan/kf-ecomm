'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Save,
  Clock,
  ChevronRight,
  AlertCircle,
  Building,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import { FormField, TextInput, TextArea, Select } from '@/components/admin/ui/FormControls';

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // CRM notes & status state
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('active');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/customers/${id}`);
      const json = await res.json();
      if (json.success) {
        setCustomer(json.data);
        setNotes(json.data.notes || '');
        setStatus(json.data.status || 'active');
        setPhone(json.data.phone || '');
      } else {
        setError(json.error || 'Customer not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchCustomer();
  }, [id]);

  const handleSaveCRM = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveSuccess(false);
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes, status, phone }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        fetchCustomer();
      }
    } catch (err) {
      console.error('Save CRM error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading customer CRM profile...</span>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-700">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
        <p className="font-bold">{error || 'Customer not found'}</p>
        <Link href="/admin/customers" className="text-[#A8875E] font-semibold underline mt-2 inline-block">
          Return to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/customers"
            className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
                {customer.name}
              </h1>
              <StatusBadge status={customer.status || 'active'} size="sm" />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Member since{' '}
              {new Date(customer.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Lifetime Spend</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">
            ${(customer.totalSpent || 0).toLocaleString()}
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Total Orders</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{customer.totalOrders || 0}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-zinc-200 shadow-xs">
          <p className="text-[10px] uppercase font-bold text-zinc-400">Wishlist Saved</p>
          <p className="text-xl font-bold text-zinc-900 mt-1">{customer.wishlist?.length || 0} items</p>
        </div>
      </div>

      {/* Main Grid: Left Order History & Wishlist, Right CRM & Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order History Table */}
          <AdminCard
            title="Complete Order History"
            subtitle={`${customer.orders?.length || 0} orders recorded for this account`}
          >
            <div className="overflow-x-auto -mx-6 -my-6">
              <table className="w-full text-left text-xs text-zinc-600">
                <thead className="bg-zinc-50 border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Order #</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Items</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-normal">
                  {customer.orders?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-zinc-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    customer.orders?.map((ord) => (
                      <tr key={ord._id} className="hover:bg-zinc-50">
                        <td className="px-6 py-3.5 font-bold font-mono text-zinc-900">
                          {ord.orderNumber}
                        </td>
                        <td className="px-6 py-3.5 text-zinc-500">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-3.5">{ord.items?.length || 1} items</td>
                        <td className="px-6 py-3.5 font-bold text-zinc-900">
                          ${ord.total?.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <StatusBadge status={ord.status} size="xs" />
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <Link
                            href={`/admin/orders/${ord._id}`}
                            className="text-xs font-semibold text-[#A8875E] hover:underline"
                          >
                            View Order →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>

          {/* Wishlist Items */}
          {customer.wishlist?.length > 0 && (
            <AdminCard title="Wishlist Items" subtitle="Products saved by the client for future procurement">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {customer.wishlist.map((prod) => (
                  <div key={prod._id} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 space-y-2">
                    <img
                      src={prod.images?.[0] || ''}
                      alt={prod.name}
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-zinc-900 text-xs truncate">{prod.name}</p>
                      <p className="font-bold text-[#A8875E] text-xs mt-0.5">ETB {prod.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AdminCard>
          )}
        </div>

        {/* Right Column (1 Col) */}
        <div className="space-y-6">
          {/* CRM Internal Notes & Status Editor */}
          <AdminCard
            title="CRM File & Account Notes"
            subtitle="Private internal profile notes for this customer"
          >
            <form onSubmit={handleSaveCRM} className="space-y-4">
              <FormField label="Account Status">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: 'active', label: 'Active Account' },
                    { value: 'suspended', label: 'Suspended / On Hold' },
                  ]}
                />
              </FormField>

              <FormField label="Contact Phone">
                <TextInput
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (206) 555-0199"
                />
              </FormField>

              <FormField label="Staff CRM Memo" helperText="Private notes about design taste, trade discounts, or special requests">
                <TextArea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Waterfront residence project in Seattle. Prefers smoked oak finishes..."
                />
              </FormField>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : saveSuccess ? '✓ Saved' : 'Save CRM Changes'}</span>
              </button>
            </form>
          </AdminCard>

          {/* Saved Addresses */}
          <AdminCard title="Saved Shipping Addresses">
            <div className="space-y-3">
              {customer.addresses?.length === 0 ? (
                <p className="text-xs text-zinc-400">No saved addresses on file.</p>
              ) : (
                customer.addresses?.map((addr, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs ${
                      addr.isDefault ? 'bg-amber-50/40 border-amber-200' : 'bg-zinc-50 border-zinc-200/80'
                    }`}
                  >
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-[#A8875E] uppercase block mb-1">
                        Primary Delivery Address
                      </span>
                    )}
                    <p className="font-medium text-zinc-800">{addr.street}</p>
                    {addr.apartment && <p className="text-zinc-600">{addr.apartment}</p>}
                    <p className="text-zinc-600">
                      {addr.city}, {addr.state} {addr.postalCode}
                    </p>
                    <p className="text-zinc-400">{addr.country}</p>
                  </div>
                ))
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
