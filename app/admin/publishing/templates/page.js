'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle2,
  Sparkles,
  Layers,
  Info,
  Tag,
  Copy,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import { useToast } from '@/context/ToastContext';

const PLATFORMS = [
  { id: 'all', name: 'All Templates' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'tiktok', name: 'TikTok', color: '#000000' },
  { id: 'pinterest', name: 'Pinterest', color: '#BD081C' },
  { id: 'whatsapp', name: 'WhatsApp', color: '#25D366' },
  { id: 'general', name: 'General', color: '#B8551F' },
];

const PLACEHOLDERS = [
  { tag: '{productName}', label: 'Product Name', sample: 'Haven Bouclé Lounge Sofa' },
  { tag: '{category}', label: 'Category', sample: 'Living Room' },
  { tag: '{materials}', label: 'Materials', sample: 'Solid Hardwood, Textured Bouclé' },
  { tag: '{price}', label: 'Price (Birr)', sample: '68,000' },
  { tag: '{description}', label: 'Description', sample: 'Handmade solid wood frame with deep soft cushioning.' },
];

export default function CaptionTemplatesPage() {
  const { addToast } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePlatform, setActivePlatform] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    platform: 'instagram',
    template: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef(null);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/publishing/templates');
      const json = await res.json();
      if (json.success) {
        setTemplates(json.data || []);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
      addToast('Failed to load caption templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: '',
      platform: activePlatform !== 'all' ? activePlatform : 'instagram',
      template: '✨ New in store: {productName}! Made of {materials}. Price: {price} Birr. Free Addis delivery. #KBFurniture',
      description: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t._id);
    setFormData({
      name: t.name,
      platform: t.platform || 'general',
      template: t.template,
      description: t.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this caption template?')) return;
    try {
      const res = await fetch(`/api/admin/publishing/templates/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        addToast('Template deleted', 'success');
        setTemplates((prev) => prev.filter((t) => t._id !== id));
      } else {
        addToast(json.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleInsertPlaceholder = (tag) => {
    const el = textareaRef.current;
    if (!el) {
      setFormData((prev) => ({ ...prev, template: prev.template + tag }));
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = formData.template;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + tag + after;
    setFormData((prev) => ({ ...prev, template: newText }));
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + tag.length, start + tag.length);
    }, 50);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.template.trim()) {
      addToast('Name and template formula are required', 'error');
      return;
    }

    setSaving(true);
    try {
      const url = editingId
        ? `/api/admin/publishing/templates/${editingId}`
        : '/api/admin/publishing/templates';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const json = await res.json();

      if (json.success) {
        addToast(editingId ? 'Template updated!' : 'Template created!', 'success');
        setShowModal(false);
        fetchTemplates();
      } else {
        addToast(json.error || 'Failed to save template', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const filteredTemplates = templates.filter(
    (t) => activePlatform === 'all' || t.platform === activePlatform
  );

  // Compute live sample preview for the modal
  const samplePreview = formData.template
    .replace(/\{productName\}/gi, 'Haven Bouclé Lounge Sofa')
    .replace(/\{category\}/gi, 'Living Room')
    .replace(/\{materials\}/gi, 'Solid European Oak, Textured Bouclé')
    .replace(/\{price\}/gi, '68,000')
    .replace(/\{description\}/gi, 'Handmade solid wood frame with deep soft cushioning.');

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/publishing"
            className="p-2 bg-white rounded-xl border border-[#E5DDD3] hover:bg-[#FAF8F5] text-[#201C18] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#201C18]">
              Caption Templates
            </h1>
            <p className="text-xs text-[#6B6459] mt-0.5">
              Write fill-in-the-blank social captions with auto-substituting product tags
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            id="add-template-btn"
            className="px-4 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Template</span>
          </button>
        </div>
      </div>

      {/* Platform Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {PLATFORMS.map((p) => {
          const count =
            p.id === 'all'
              ? templates.length
              : templates.filter((t) => t.platform === p.id).length;
          return (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                activePlatform === p.id
                  ? 'bg-[#201C18] text-white shadow-xs'
                  : 'bg-white text-[#6B6459] border border-[#E5DDD3] hover:text-[#201C18]'
              }`}
            >
              <span>{p.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activePlatform === p.id
                    ? 'bg-white/20 text-white'
                    : 'bg-[#FAF8F5] text-[#6B6459]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-bold text-[#6B6459]">
          Loading caption templates...
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-[#A8875E] mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-[#201C18]">No caption templates found</h3>
          <p className="text-xs text-[#6B6459] max-w-sm mx-auto">
            Create reusable caption formulas with placeholders like {'{productName}'} and {'{price}'}.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#201C18] text-white text-xs font-bold rounded-xl"
          >
            Create Starter Template
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTemplates.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border-2 border-[#E5DDD3] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#B8551F]/60 transition-all group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#FAF8F5] border border-[#E5DDD3] text-[#201C18]">
                    {t.platform || 'general'}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(t)}
                      className="p-1.5 text-[#6B6459] hover:text-[#B8551F] hover:bg-[#FAF8F5] rounded-lg"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-1.5 text-[#6B6459] hover:text-rose-500 hover:bg-[#FAF8F5] rounded-lg"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-[#201C18]">{t.name}</h3>
                {t.description && (
                  <p className="text-[11px] text-[#6B6459] line-clamp-1">{t.description}</p>
                )}

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] font-mono text-[11px] text-[#201C18] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {t.template}
                </div>
              </div>

              <div className="pt-2 border-t border-[#E5DDD3] flex items-center justify-between text-[11px] text-[#6B6459]">
                <span>Updated {new Date(t.updatedAt || t.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => handleOpenEdit(t)}
                  className="text-xs font-bold text-[#B8551F] hover:underline"
                >
                  Edit Template →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#E5DDD3] shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#201C18] flex items-center justify-center text-white">
                  <FileText className="w-4 h-4 text-[#D99A2B]" />
                </div>
                <h3 className="text-base font-extrabold text-[#201C18]">
                  {editingId ? 'Edit Caption Template' : 'New Caption Template'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[#6B6459] hover:text-[#201C18]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. New Arrival Announcement"
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs font-medium text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Target Platform <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="general">General / All Platforms</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Usage Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. For launching brand new living room pieces"
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
              </div>

              {/* Clickable Placeholders Toolbar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#201C18]">
                    Caption Template Formula <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#6B6459] italic">
                    Click any tag below to insert at cursor
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 p-2 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3]">
                  {PLACEHOLDERS.map((p) => (
                    <button
                      key={p.tag}
                      type="button"
                      onClick={() => handleInsertPlaceholder(p.tag)}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-[#EAE1D2] border border-[#E5DDD3] text-[11px] font-mono font-bold text-[#B8551F] transition-colors cursor-pointer"
                      title={`Substitutes with sample: "${p.sample}"`}
                    >
                      + {p.tag}
                    </button>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  rows={5}
                  required
                  value={formData.template}
                  onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                  placeholder="Write your template with {productName}, {materials}, and {price}..."
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3 text-xs font-mono text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DDD3] space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6B6459] block">
                  Live Preview with Sample Product:
                </span>
                <p className="text-xs text-[#201C18] whitespace-pre-wrap leading-relaxed">
                  {samplePreview}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6B6459] hover:text-[#201C18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  id="save-template-btn"
                  className="px-5 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
