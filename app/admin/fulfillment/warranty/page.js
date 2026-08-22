'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Clock,
  Hammer,
  User,
  X,
  FileCheck,
} from 'lucide-react';
import FulfillmentHeader from '@/components/admin/fulfillment/FulfillmentHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function WarrantyClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [assignedArtisan, setAssignedArtisan] = useState('Lars Lindqvist');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/fulfillment/warranty');
      const data = await res.json();
      if (data.success) {
        setClaims(data.data || []);
      }
    } catch (err) {
      console.error('Fetch claims error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleResolve = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/fulfillment/warranty/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          resolutionNotes: resolutionNotes || `Claim updated to ${status}`,
          assignedArtisan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Warranty claim updated to ${status}!`);
        setSelectedClaim(null);
        fetchClaims();
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg('Failed to update claim');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <FulfillmentHeader
        title="5-Year Warranty & Damage Claims"
        subtitle="Manage customer craftsmanship guarantees, transit touch-ups, and replacement approvals."
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

      {/* Claims List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading warranty triage...
        </div>
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          No open warranty or damage claims reported.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {claims.map((claim) => (
            <div
              key={claim._id}
              className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#A8875E] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-2.5">
                  <span className="text-xs font-mono font-bold text-[#A8875E]">{claim.claimNumber}</span>
                  <StatusBadge status={claim.status} size="xs" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1A1613]">{claim.productName}</h4>
                  <p className="text-xs text-[#7C7265]">
                    Client: <strong>{claim.customerName}</strong> ({claim.customerEmail})
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EBE5DF] text-xs text-[#4A4036] space-y-1">
                  <p className="font-semibold text-amber-900 capitalize">Type: {claim.claimType.replace('_', ' ')}</p>
                  <p className="text-[#7C7265] leading-relaxed">{claim.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#EBE5DF] flex items-center justify-between">
                <span className="text-[10px] text-[#7C7265]">
                  Submitted: {new Date(claim.createdAt).toLocaleDateString()}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedClaim(claim);
                    setResolutionNotes(claim.resolutionNotes || '');
                    setAssignedArtisan(claim.assignedArtisan || 'Lars Lindqvist');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1A1613] hover:bg-[#2C2520] text-white text-xs font-bold transition-all"
                >
                  Review & Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Resolution Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#EBE5DF]">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <h3 className="text-sm font-bold text-[#1A1613]">Resolve Claim {selectedClaim.claimNumber}</h3>
              <button type="button" onClick={() => setSelectedClaim(null)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#4A4036]">Assigned Repair Artisan</label>
                <input
                  type="text"
                  value={assignedArtisan}
                  onChange={(e) => setAssignedArtisan(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#4A4036]">Resolution Action & Workshop Notes</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail on-site repair, white-glove touch-up, or replacement batch..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleResolve(selectedClaim._id, 'replacement_approved')}
                className="px-4 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750]"
              >
                Approve Replacement
              </button>
              <button
                type="button"
                onClick={() => handleResolve(selectedClaim._id, 'resolved')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
              >
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
