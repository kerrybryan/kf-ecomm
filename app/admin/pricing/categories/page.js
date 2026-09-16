'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  Calculator,
  Hammer,
  Clock,
  Percent,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function CategoryPricingTemplatesPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [availableMaterials, setAvailableMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    materialInputs: [],
    laborHoursDefault: 12,
    laborRatePerHour: 250,
    overheadPercentDefault: 15,
    markupMultiplierDefault: 2.0,
  });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, mRes] = await Promise.all([
        fetch('/api/admin/pricing/categories'),
        fetch('/api/admin/pricing/materials'),
      ]);
      const tJson = await tRes.json();
      const mJson = await mRes.json();

      if (tJson.success) setTemplates(tJson.data || []);
      if (mJson.success) setAvailableMaterials(mJson.data || []);
    } catch (err) {
      console.error('Failed to load templates:', err);
      addToast('Failed to load category templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      category: '',
      description: '',
      materialInputs: [
        { materialName: availableMaterials[0]?.materialName || 'Solid Hardwood (Oak / Walnut / Wanza)', unitLabel: 'meters', defaultQuantity: 5, helpText: 'Main frame' },
      ],
      laborHoursDefault: 12,
      laborRatePerHour: 250,
      overheadPercentDefault: 15,
      markupMultiplierDefault: 2.0,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t._id);
    setFormData({
      category: t.category,
      description: t.description || '',
      materialInputs: t.materialInputs?.length ? [...t.materialInputs] : [],
      laborHoursDefault: t.laborHoursDefault || 10,
      laborRatePerHour: t.laborRatePerHour || 250,
      overheadPercentDefault: t.overheadPercentDefault || 15,
      markupMultiplierDefault: t.markupMultiplierDefault || 2.0,
    });
    setShowModal(true);
  };

  const handleAddMaterialRow = () => {
    const firstMat = availableMaterials[0]?.materialName || 'Solid Hardwood (Oak / Walnut / Wanza)';
    setFormData({
      ...formData,
      materialInputs: [
        ...formData.materialInputs,
        { materialName: firstMat, unitLabel: 'units', defaultQuantity: 1, helpText: '' },
      ],
    });
  };

  const handleRemoveMaterialRow = (index) => {
    const updated = formData.materialInputs.filter((_, i) => i !== index);
    setFormData({ ...formData, materialInputs: updated });
  };

  const handleMaterialRowChange = (index, field, value) => {
    const updated = [...formData.materialInputs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, materialInputs: updated });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.category.trim()) {
      addToast('Category name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/pricing/categories/${editingId}`
        : '/api/admin/pricing/categories';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        addToast(editingId ? 'Category template updated' : 'Category template created', 'success');
        setShowModal(false);
        fetchData();
      } else {
        addToast(json.error || 'Failed to save category template', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete template for "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/pricing/categories/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        addToast('Template deleted', 'success');
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      } else {
        addToast(json.error || 'Delete failed', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#D99A2B]" />
            <span className="text-[11px] font-bold text-[#D99A2B] uppercase tracking-wider">
              PRICING ENGINE · FORMULAS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#201C18] tracking-tight">
            Category Pricing Templates
          </h1>
          <p className="text-xs text-[#6B6459] mt-1">
            Define what materials and labor each furniture category requires. A sofa differs from a cabinet differs from a chair.
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
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Category Template</span>
          </button>
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-white rounded-2xl border-2 border-[#E5DDD3] p-6 animate-pulse" />
          ))
        ) : templates.length === 0 ? (
          <div className="col-span-full py-16 bg-white rounded-2xl border-2 border-dashed border-[#E5DDD3] text-center text-[#6B6459]">
            No category templates found.
          </div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl._id}
              className="bg-white rounded-2xl border-2 border-[#E5DDD3] hover:border-[#B8551F] transition-all duration-300 p-6 flex flex-col justify-between shadow-xs hover:shadow-md"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-extrabold text-[#201C18] tracking-tight">
                      {tpl.category}
                    </h3>
                    <p className="text-[11px] text-[#6B6459] mt-0.5 font-normal">
                      {tpl.description || 'Standard category formula'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(tpl)}
                      className="p-1.5 text-[#6B6459] hover:text-[#B8551F] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(tpl._id, tpl.category)}
                      className="p-1.5 text-[#6B6459] hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Materials Breakdown */}
                <div className="space-y-1.5 my-4 bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DDD3]">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6459] mb-1">
                    Required Materials ({tpl.materialInputs?.length || 0})
                  </p>
                  {tpl.materialInputs?.slice(0, 4).map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-[#201C18]">
                      <span className="truncate pr-2 font-medium">{m.materialName}</span>
                      <span className="font-extrabold text-[#B8551F] shrink-0">
                        {m.defaultQuantity} {m.unitLabel || 'units'}
                      </span>
                    </div>
                  ))}
                  {tpl.materialInputs?.length > 4 && (
                    <p className="text-[10px] text-[#6B6459] italic pt-1">
                      +{tpl.materialInputs.length - 4} more materials...
                    </p>
                  )}
                </div>

                {/* Formula Multipliers */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <p className="text-[10px] text-[#6B6459] uppercase font-bold">Labor</p>
                    <p className="font-extrabold text-[#201C18] mt-0.5">{tpl.laborHoursDefault}h</p>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <p className="text-[10px] text-[#6B6459] uppercase font-bold">Overhead</p>
                    <p className="font-extrabold text-[#201C18] mt-0.5">{tpl.overheadPercentDefault}%</p>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-xl border border-stone-200">
                    <p className="text-[10px] text-[#6B6459] uppercase font-bold">Markup</p>
                    <p className="font-extrabold text-[#D99A2B] mt-0.5">{tpl.markupMultiplierDefault}x</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-[#E5DDD3]">
                <Link
                  href={`/admin/pricing/calculate?category=${encodeURIComponent(tpl.category)}`}
                  className="w-full bg-[#201C18] hover:bg-[#B8551F] text-white py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Price a {tpl.category.split(' ')[0]}</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] shadow-2xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DDD3] mb-5">
              <h3 className="text-base font-extrabold text-[#201C18]">
                {editingId ? `Edit ${formData.category} Formula` : 'Create Category Pricing Template'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 text-[#6B6459] hover:text-[#201C18]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wardrobes, Office Desks, Armchairs"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Description / Scope
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Standard wooden and upholstered items"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>
              </div>

              {/* Material Inputs Section */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
                    Raw Materials Needed ({formData.materialInputs.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddMaterialRow}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#B8551F] hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Material Row</span>
                  </button>
                </div>

                {formData.materialInputs.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-xl border border-[#E5DDD3]">
                    <div className="col-span-5">
                      <select
                        value={row.materialName}
                        onChange={(e) => handleMaterialRowChange(idx, 'materialName', e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#201C18] focus:outline-none cursor-pointer"
                      >
                        {availableMaterials.map((m) => (
                          <option key={m._id} value={m.materialName}>
                            {m.materialName} ({m.costPerUnit} Birr/{m.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Default Qty"
                        value={row.defaultQuantity}
                        onChange={(e) => handleMaterialRowChange(idx, 'defaultQuantity', Number(e.target.value))}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#201C18]"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="Help text (e.g. Frame)"
                        value={row.helpText}
                        onChange={(e) => handleMaterialRowChange(idx, 'helpText', e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg px-2.5 py-1.5 text-xs text-[#201C18]"
                      />
                    </div>

                    <div className="col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialRow(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Labor & Multipliers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-[#201C18] mb-1">
                    Default Labor (Hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.laborHoursDefault}
                    onChange={(e) => setFormData({ ...formData, laborHoursDefault: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#201C18] mb-1">
                    Labor Rate (Birr/hr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={formData.laborRatePerHour}
                    onChange={(e) => setFormData({ ...formData, laborRatePerHour: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#201C18] mb-1">
                    Overhead (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={formData.overheadPercentDefault}
                    onChange={(e) => setFormData({ ...formData, overheadPercentDefault: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#201C18] mb-1">
                    Markup Multiplier
                  </label>
                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={formData.markupMultiplierDefault}
                    onChange={(e) => setFormData({ ...formData, markupMultiplierDefault: Number(e.target.value) })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-extrabold text-[#D99A2B]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5DDD3]">
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
                  {saving ? 'Saving...' : editingId ? 'Update Template' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
