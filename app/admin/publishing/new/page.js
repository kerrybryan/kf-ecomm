'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Send,
  Image as ImageIcon,
  Sparkles,
  Layers,
  FileText,
  Calendar,
  Tag,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import { useToast } from '@/context/ToastContext';
import { substitutePlaceholders } from '@/lib/publishing';

export default function NewPublishingQueueItemPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [products, setProducts] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [mediaSource, setMediaSource] = useState('product'); // 'product' | 'custom'
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('instagram');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [finalCaption, setFinalCaption] = useState('');
  const [plannedDate, setPlannedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pRes, tRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/admin/publishing/templates'),
        ]);
        const [pJson, tJson] = await Promise.all([pRes.json(), tRes.json()]);

        if (pJson.success && pJson.data?.length > 0) {
          setProducts(pJson.data);
          const firstProd = pJson.data[0];
          setSelectedProductId(firstProd._id);
          setTitle(`Promote: ${firstProd.name}`);
          setCustomMediaUrl((firstProd.images && firstProd.images[0]) || '');
        }

        if (tJson.success && tJson.data?.length > 0) {
          setTemplates(tJson.data);
          setSelectedTemplateId(tJson.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update caption and media preview when product or template changes
  const activeProduct = products.find((p) => p._id === selectedProductId) || null;
  const activeTemplate = templates.find((t) => t._id === selectedTemplateId) || null;

  useEffect(() => {
    if (mediaSource === 'product' && activeProduct) {
      setTitle(`Promote: ${activeProduct.name}`);
      if (activeProduct.images && activeProduct.images[0]) {
        setCustomMediaUrl(activeProduct.images[0]);
      }
    }

    if (activeTemplate) {
      const rendered = substitutePlaceholders(
        activeTemplate.template,
        activeProduct || { name: title }
      );
      setFinalCaption(rendered);
      if (activeTemplate.platform && activeTemplate.platform !== 'general') {
        setPlatform(activeTemplate.platform);
      }
    }
  }, [selectedProductId, selectedTemplateId, mediaSource]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customMediaUrl.trim()) {
      addToast('Please select or provide a media URL', 'error');
      return;
    }
    if (!finalCaption.trim()) {
      addToast('Please provide a caption text', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/publishing/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: mediaSource === 'product' ? selectedProductId : null,
          title: title || (activeProduct ? activeProduct.name : 'Social Marketing Post'),
          mediaUrl: customMediaUrl.trim(),
          mediaType,
          platform,
          captionTemplateId: selectedTemplateId || null,
          customCaption: finalCaption.trim(),
          plannedDate: new Date(plannedDate),
          notes,
        }),
      });
      const json = await res.json();

      if (json.success) {
        addToast('Added to Publishing Queue!', 'success');
        router.push('/admin/publishing');
      } else {
        addToast(json.error || 'Failed to add to queue', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/publishing"
          className="p-2 bg-white rounded-xl border border-[#E5DDD3] hover:bg-[#FAF8F5] text-[#201C18] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#201C18]">
            Add Post to Publishing Queue
          </h1>
          <p className="text-xs text-[#6B6459] mt-0.5">
            Select a store design, apply a caption template, and plan your release date
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Media Selection */}
        <AdminCard title="1. Select Media & Product" subtitle="Choose a product photo from store inventory or enter a custom media link">
          <div className="space-y-4">
            {/* Source Toggle */}
            <div className="flex rounded-xl bg-[#FAF8F5] p-1 border border-[#E5DDD3] w-fit">
              <button
                type="button"
                onClick={() => setMediaSource('product')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaSource === 'product'
                    ? 'bg-white text-[#201C18] shadow-xs'
                    : 'text-[#6B6459]'
                }`}
              >
                Store Products
              </button>
              <button
                type="button"
                onClick={() => setMediaSource('custom')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mediaSource === 'custom'
                    ? 'bg-white text-[#201C18] shadow-xs'
                    : 'text-[#6B6459]'
                }`}
              >
                Custom Media Link / Upload
              </button>
            </div>

            {mediaSource === 'product' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Select Product
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                  >
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.price ? `${p.price.toLocaleString()} ETB` : 'Unpriced'})
                      </option>
                    ))}
                  </select>
                </div>

                {activeProduct && (
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] flex items-center gap-3">
                    <img
                      src={customMediaUrl || 'https://picsum.photos/80/80'}
                      alt={activeProduct.name}
                      className="w-14 h-14 rounded-lg object-cover bg-zinc-900 border border-[#E5DDD3]"
                    />
                    <div className="text-xs">
                      <p className="font-extrabold text-[#201C18] line-clamp-1">{activeProduct.name}</p>
                      <p className="text-[11px] font-bold text-[#B8551F]">
                        {activeProduct.price ? `${activeProduct.price.toLocaleString()} Birr` : 'Custom Price'}
                      </p>
                      <p className="text-[10px] text-[#6B6459]">{activeProduct.category}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Media URL (Image or Video)
                  </label>
                  <input
                    type="url"
                    required
                    value={customMediaUrl}
                    onChange={(e) => setCustomMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Media Type
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#201C18]"
                  >
                    <option value="image">Image (JPG, PNG)</option>
                    <option value="video">Video (MP4, Reel)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </AdminCard>

        {/* Step 2: Target Platform & Caption Template */}
        <AdminCard title="2. Platform & Caption" subtitle="Select target social channel and fill-in-the-blank caption">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Target Social Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                >
                  <option value="instagram">📸 Instagram</option>
                  <option value="facebook">📘 Facebook</option>
                  <option value="tiktok">🎵 TikTok</option>
                  <option value="pinterest">📌 Pinterest</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="general">🌐 General</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Apply Caption Template
                </label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
                >
                  <option value="">Custom Caption (No Template)</option>
                  {templates.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.platform})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#201C18]">
                  Final Caption Text <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-[#6B6459]">
                  Substituted automatically — edit freely before saving
                </span>
              </div>
              <textarea
                rows={5}
                required
                value={finalCaption}
                onChange={(e) => setFinalCaption(e.target.value)}
                placeholder="Write or review your final post caption..."
                className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Step 3: Planned Date & Submission */}
        <AdminCard title="3. Schedule Date" subtitle="When do you intend to post this content?">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Planned Date (Reminder)
              </label>
              <input
                type="date"
                required
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">
                Internal Notes (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Tag influencer partner"
                className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
              />
            </div>
          </div>
        </AdminCard>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/publishing"
            className="px-5 py-2.5 rounded-xl border border-[#E5DDD3] bg-white text-xs font-bold text-[#6B6459] hover:text-[#201C18]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            id="add-to-queue-submit-btn"
            className="px-6 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{submitting ? 'Adding...' : 'Save to Publishing Queue'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
