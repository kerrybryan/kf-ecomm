'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Check,
  X,
  Layers,
  ArrowRight,
  Calculator,
  Hammer,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import { useToast } from '@/context/ToastContext';

export default function MaterialRatesPage() {
  const { addToast } = useToast();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    materialName: '',
    unit: 'meter',
    costPerUnit: '',
    categoryTag: 'Wood',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchMaterials = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/pricing/materials');
      const json = await res.json();
      if (json.success) {
        setMaterials(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load materials:', err);
      addToast('Failed to load raw materials', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      materialName: '',
      unit: 'meter',
      costPerUnit: '',
      categoryTag: 'Wood',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      materialName: item.materialName,
      unit: item.unit,
      costPerUnit: item.costPerUnit,
      categoryTag: item.categoryTag || 'General',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.materialName || !formData.costPerUnit) {
      addToast('Please provide a name and unit cost', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/pricing/materials/${editingId}`
        : '/api/admin/pricing/materials';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        addToast(editingId ? 'Material rate updated' : 'New material added', 'success');
        setShowModal(false);
        fetchMaterials();
      } else {
        addToast(json.error || 'Failed to save material', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? Formulas using it will need updating.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/pricing/materials/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        addToast('Material rate deleted', 'success');
        setMaterials((prev) => prev.filter((m) => m._id !== id));
      } else {
        addToast(json.error || 'Delete failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const categories = ['ALL', ...new Set(materials.map((m) => m.categoryTag || 'General'))];

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.materialName.toLowerCase().includes(search.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || (m.categoryTag || 'General') === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8551F]" />
            <span className="text-[11px] font-bold text-[#B8551F] uppercase tracking-wider">
              PRICING ENGINE · MASTER RATES
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#201C18] tracking-tight">
            Raw Material Rates
          </h1>
          <p className="text-xs text-[#6B6459] mt-1">
            Single source of truth for raw material costs in Birr. Updating a rate here immediately updates all category pricing formulas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/pricing/calculate"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-[#FAF8F5] border-2 border-[#E5DDD3] rounded-xl text-xs font-bold text-[#201C18] transition-all shadow-xs"
          >
            <Calculator className="w-4 h-4 text-[#B8551F]" />
            <span>Open Calculator</span>
          </Link>

          <button
            onClick={handleOpenAdd}
            id="add-material-btn"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Material</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Strip */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#E5DDD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search material or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-2.5 pl-10 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
          />
          <Search className="w-4 h-4 text-[#6B6459] absolute left-3.5 top-3" />
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                categoryFilter === cat
                  ? 'bg-[#201C18] text-white'
                  : 'bg-[#FAF8F5] text-[#6B6459] hover:text-[#201C18] border border-[#E5DDD3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b-2 border-[#E5DDD3] text-[#6B6459] text-[11px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Material Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Unit of Measure</th>
                <th className="px-6 py-4">Cost Per Unit (Birr)</th>
                <th className="px-6 py-4">Notes / Supplier</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5DDD3]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-[#FAF8F5] rounded w-3/4" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#6B6459]">
                    No material rates found. Click "Add Material" to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => (
                  <tr
                    key={item._id}
                    className={`hover:bg-[#FAF8F5] transition-colors ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-[#FAF8F5]/40'
                    }`}
                  >
                    <td className="px-6 py-4 font-bold text-[#201C18]">
                      {item.materialName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#FAF8F5] border border-[#E5DDD3] text-[#6B6459]">
                        {item.categoryTag || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#6B6459] capitalize">
                      per {item.unit}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-extrabold text-[#B8551F] text-sm">
                        {item.costPerUnit?.toLocaleString()} Birr
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6B6459] text-[11px] max-w-xs truncate">
                      {item.notes || '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#6B6459] hover:text-[#B8551F] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                          title="Edit Rate"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.materialName)}
                          className="p-1.5 text-[#6B6459] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Rate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DDD3] mb-5">
              <h3 className="text-base font-extrabold text-[#201C18]">
                {editingId ? 'Edit Material Rate' : 'Add Raw Material Rate'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-[#6B6459] hover:text-[#201C18] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solid Walnut Timber, Velvet Fabric"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Unit of Measure *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                  >
                    <option value="meter">meter</option>
                    <option value="sq meter">sq meter</option>
                    <option value="kg">kg</option>
                    <option value="unit">unit</option>
                    <option value="pair">pair</option>
                    <option value="liter">liter</option>
                    <option value="set">set</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Cost Per Unit (Birr) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="1800"
                    value={formData.costPerUnit}
                    onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs text-[#201C18] font-bold focus:outline-none focus:border-[#B8551F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Material Classification
                </label>
                <select
                  value={formData.categoryTag}
                  onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                >
                  <option value="Wood">Wood & Timber</option>
                  <option value="Wood Panels">Wood Panels (MDF / Plywood)</option>
                  <option value="Fabric">Fabric & Upholstery</option>
                  <option value="Leather">Leather</option>
                  <option value="Foam">Foam & Padding</option>
                  <option value="Hardware">Hardware & Fasteners</option>
                  <option value="Metal">Metal & Steel</option>
                  <option value="Glass">Glass & Stone</option>
                  <option value="Finish">Paints & Finishes</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Notes / Supplier Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Merkato Wood Market, Batch #4"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-[#6B6459] hover:text-[#201C18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Rate' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
