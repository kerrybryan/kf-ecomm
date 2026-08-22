'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Kanban,
  Plus,
  ArrowRight,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  X,
  Hammer,
  Layers,
  ChevronRight,
} from 'lucide-react';
import ManufacturingHeader from '@/components/admin/manufacturing/ManufacturingHeader';

const KANBAN_STAGES = [
  { id: 'timber_selection', name: 'Timber Selection', color: 'border-amber-400 bg-amber-50/50' },
  { id: 'cutting_joinery', name: 'CNC & Joinery', color: 'border-orange-400 bg-orange-50/50' },
  { id: 'hand_sanding', name: 'Hand Sanding', color: 'border-yellow-400 bg-yellow-50/50' },
  { id: 'finishing_staining', name: 'Finishing & Stain', color: 'border-blue-400 bg-blue-50/50' },
  { id: 'upholstery', name: 'Upholstery', color: 'border-purple-400 bg-purple-50/50' },
  { id: 'quality_inspection', name: 'Quality QC', color: 'border-emerald-400 bg-emerald-50/50' },
  { id: 'completed', name: 'Ready for Logistics', color: 'border-stone-800 bg-stone-100' },
];

export default function ManufacturingKanbanPage() {
  const [orders, setOrders] = useState([]);
  const [stageCounts, setStageCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [newOrderForm, setNewOrderForm] = useState({
    productId: '',
    productName: '',
    priority: 'standard',
    leadCraftsman: 'Lars Lindqvist',
    workshopBench: 'Bench 3 - Joinery East',
    targetDays: 14,
  });

  const fetchBoard = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/manufacturing/production');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
        setStageCounts(data.stageCounts || {});
      }
    } catch (err) {
      console.error('Fetch kanban board error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();

    // Fetch products for create dropdown
    fetch('/api/admin/products?limit=25')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setProducts(j.data || []);
      })
      .catch(() => {});
  }, []);

  const handleAdvanceStage = async (orderId, currentStage) => {
    const stageIds = KANBAN_STAGES.map((s) => s.id);
    const currentIndex = stageIds.indexOf(currentStage);
    if (currentIndex >= stageIds.length - 1) return; // already completed

    const nextStage = stageIds[currentIndex + 1];

    try {
      setIsAdvancing(true);
      setErrorMsg('');

      const res = await fetch(`/api/admin/manufacturing/production/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStage: nextStage }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to advance stage');
      }

      setSuccessMsg(`Order advanced to ${nextStage.replace('_', ' ').toUpperCase()}! Materials auto-checked.`);
      fetchBoard();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(data.data);
      }
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Advance error');
    } finally {
      setIsAdvancing(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const selectedProd = products.find((p) => p._id === newOrderForm.productId);

      const res = await fetch('/api/admin/manufacturing/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newOrderForm,
          productName: selectedProd?.name || newOrderForm.productName || 'Nordika Bespoke Piece',
          productImage: selectedProd?.images?.[0] || 'https://picsum.photos/seed/nordika-bench/600/600',
          materialsRequired: [
            { name: 'FSC European White Oak 8/4', quantity: 18, unit: 'bdft' },
            { name: 'Nordic Natural Bouclé Fabric', quantity: 4, unit: 'meters' },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Creation failed');
      }

      setSuccessMsg('Production order created on workshop floor!');
      setShowCreateModal(false);
      fetchBoard();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error creating order');
    }
  };

  return (
    <div className="space-y-6 max-w-full mx-auto">
      <ManufacturingHeader
        title="Production Kanban Board"
        subtitle="Real-time multi-stage workshop tracking with craftsman bench assignments and material auto-deduction."
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

      {/* Actions Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-[#7C7265]">
          <span>
            Active Orders on Floor: <strong className="text-[#1A1613]">{orders.length}</strong>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Production Order
        </button>
      </div>

      {/* 7-Column Horizontal Scrollable Kanban Container */}
      <div className="overflow-x-auto pb-6">
        <div className="flex gap-4 min-w-[1450px]">
          {KANBAN_STAGES.map((stage) => {
            const stageOrders = orders.filter((o) => o.currentStage === stage.id);

            return (
              <div
                key={stage.id}
                className="w-[230px] shrink-0 bg-[#FAF8F5] rounded-2xl border border-[#EBE5DF] flex flex-col max-h-[750px] shadow-xs"
              >
                {/* Stage Header */}
                <div className={`p-3.5 border-b border-[#EBE5DF] rounded-t-2xl flex items-center justify-between ${stage.color}`}>
                  <div>
                    <h3 className="text-xs font-bold text-[#1A1613]">{stage.name}</h3>
                    <span className="text-[10px] text-[#7C7265]">{stageOrders.length} in stage</span>
                  </div>
                  <span className="text-xs font-bold bg-white/80 px-2 py-0.5 rounded-full border border-black/10">
                    {stageOrders.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="p-2.5 flex-1 overflow-y-auto space-y-2.5">
                  {stageOrders.map((order) => {
                    const isRush = order.priority === 'rush';
                    const isVIP = order.priority === 'vip';

                    return (
                      <div
                        key={order._id}
                        onClick={() => setSelectedOrder(order)}
                        className="bg-white rounded-xl border border-[#EBE5DF] p-3 shadow-xs hover:border-[#A8875E] transition-all cursor-pointer space-y-2.5 group"
                      >
                        {/* Header: Priority & Thumbnail */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-stone-100 shrink-0 border border-[#EBE5DF]">
                            <Image
                              src={order.productImage || 'https://picsum.photos/seed/nordika-bench/200/200'}
                              alt="Product"
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                isRush
                                  ? 'bg-red-100 text-red-700'
                                  : isVIP
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {order.priority}
                            </span>
                            <p className="text-xs font-bold text-[#1A1613] line-clamp-1 mt-1">
                              {order.productName}
                            </p>
                          </div>
                        </div>

                        {/* Craftsman & Bench */}
                        <div className="text-[10px] text-[#7C7265] space-y-0.5 border-t border-[#F3ECE1] pt-1.5">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-[#A8875E]" />
                            <span className="truncate">{order.leadCraftsman}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Hammer className="w-3 h-3 text-[#7C7265]" />
                            <span className="truncate">{order.workshopBench}</span>
                          </div>
                        </div>

                        {/* Advance Action Button */}
                        {stage.id !== 'completed' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvanceStage(order._id, order.currentStage);
                            }}
                            disabled={isAdvancing}
                            className="w-full py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#A8875E] hover:text-white border border-[#D5CCC2] text-[10px] font-bold text-[#4A4036] flex items-center justify-center gap-1 transition-all"
                          >
                            <span>Next Stage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inspection Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-[#EBE5DF] animate-in fade-in zoom-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A8875E]">
                  Stage: {selectedOrder.currentStage.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-[#7C7265]">• Priority: {selectedOrder.priority}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product & Craftsman Details */}
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-[#EBE5DF]">
                <Image
                  src={selectedOrder.productImage || 'https://picsum.photos/seed/nordika-bench/400/400'}
                  alt="Product"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 text-xs">
                <h3 className="text-base font-bold text-[#1A1613]">{selectedOrder.productName}</h3>
                <p className="text-[#7C7265]">Lead Artisan: <strong>{selectedOrder.leadCraftsman}</strong></p>
                <p className="text-[#7C7265]">Workshop Location: <strong>{selectedOrder.workshopBench}</strong></p>
                <p className="text-[#7C7265]">
                  Finish: {selectedOrder.customSpecifications?.woodFinish}
                </p>
              </div>
            </div>

            {/* Stage Audit Timeline */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                Production Stage Audit History
              </h4>
              <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#EBE5DF]">
                {selectedOrder.stageHistory?.map((hist, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-[#4A4036] pb-2 border-b border-[#EBE5DF]/60 last:border-0 last:pb-0">
                    <span className="w-2 h-2 rounded-full bg-[#A8875E] shrink-0 mt-1.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="capitalize">{hist.stage.replace('_', ' ')}</strong>
                        <span className="text-[10px] text-[#7C7265]">
                          {new Date(hist.enteredAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7C7265] mt-0.5">{hist.notes || 'Stage step recorded'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Materials Auto-Deduction Status */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                Required Raw Materials
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {selectedOrder.materialsRequired?.map((mat, i) => (
                  <div key={i} className="p-2.5 rounded-xl border border-[#EBE5DF] bg-white flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-[#1A1613]">{mat.name}</p>
                      <p className="text-[10px] text-[#7C7265]">{mat.quantity} {mat.unit}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${mat.deducted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {mat.deducted ? '✓ Deducted' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold"
              >
                Close
              </button>
              {selectedOrder.currentStage !== 'completed' && (
                <button
                  type="button"
                  onClick={() => handleAdvanceStage(selectedOrder._id, selectedOrder.currentStage)}
                  disabled={isAdvancing}
                  className="px-5 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750] flex items-center gap-1.5"
                >
                  <span>Advance to Next Stage</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateOrder} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#EBE5DF]">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <h3 className="text-sm font-bold text-[#1A1613]">New Workshop Production Order</h3>
              <button type="button" onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#4A4036]">Catalog Product</label>
                <select
                  value={newOrderForm.productId}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, productId: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  required
                >
                  <option value="">-- Select Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (${p.price?.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#4A4036]">Priority</label>
                  <select
                    value={newOrderForm.priority}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, priority: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  >
                    <option value="standard">Standard</option>
                    <option value="rush">Rush Order</option>
                    <option value="vip">VIP Commission</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#4A4036]">Lead Craftsman</label>
                  <input
                    type="text"
                    value={newOrderForm.leadCraftsman}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, leadCraftsman: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750]"
              >
                Create Order
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
