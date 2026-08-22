'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Truck,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Phone,
  FileCheck,
  X,
  Camera,
} from 'lucide-react';
import FulfillmentHeader from '@/components/admin/fulfillment/FulfillmentHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function DispatchControlTowerPage() {
  const [shipments, setShipments] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [podModalShipment, setPodModalShipment] = useState(null);
  const [podForm, setPodForm] = useState({
    recipientName: '',
    signature: 'Digital Signature Verified on Pad',
    conditionNotes: 'Delivered in pristine condition and assembled on site.',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/fulfillment/shipments', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setShipments(data.data || []);
        setCounts(data.counts || {});
      }
    } catch (err) {
      console.error('Fetch shipments error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/fulfillment/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Shipment updated to ${newStatus.replace('_', ' ').toUpperCase()}`);
        fetchShipments();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to update status');
    }
  };

  const handleRecordPod = async (e) => {
    e.preventDefault();
    if (!podModalShipment) return;

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/fulfillment/shipments/${podModalShipment._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'delivered',
          proofOfDelivery: {
            recipientName: podForm.recipientName || podModalShipment.orderId?.customer?.name || 'Verified Recipient',
            signatureUrl: podForm.signature,
            conditionNotes: podForm.conditionNotes,
            deliveredAt: new Date(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit POD');
      }

      setSuccessMsg('Digital Proof of Delivery captured & Order marked as Delivered!');
      setPodModalShipment(null);
      fetchShipments();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'POD error');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <FulfillmentHeader
        title="Dispatch Control Tower"
        subtitle="Live delivery route monitoring, white-glove window appointments, and on-site proof of delivery capture."
      />

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Shipments' },
            { id: 'pending_dispatch', label: `Pending Dispatch (${counts.pending_dispatch || 0})` },
            { id: 'dispatched', label: `Dispatched (${counts.dispatched || 0})` },
            { id: 'out_for_delivery', label: `Out for Delivery (${counts.out_for_delivery || 0})` },
            { id: 'delivered', label: `Delivered (${counts.delivered || 0})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#1A1613] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shipments Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading white-glove fleet dispatch...
        </div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          No shipments found for the selected status.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
              <tr>
                <th className="px-5 py-3.5">Tracking & Order</th>
                <th className="px-5 py-3.5">Destination & Customer</th>
                <th className="px-5 py-3.5">Driver & Van</th>
                <th className="px-5 py-3.5">Delivery Window</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5DF]">
              {shipments.map((ship) => (
                <tr key={ship._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  {/* Tracking */}
                  <td className="px-5 py-4">
                    <p className="font-bold font-mono text-[#1A1613]">{ship.trackingNumber}</p>
                    <p className="text-[10px] text-[#A8875E] font-medium">
                      Order: {ship.orderId?.orderNumber || 'Bespoke Item'}
                    </p>
                  </td>

                  {/* Destination */}
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#1A1613]">{ship.orderId?.customer?.name || 'Customer'}</p>
                    <p className="text-[11px] text-[#7C7265] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#A8875E]" />
                      {ship.orderId?.customer?.address?.city || 'Seattle'}, {ship.orderId?.customer?.address?.state || 'WA'}
                    </p>
                  </td>

                  {/* Driver */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <p className="font-bold text-[#1A1613]">{ship.driverName}</p>
                    <p className="text-[10px] text-[#7C7265]">{ship.vehicleId}</p>
                  </td>

                  {/* Window */}
                  <td className="px-5 py-4 whitespace-nowrap text-[11px] text-[#4A4036]">
                    <div className="flex items-center gap-1 font-semibold text-[#1A1613]">
                      <Calendar className="w-3.5 h-3.5 text-[#A8875E]" />
                      <span>
                        {ship.deliveryWindow?.date
                          ? new Date(ship.deliveryWindow.date).toLocaleDateString()
                          : 'TBD'}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#7C7265]">{ship.deliveryWindow?.timeSlot}</span>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4 whitespace-nowrap">
                    <StatusBadge status={ship.status} size="xs" />
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-2">
                    {ship.status === 'pending_dispatch' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ship._id, 'dispatched')}
                        className="px-3 py-1 rounded-lg bg-[#1A1613] text-white text-xs font-bold hover:bg-[#2C2520]"
                      >
                        Dispatch Van
                      </button>
                    )}
                    {ship.status === 'dispatched' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ship._id, 'out_for_delivery')}
                        className="px-3 py-1 rounded-lg bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750]"
                      >
                        Out for Delivery
                      </button>
                    )}
                    {ship.status === 'out_for_delivery' && (
                      <button
                        type="button"
                        onClick={() => {
                          setPodModalShipment(ship);
                          setPodForm({
                            recipientName: ship.orderId?.customer?.name || '',
                            signature: 'Digital Signature Verified on Driver Pad',
                            conditionNotes: 'Delivered in pristine condition and assembled on site.',
                          });
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 inline-flex"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        Record POD
                      </button>
                    )}
                    {ship.status === 'delivered' && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        ✓ POD Verified
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Digital Proof of Delivery Modal */}
      {podModalShipment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRecordPod} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#EBE5DF]">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-[#1A1613]">
                  Digital Proof of Delivery (POD)
                </h3>
              </div>
              <button type="button" onClick={() => setPodModalShipment(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EBE5DF] text-[#4A4036] space-y-1">
                <p>Tracking: <strong>{podModalShipment.trackingNumber}</strong></p>
                <p>Order: <strong>{podModalShipment.orderId?.orderNumber}</strong></p>
              </div>

              <div>
                <label className="font-semibold text-[#4A4036]">Recipient Sign-off Name</label>
                <input
                  type="text"
                  value={podForm.recipientName}
                  onChange={(e) => setPodForm({ ...podForm, recipientName: e.target.value })}
                  placeholder="Customer or Concierge Name"
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A4036]">Digital Signature Pad Token</label>
                <input
                  type="text"
                  value={podForm.signature}
                  onChange={(e) => setPodForm({ ...podForm, signature: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2] bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A4036]">On-Site Assembly & Condition Notes</label>
                <textarea
                  rows={3}
                  value={podForm.conditionNotes}
                  onChange={(e) => setPodForm({ ...podForm, conditionNotes: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setPodModalShipment(null)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isUpdating ? 'Saving POD...' : 'Confirm Delivery & POD'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
