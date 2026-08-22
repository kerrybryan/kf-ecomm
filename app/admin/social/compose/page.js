'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import {
  PenSquare,
  Sparkles,
  Send,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Package,
  UploadCloud,
  Layers,
  Wand2,
  Video,
  FileImage,
} from 'lucide-react';
import SocialHeader from '@/components/admin/social/SocialHeader';
import PlatformPreviewCards from '@/components/admin/social/PlatformPreviewCards';

const PLATFORM_OPTIONS = [
  { id: 'instagram', name: 'Instagram', color: 'text-pink-600', border: 'border-pink-300' },
  { id: 'pinterest', name: 'Pinterest', color: 'text-red-600', border: 'border-red-300' },
  { id: 'facebook', name: 'Facebook', color: 'text-blue-600', border: 'border-blue-300' },
  { id: 'tiktok', name: 'TikTok', color: 'text-gray-900', border: 'border-gray-400' },
];

function SocialComposerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProductId = searchParams.get('productId');

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video'
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['instagram', 'pinterest']);

  // Captions
  const [activeCaptionTab, setActiveCaptionTab] = useState('default');
  const [captions, setCaptions] = useState({
    default: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    pinterest: '',
  });

  // AI Caption Generator State
  const [aiTone, setAiTone] = useState('modern'); // 'elegant' | 'modern' | 'sales'
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedOptions, setGeneratedOptions] = useState([]);

  // Scheduling State
  const [publishMode, setPublishMode] = useState('now'); // 'now' | 'schedule' | 'draft'
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Fetch Products for quick selector
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/admin/products?limit=30');
        const json = await res.json();
        if (json.success && json.data) {
          setProducts(json.data);
          if (initialProductId) {
            const match = json.data.find((p) => p._id === initialProductId);
            if (match) handleSelectProduct(match);
          } else if (json.data.length > 0 && !mediaUrl) {
            handleSelectProduct(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    fetchCatalog();
  }, [initialProductId]);

  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    const img = prod.images?.[0] || 'https://picsum.photos/seed/nordika-sofa/800/800';
    setMediaUrl(img);

    // Initial default caption
    const defaultText = `Introducing the ${prod.name} — handcrafted from ${
      prod.materials?.join(', ') || 'solid European timber'
    }. Starting at $${prod.price?.toLocaleString()}.\n\nExplore our bespoke Scandinavian collection online at Nordika Studio. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #NordikaStudio`;

    setCaptions((prev) => ({
      ...prev,
      default: defaultText,
      instagram: defaultText,
      pinterest: defaultText,
      facebook: defaultText,
      tiktok: defaultText,
    }));
  };

  const handlePlatformToggle = (platformId) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const handleCaptionChange = (text) => {
    setCaptions((prev) => ({
      ...prev,
      [activeCaptionTab]: text,
      ...(activeCaptionTab === 'default'
        ? {
            instagram: prev.instagram === prev.default || !prev.instagram ? text : prev.instagram,
            facebook: prev.facebook === prev.default || !prev.facebook ? text : prev.facebook,
            tiktok: prev.tiktok === prev.default || !prev.tiktok ? text : prev.tiktok,
            pinterest: prev.pinterest === prev.default || !prev.pinterest ? text : prev.pinterest,
          }
        : {}),
    }));
  };

  // Generate AI Captions with Claude
  const handleGenerateCaptions = async () => {
    try {
      setIsGeneratingAi(true);
      setErrorMsg('');

      const res = await fetch('/api/admin/social/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: selectedProduct?.name || 'Nordika Studio Furniture Piece',
          category: selectedProduct?.category || 'living-room',
          materials: selectedProduct?.materials || ['Solid European Oak', 'Bouclé'],
          price: selectedProduct?.price || 950,
          tone: aiTone,
          customPrompt: aiCustomPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate captions');
      }

      setGeneratedOptions(data.data || []);
    } catch (err) {
      setErrorMsg(err.message || 'AI Caption generator error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleApplyGeneratedCaption = (optionCaption) => {
    handleCaptionChange(optionCaption);
    setSuccessMsg('Applied AI caption to composer!');
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // Publish / Schedule / Save Draft
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!mediaUrl) {
      setErrorMsg('Please select or upload media for this post');
      return;
    }
    if (selectedPlatforms.length === 0) {
      setErrorMsg('Please select at least one platform to publish to');
      return;
    }
    if (publishMode === 'schedule' && !scheduledDateTime) {
      setErrorMsg('Please choose a valid schedule date and time');
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch('/api/admin/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?._id || undefined,
          mediaUrl,
          mediaType,
          platforms: selectedPlatforms,
          captions,
          scheduledFor: publishMode === 'schedule' ? scheduledDateTime : null,
          isDraft: publishMode === 'draft',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Publish action failed');
      }

      setSuccessMsg(data.message || 'Post processed successfully!');
      setTimeout(() => {
        if (publishMode === 'schedule') {
          router.push('/admin/social/queue');
        } else if (publishMode === 'draft') {
          router.push('/admin/social/queue');
        } else {
          router.push('/admin/social/history');
        }
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SocialHeader
        title="Content Composer"
        subtitle="Create, AI-caption, preview, and publish multi-platform Nordic furniture posts."
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

      {/* Two-Column Composer Grid */}
      <form onSubmit={handlePublishSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Composer Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Media Source & Product Picker */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#A8875E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                  1. Select Catalog Product or Upload Media
                </h3>
              </div>
              <span className="text-[11px] text-[#7C7265]">Image Studio Branded Assets</span>
            </div>

            {/* Product Dropdown Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#4A4036]">Link Catalog Product (Optional)</label>
              <select
                value={selectedProduct?._id || ''}
                onChange={(e) => {
                  const match = products.find((p) => p._id === e.target.value);
                  if (match) handleSelectProduct(match);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
              >
                <option value="">-- Standalone Custom Media (No Product Link) --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (${p.price?.toLocaleString()} • {p.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Media URL / Upload Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#4A4036]">Media Asset URL</label>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMediaType('image')}
                    className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                      mediaType === 'image' ? 'bg-[#A8875E] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Image (1:1 / 4:5)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaType('video')}
                    className={`px-2.5 py-0.5 rounded font-bold transition-all ${
                      mediaType === 'video' ? 'bg-[#A8875E] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Video / Reel (9:16)
                  </button>
                </div>
              </div>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://picsum.photos/... or Cloudinary URL"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
              />
            </div>
          </div>

          {/* 2. Target Platform Selection */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#A8875E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                  2. Select Target Social Channels
                </h3>
              </div>
              <span className="text-[11px] text-[#7C7265]">Multi-channel publishing</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PLATFORM_OPTIONS.map((plat) => {
                const isSelected = selectedPlatforms.includes(plat.id);
                return (
                  <button
                    key={plat.id}
                    type="button"
                    onClick={() => handlePlatformToggle(plat.id)}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
                        : 'border-[#EBE5DF] bg-white opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className={`text-xs font-bold ${plat.color}`}>{plat.name}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-[#A8875E] w-3.5 h-3.5 pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. AI Caption Generator & Editor */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A8875E]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                  3. Captions & Claude AI Generator
                </h3>
              </div>
              <span className="text-[10px] font-bold text-[#A8875E] bg-[#A8875E]/10 px-2 py-0.5 rounded">
                AI Vision & Copywriter
              </span>
            </div>

            {/* AI Generator Controls */}
            <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#EBE5DF] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1A1613]">Tone:</span>
                  <select
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                    className="bg-white border border-[#D5CCC2] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#1A1613] focus:outline-none"
                  >
                    <option value="elegant">Elegant & Poetic (Luxury Brand)</option>
                    <option value="modern">Modern & Organic (Everyday Inspo)</option>
                    <option value="sales">Sales & Drop Announcement (Direct Response)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateCaptions}
                  disabled={isGeneratingAi}
                  className="px-4 py-1.5 rounded-lg bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isGeneratingAi ? 'Generating Variations...' : 'Generate 3 AI Options'}
                </button>
              </div>

              {/* AI Generated Options Carousel/List */}
              {generatedOptions.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[#EBE5DF]">
                  <p className="text-[11px] font-bold text-[#7C7265] uppercase tracking-wider">
                    Click to apply any generated caption:
                  </p>
                  <div className="space-y-2">
                    {generatedOptions.map((opt) => (
                      <div
                        key={opt.id}
                        onClick={() => handleApplyGeneratedCaption(opt.caption)}
                        className="p-3 bg-white rounded-xl border border-[#D5CCC2] hover:border-[#A8875E] text-xs transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-[#A8875E] text-[11px] uppercase tracking-wider">
                            {opt.title}
                          </span>
                          <span className="text-[10px] font-bold text-[#A8875E] opacity-0 group-hover:opacity-100 transition-opacity">
                            Use this caption →
                          </span>
                        </div>
                        <p className="text-[#4A4036] line-clamp-3 leading-relaxed whitespace-pre-line">
                          {opt.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Caption Platform Tabs */}
            <div className="space-y-2">
              <div className="flex items-center gap-1 border-b border-[#EBE5DF] overflow-x-auto pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveCaptionTab('default')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    activeCaptionTab === 'default'
                      ? 'bg-[#1A1613] text-white'
                      : 'text-[#7C7265] hover:text-[#1A1613]'
                  }`}
                >
                  Default (All)
                </button>
                {selectedPlatforms.map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setActiveCaptionTab(plat)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all ${
                      activeCaptionTab === plat
                        ? 'bg-[#A8875E] text-white'
                        : 'text-[#7C7265] hover:text-[#1A1613]'
                    }`}
                  >
                    {plat} Override
                  </button>
                ))}
              </div>

              <textarea
                rows={6}
                value={captions[activeCaptionTab] || ''}
                onChange={(e) => handleCaptionChange(e.target.value)}
                placeholder="Write or generate your engaging social caption with hashtags..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-xs leading-relaxed text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
              />
              <div className="flex justify-between text-[11px] text-[#7C7265]">
                <span>
                  Editing:{' '}
                  <strong className="capitalize">{activeCaptionTab}</strong>
                </span>
                <span>{(captions[activeCaptionTab] || '').length} characters</span>
              </div>
            </div>
          </div>

          {/* 4. Scheduling & Submission Footer */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Mode Selectors */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPublishMode('now')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    publishMode === 'now'
                      ? 'bg-[#1A1613] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Post Now
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('schedule')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    publishMode === 'schedule'
                      ? 'bg-[#A8875E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Schedule for Later
                </button>
                <button
                  type="button"
                  onClick={() => setPublishMode('draft')}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold text-[#7C7265] hover:bg-gray-100`}
                >
                  Save as Draft
                </button>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {isSubmitting
                  ? 'Processing...'
                  : publishMode === 'schedule'
                  ? 'Queue Scheduled Post'
                  : publishMode === 'draft'
                  ? 'Save Draft'
                  : 'Publish Across Channels Now'}
              </button>
            </div>

            {/* Datetime Picker if in schedule mode */}
            {publishMode === 'schedule' && (
              <div className="pt-3 border-t border-[#EBE5DF] flex items-center gap-3">
                <label className="text-xs font-semibold text-[#4A4036]">Schedule Date & Time:</label>
                <input
                  type="datetime-local"
                  value={scheduledDateTime}
                  onChange={(e) => setScheduledDateTime(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-[#D5CCC2] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Platform Mockup Previews */}
        <div className="lg:col-span-5 space-y-4">
          <PlatformPreviewCards
            mediaUrl={mediaUrl}
            mediaType={mediaType}
            captions={captions}
            selectedPlatforms={selectedPlatforms}
            product={selectedProduct}
          />
        </div>
      </form>
    </div>
  );
}

export default function SocialComposerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading Content Composer...
        </div>
      }
    >
      <SocialComposerContent />
    </Suspense>
  );
}
