'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Printer,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  User,
  MapPin,
  FileText,
  Send,
  ShieldCheck,
  Building,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import { FormField, TextInput, TextArea, Select } from '@/components/admin/ui/FormControls';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status update state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Internal CRM note state
  const [noteInput, setNoteInput] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/orders/${id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        setNewStatus(json.data.status);
      } else {
        setError(json.error || 'Order not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (newStatus === order.status && !statusNote) return;

    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          note: statusNote || `Status updated to ${newStatus}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatusNote('');
        fetchOrder();
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    try {
      setAddingNote(true);
      const res = await fetch(`/api/admin/orders/${id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteInput.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        setNoteInput('');
        fetchOrder();
      }
    } catch (err) {
      console.error('Add note failed:', err);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading order fulfillment file...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 rounded-2xl bg-rose-50 border border-rose-200 text-center text-xs text-rose-700">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-500" />
        <p className="font-bold">{error || 'Order record not found'}</p>
        <Link href="/admin/orders" className="text-[#A8875E] font-semibold underline mt-2 inline-block">
          Return to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
                Order {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} size="sm" />
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Placed on{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/orders/${order._id}/invoice`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#A8875E]" />
            <span>Print Invoice</span>
          </Link>
        </div>
      </div>

      {/* Fulfillment Stepper (Visual Progress) */}
      {order.status !== 'cancelled' && (
        <div className="p-6 bg-white rounded-2xl border border-zinc-200/80 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
            Fulfillment Lifecycle
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
            {STATUS_STEPS.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step} className="flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isCompleted
                          ? 'bg-[#A8875E] text-[#1A1613] shadow-md shadow-[#A8875E]/20'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span
                      className={`text-xs font-semibold capitalize ${
                        isCurrent ? 'text-[#A8875E]' : isCompleted ? 'text-zinc-900' : 'text-zinc-400'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 hidden sm:block">
                    {step === 'pending' && 'Order Received'}
                    {step === 'processing' && 'Workshop Joinery'}
                    {step === 'shipped' && 'In White-Glove Transit'}
                    {step === 'delivered' && 'Placed in Residence'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Left Details & Right Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Line Items & Timeline Audit Log */}
        <div className="lg:col-span-2 space-y-6">
          {/* Line Items Table */}
          <AdminCard title="Order Line Items" subtitle={`${order.items?.length || 0} unique furniture items`}>
            <div className="divide-y divide-zinc-100 -mx-6 -my-6">
              {order.items?.map((item, idx) => (
                <div key={idx} className="p-5 flex items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{item.name}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                        {item.variant?.color && <span>Finish: {item.variant.color}</span>}
                        {item.variant?.material && <span>• Material: {item.variant.material}</span>}
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        ${item.price?.toLocaleString()} × {item.quantity} units
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-zinc-900">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Financial Summary Strip */}
            <div className="mt-6 pt-5 border-t border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-500">
                <span>Subtotal</span>
                <span className="font-semibold text-zinc-800">ETB {order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Delivery & Setup</span>
                <span className="font-semibold text-zinc-800">
                  {order.shipping === 0 ? 'Complimentary (ETB 0)' : `ETB ${order.shipping?.toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between text-zinc-500">
                <span>Estimated 15% VAT</span>
                <span className="font-semibold text-zinc-800">ETB {order.tax?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-zinc-100">
                <span>Total Amount Charged</span>
                <span className="text-[#A8875E]">ETB {order.total?.toLocaleString()}</span>
              </div>
            </div>
          </AdminCard>

          {/* Immutable Audit Timeline Log */}
          <AdminCard
            title="Fulfillment Timeline & Audit History"
            subtitle="Immutable event logs recording all status adjustments and responsible agents"
          >
            <div className="space-y-4">
              {order.timeline?.length === 0 ? (
                <p className="text-xs text-zinc-400">No status logs recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
                  {order.timeline?.map((entry, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white border-2 border-[#A8875E] group-hover:scale-110 transition-transform" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold capitalize text-zinc-900">
                            {entry.status}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {new Date(entry.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">{entry.note}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                          Logged by: {entry.updatedBy || 'System'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AdminCard>
        </div>

        {/* Right Column (1 Col): Status Updater, Customer Info & CRM Notes */}
        <div className="space-y-6">
          {/* Status Update Control */}
          <AdminCard title="Update Order Status" subtitle="Transition fulfillment state and append notes">
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <FormField label="Fulfillment Stage">
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  options={[
                    { value: 'pending', label: 'Pending (New Order)' },
                    { value: 'processing', label: 'Processing (In Production)' },
                    { value: 'shipped', label: 'Shipped (In Transit)' },
                    { value: 'delivered', label: 'Delivered (Completed)' },
                    { value: 'cancelled', label: 'Cancelled (Refunded)' },
                  ]}
                />
              </FormField>

              <FormField label="Audit Log Note" helperText="Describe carrier tracking, workshop dispatch, or client notice">
                <TextArea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Carrier dispatched white-glove team..."
                />
              </FormField>

              <button
                type="submit"
                disabled={updatingStatus || newStatus === order.status}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {updatingStatus ? 'Updating Status...' : 'Apply Status Change'}
              </button>
            </form>
          </AdminCard>

          {/* Customer & Shipping Information */}
          <AdminCard title="Client & Delivery Address">
            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-[#A8875E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-zinc-900">{order.customer?.name}</p>
                  <p className="text-zinc-500">{order.customer?.email}</p>
                  <p className="text-zinc-500">{order.customer?.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-zinc-100">
                <MapPin className="w-4 h-4 text-[#A8875E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900">Destination Residence</p>
                  <p className="text-zinc-600">{order.customer?.address?.street}</p>
                  {order.customer?.address?.apartment && (
                    <p className="text-zinc-600">{order.customer?.address?.apartment}</p>
                  )}
                  <p className="text-zinc-600">
                    {order.customer?.address?.city}, {order.customer?.address?.state}{' '}
                    {order.customer?.address?.postalCode}
                  </p>
                  <p className="text-zinc-400">{order.customer?.address?.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-zinc-100">
                <CreditCard className="w-4 h-4 text-[#A8875E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900 capitalize">
                    {order.paymentMethod?.replace(/_/g, ' ')}
                  </p>
                  <StatusBadge status={order.paymentStatus || 'paid'} size="xs" />
                </div>
              </div>
            </div>
          </AdminCard>

          {/* Staff CRM Internal Notes */}
          <AdminCard title="Staff Internal Notes" subtitle="Private internal memos visible only to studio staff">
            <div className="space-y-4">
              <form onSubmit={handleAddNote} className="space-y-2">
                <TextArea
                  rows={2}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add private staff note (e.g. VIP interior designer account)..."
                />
                <button
                  type="submit"
                  disabled={addingNote || !noteInput.trim()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>{addingNote ? 'Saving...' : 'Add Note'}</span>
                </button>
              </form>

              <div className="space-y-2.5 pt-2">
                {order.internalNotes?.length === 0 ? (
                  <p className="text-[11px] text-zinc-400">No staff notes recorded yet.</p>
                ) : (
                  order.internalNotes?.map((n, idx) => (
                    <div key={idx} className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 text-xs">
                      <p className="text-zinc-700">{n.note}</p>
                      <p className="text-[10px] text-zinc-400 mt-1">
                        {n.createdBy} • {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
