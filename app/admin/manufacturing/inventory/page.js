'use client';

import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Package,
  Layers,
  X,
  Edit2,
} from 'lucide-react';
import ManufacturingHeader from '@/components/admin/manufacturing/ManufacturingHeader';

export default function RawMaterialsInventoryPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    sku: '',
    category: 'timber',
    inStock: 100,
    unit: 'bdft',
    unitCost: 12,
    reorderThreshold: 20,
    supplier: 'Pacific Northwest Hardwoods',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/manufacturing/materials', window.location.origin);
      if (selectedCategory !== 'all') url.searchParams.set('category', selectedCategory);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setMaterials(data.data || []);
      }
    } catch (err) {
      console.error('Fetch materials error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, [selectedCategory]);

  const handleAdjustStock = async (id, delta) => {
    const item = materials.find((m) => m._id === id);
    if (!item) return;

    const newStock = Math.max(0, item.inStock + delta);
    try {
      const res = await fetch(`/api/admin/manufacturing/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock: newStock }),
      });
      if (res.ok) {
        setMaterials((prev) =>
          prev.map((m) => (m._id === id ? { ...m, inStock: newStock } : m))
        );
      }
    } catch (err) {
      console.error('Adjust stock error:', err);
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const res = await fetch('/api/admin/manufacturing/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add material');
      }

      setSuccessMsg('Raw material added to inventory catalog!');
      setShowAddModal(false);
      fetchMaterials();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error adding material');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <ManufacturingHeader
        title="Raw Materials Inventory"
        subtitle="Manage timber lumber, upholstery fabrics, brass hardware, and finishing oils."
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

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'timber', 'fabric', 'hardware', 'finish', 'foam'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                selectedCategory === cat
                  ? 'bg-[#1A1613] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Materials Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading inventory stock...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
              <tr>
                <th className="px-5 py-3.5">Material & SKU</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Stock Level</th>
                <th className="px-5 py-3.5">Unit Cost</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5DF]">
              {materials.map((mat) => {
                const isLow = mat.inStock <= mat.reorderThreshold;

                return (
                  <tr key={mat._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-[#1A1613]">{mat.name}</p>
                      <p className="text-[10px] font-mono text-[#A8875E]">{mat.sku}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold uppercase text-gray-700">
                        {mat.category}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#1A1613]">
                          {mat.inStock} {mat.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-medium text-[#4A4036]">
                      ${mat.unitCost} / {mat.unit}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-[#7C7265]">
                      {mat.supplier}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(mat._id, -5)}
                          className="w-7 h-7 rounded-lg border border-[#D5CCC2] text-xs font-bold hover:bg-gray-100 flex items-center justify-center"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(mat._id, 10)}
                          className="px-2.5 h-7 rounded-lg bg-[#FAF8F5] border border-[#A8875E] text-[#A8875E] text-xs font-bold hover:bg-[#A8875E] hover:text-white flex items-center justify-center transition-all"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Material Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddMaterial} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EBE5DF]">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <h3 className="text-sm font-bold text-[#1A1613]">Add Workshop Material</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#4A4036]">Material Name</label>
                <input
                  type="text"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="e.g. Solid European Walnut 8/4"
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#4A4036]">SKU</label>
                  <input
                    type="text"
                    value={newMaterial.sku}
                    onChange={(e) => setNewMaterial({ ...newMaterial, sku: e.target.value })}
                    placeholder="MAT-WALNUT"
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#4A4036]">Category</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  >
                    <option value="timber">Timber</option>
                    <option value="fabric">Fabric</option>
                    <option value="hardware">Hardware</option>
                    <option value="finish">Finish / Oil</option>
                    <option value="foam">Foam</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#4A4036]">Initial Stock</label>
                  <input
                    type="number"
                    value={newMaterial.inStock}
                    onChange={(e) => setNewMaterial({ ...newMaterial, inStock: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#4A4036]">Unit</label>
                  <input
                    type="text"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    placeholder="bdft, meters..."
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#4A4036]">Unit Cost ($)</label>
                  <input
                    type="number"
                    value={newMaterial.unitCost}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unitCost: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750]"
              >
                Save Material
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
