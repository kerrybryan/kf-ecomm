'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Upload,
  ArrowLeft,
  Link as LinkIcon,
  Tag,
  FileText,
  Calculator,
  Sparkles,
  ArrowRight,
  ImageIcon,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function NewSourcedItemPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sofas & Couches',
    sourceImageUrl: '',
    sourceUrl: '',
    notes: '',
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/admin/pricing/categories');
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setCategories(json.data);
          setFormData((prev) => ({ ...prev, category: json.data[0].category }));
        }
      } catch (e) {
        console.error('Failed to load categories', e);
      }
    }
    loadCategories();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
      setFormData((prev) => ({ ...prev, sourceImageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (url) => {
    setFormData((prev) => ({ ...prev, sourceImageUrl: url, sourceUrl: url }));
    setPreviewUrl(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.sourceImageUrl) {
      addToast('Please provide an image file or URL', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/source-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageInput: formData.sourceImageUrl,
          sourceUrl: formData.sourceUrl,
          name: formData.name || 'Untitled Sourced Piece',
          category: formData.category,
          notes: formData.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        addToast('Inspiration piece imported! Redirecting to Pricing Engine...', 'success');
        // Route straight to Pricing Calculator
        router.push(
          `/admin/pricing/calculate?sourceItemId=${json.data._id}&category=${encodeURIComponent(
            json.data.category
          )}`
        );
      } else {
        addToast(json.error || 'Failed to import piece', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/source-studio"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#6B6459] hover:text-[#201C18] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sourced Pieces</span>
        </Link>
      </div>

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#B8551F]" />
          <span className="text-[11px] font-bold text-[#B8551F] uppercase tracking-wider">
            SOURCE STUDIO · STEP 1
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-[#201C18] tracking-tight">
          Import Sourced Furniture Inspiration
        </h1>
        <p className="text-xs text-[#6B6459] mt-1">
          Upload an inspiration image or paste a reference URL. Tag its category, then proceed directly to the Category Pricing Calculator to calculate real craft costs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left: Image / Video Upload & Preview */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
              Inspiration Image / Video
            </h3>

            {previewUrl ? (
              <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-[#FAF8F5] border border-[#E5DDD3]">
                <img
                  src={previewUrl}
                  alt="Inspiration Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPreviewUrl('');
                    setFormData((prev) => ({ ...prev, sourceImageUrl: '' }));
                  }}
                  className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md"
                >
                  Change Image
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-[#E5DDD3] hover:border-[#B8551F] bg-[#FAF8F5] rounded-xl aspect-4/3 flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors group">
                <Upload className="w-8 h-8 text-[#6B6459] group-hover:text-[#B8551F] mb-2 transition-colors" />
                <span className="text-xs font-bold text-[#201C18]">
                  Click to upload image or video
                </span>
                <span className="text-[10px] text-[#6B6459] mt-1">
                  JPG, PNG, WebP or MP4 up to 50MB
                </span>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            <div className="pt-2">
              <label className="block text-[11px] font-bold text-[#201C18] mb-1">
                Or Paste Image/Web URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://pinterest.com/pin/... or https://..."
                  value={formData.sourceUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 pl-9 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
                <LinkIcon className="w-3.5 h-3.5 text-[#6B6459] absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Metadata & Category Tagging */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-6 border-2 border-[#E5DDD3] shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
              Piece Details & Category
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Design / Reference Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Minimalist Oak 3-Seater Sofa, Fluted Sideboard"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-2.5 text-xs text-[#201C18] font-bold focus:outline-none focus:border-[#B8551F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Furniture Category * (Determines Pricing Formula)
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-4 py-2.5 text-xs text-[#201C18] font-bold focus:outline-none focus:border-[#B8551F] cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c._id} value={c.category}>
                      {c.category}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Sofas & Couches">Sofas & Couches</option>
                    <option value="Cabinets & Credenzas">Cabinets & Credenzas</option>
                    <option value="Dining Tables">Dining Tables</option>
                    <option value="Dining Chairs">Dining Chairs</option>
                    <option value="Beds & Headboards">Beds & Headboards</option>
                    <option value="Interior Doors">Interior Doors</option>
                    <option value="Coffee Tables">Coffee Tables</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Workshop / Sourcing Notes
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Seen on Instagram. Client requested solid walnut with green velvet fabric. Will need 2 hinges and custom steel legs."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] resize-none"
              />
            </div>

            {/* Next Step Banner */}
            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5DDD3] flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#B8551F]/10 flex items-center justify-center shrink-0">
                <Calculator className="w-4 h-4 text-[#B8551F]" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-[#201C18]">Next: Pricing Calculator</p>
                <p className="text-[#6B6459] text-[11px]">
                  Saving this piece will load the <strong>{formData.category}</strong> formula to calculate material costs and set markup.
                </p>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={submitting}
                id="submit-sourced-item"
                className="w-full bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] cursor-pointer"
              >
                {submitting ? (
                  <span>Saving & Redirecting...</span>
                ) : (
                  <>
                    <span>Proceed to Pricing Calculator</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
