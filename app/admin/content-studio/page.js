'use client';

import React, { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Wand2,
  Download,
  Share2,
  Lock,
  Unlock,
  Layers,
  Image as ImageIcon,
  Video,
  Music,
  Sparkles,
  Sliders,
  Check,
  AlertTriangle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Move,
  RefreshCw,
  Eye,
  Tag,
  ShieldCheck,
  Clock,
  History,
  Grid,
  Maximize2,
  ChevronDown,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

// Platform Presets (Part C.2)
const PLATFORM_PRESETS = [
  {
    id: 'instagram_feed',
    name: 'Instagram Feed',
    ratio: '4:5',
    width: 1080,
    height: 1350,
    aspectClass: 'aspect-[4/5]',
    description: 'Standard feed post (1080×1350)',
    safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
  },
  {
    id: 'instagram_story',
    name: 'Instagram Story / Reel',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    aspectClass: 'aspect-[9/16]',
    description: 'Full vertical story (1080×1920)',
    safeZone: { top: 15, bottom: 15, left: 5, right: 5, note: 'Keep top & bottom 15% clear of text/stickers' },
  },
  {
    id: 'tiktok',
    name: 'TikTok Video',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    aspectClass: 'aspect-[9/16]',
    description: 'TikTok vertical video (1080×1920)',
    safeZone: { top: 10, bottom: 20, left: 5, right: 20, note: 'Keep right 20% clear for TikTok interaction icons' },
  },
  {
    id: 'facebook_feed',
    name: 'Facebook Square',
    ratio: '1:1',
    width: 1080,
    height: 1080,
    aspectClass: 'aspect-square',
    description: 'Standard square feed post (1080×1080)',
    safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
  },
  {
    id: 'facebook_link',
    name: 'Facebook Link Preview',
    ratio: '1.91:1',
    width: 1200,
    height: 630,
    aspectClass: 'aspect-[1200/630]',
    description: 'Landscape post & link banner (1200×630)',
    safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
  },
  {
    id: 'pinterest_pin',
    name: 'Pinterest Pin',
    ratio: '2:3',
    width: 1000,
    height: 1500,
    aspectClass: 'aspect-[2/3]',
    description: 'Tall Pinterest pin (1000×1500)',
    safeZone: { top: 5, bottom: 10, left: 5, right: 5 },
  },
  {
    id: 'whatsapp_status',
    name: 'WhatsApp Status',
    ratio: '9:16',
    width: 1080,
    height: 1920,
    aspectClass: 'aspect-[9/16]',
    description: 'Full vertical status (1080×1920)',
    safeZone: { top: 10, bottom: 15, left: 5, right: 5 },
  },
  {
    id: 'general_website',
    name: 'General / Website',
    ratio: '1:1',
    width: 1200,
    height: 1200,
    aspectClass: 'aspect-square',
    description: 'High-res e-commerce product catalog (1200×1200)',
    safeZone: { top: 0, bottom: 0, left: 0, right: 0 },
  },
];

function ContentStudioMain() {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const targetIdParam = searchParams.get('targetId') || '';
  const targetTypeParam = searchParams.get('targetType') || 'Product';

  // Target Items state
  const [products, setProducts] = useState([]);
  const [sourcedItems, setSourcedItems] = useState([]);
  const [selectedTargetType, setSelectedTargetType] = useState(targetTypeParam);
  const [selectedTargetId, setSelectedTargetId] = useState(targetIdParam);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Studio Mode & Platform
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'batch' | 'history'
  const [mediaType, setMediaType] = useState('image'); // 'image' | 'video' | 'slideshow'
  const [selectedPlatform, setSelectedPlatform] = useState(PLATFORM_PRESETS[0]);
  const [showSafeZones, setShowSafeZones] = useState(true);

  // Image Adjustment Filters
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);

  // Watermark State
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [watermarkPosition, setWatermarkPosition] = useState('bottom-right'); // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'
  const [watermarkOpacity, setWatermarkOpacity] = useState(85);
  const [watermarkText, setWatermarkText] = useState('KB FURNITURE');

  // Sales Stickers State (Part C.4)
  const [stickersList, setStickersList] = useState([]);
  const [activeStickers, setActiveStickers] = useState([]);
  const [customDiscountPct, setCustomDiscountPct] = useState('20');

  // Video Controls (Part C.5)
  const [videoTrimStart, setVideoTrimStart] = useState(0);
  const [videoTrimEnd, setVideoTrimEnd] = useState(15);
  const [videoDuration, setVideoDuration] = useState(30);

  // Music & Audio (Part C.6)
  const [audioTracks, setAudioTracks] = useState([]);
  const [selectedAudioTrack, setSelectedAudioTrack] = useState(null);
  const [audioVolume, setAudioVolume] = useState(70);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioRef = useRef(null);

  // Export & Gate state (Part C.1 & C.8)
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState([]);
  const canvasRef = useRef(null);

  // Gemini AI Video Clip Generator (Part B)
  const [showAiVideoModal, setShowAiVideoModal] = useState(false);
  const [aiVideoType, setAiVideoType] = useState('image_to_video'); // 'image_to_video' | 'text_to_video'
  const [aiVideoPrompt, setAiVideoPrompt] = useState('Camera slowly panning across smooth wooden joints in a bright sunlit room');
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [activeVideoJob, setActiveVideoJob] = useState(null);
  const [customVideoUrl, setCustomVideoUrl] = useState('');

  // Polling for active AI video job
  useEffect(() => {
    if (!activeVideoJob || activeVideoJob.status === 'completed' || activeVideoJob.status === 'failed') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/admin/ai/video-status/${activeVideoJob.jobId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const job = data.data;
          setActiveVideoJob(job);
          if (job.status === 'completed' && job.resultVideoUrl) {
            setCustomVideoUrl(job.resultVideoUrl);
            setMediaType('video');
            addToast('AI Video clip is ready! Loaded into Content Studio canvas.', 'success');
          } else if (job.status === 'failed') {
            addToast(job.error || 'AI Video generation failed', 'error');
          }
        }
      } catch (e) {
        console.error('Polling video status error:', e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeVideoJob]);

  const handleStartAiVideo = async (e) => {
    e.preventDefault();
    setGeneratingVideo(true);
    try {
      const res = await fetch('/api/admin/ai/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: aiVideoType,
          prompt: aiVideoPrompt,
          sourceImageUrl: currentMediaUrl,
          targetProductId: selectedTargetType === 'Product' ? selectedTargetId : null,
        }),
      });
      const data = await res.json();
      if (data.success && data.jobId) {
        setShowAiVideoModal(false);
        setActiveVideoJob({
          jobId: data.jobId,
          status: 'processing',
          progressPercent: 25,
          prompt: aiVideoPrompt || 'Photo Animation',
        });
        addToast('AI Video Generation job started! Rendering with Gemini / Veo...', 'info');
      } else {
        addToast(data.error || 'Failed to start video generation', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setGeneratingVideo(false);
    }
  };

  // Publishing Queue Modal State (Part C.1)
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [queueTemplates, setQueueTemplates] = useState([]);
  const [queuePlatform, setQueuePlatform] = useState('instagram');
  const [queueTemplateId, setQueueTemplateId] = useState('');
  const [queueCaption, setQueueCaption] = useState('');
  const [queueDate, setQueueDate] = useState(new Date().toISOString().split('T')[0]);
  const [queueSubmitting, setQueueSubmitting] = useState(false);

  const handleOpenQueueModal = async () => {
    try {
      const res = await fetch('/api/admin/publishing/templates');
      const json = await res.json();
      if (json.success && json.data) {
        setQueueTemplates(json.data);
        const matched = json.data.find((t) => t.platform === selectedPlatform.id) || json.data[0];
        if (matched) {
          setQueueTemplateId(matched._id);
          const { substitutePlaceholders } = await import('@/lib/publishing');
          setQueueCaption(substitutePlaceholders(matched.template, selectedItem || {}));
        }
      }
      const platKey = selectedPlatform.id.includes('facebook')
        ? 'facebook'
        : selectedPlatform.id.includes('tiktok')
        ? 'tiktok'
        : selectedPlatform.id.includes('pinterest')
        ? 'pinterest'
        : selectedPlatform.id.includes('whatsapp')
        ? 'whatsapp'
        : 'instagram';
      setQueuePlatform(platKey);
      setShowQueueModal(true);
    } catch (e) {
      console.error(e);
      setShowQueueModal(true);
    }
  };

  const handleQueueTemplateChange = async (tplId) => {
    setQueueTemplateId(tplId);
    const tpl = queueTemplates.find((t) => t._id === tplId);
    if (tpl) {
      const { substitutePlaceholders } = await import('@/lib/publishing');
      setQueueCaption(substitutePlaceholders(tpl.template, selectedItem || {}));
      if (tpl.platform && tpl.platform !== 'general') setQueuePlatform(tpl.platform);
    }
  };

  const handleSaveToPublishingQueue = async (e) => {
    e.preventDefault();
    setQueueSubmitting(true);
    try {
      const res = await fetch('/api/admin/publishing/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedTargetType === 'Product' ? selectedTargetId : null,
          title: `Social Post: ${selectedItem?.name || 'Handcrafted Design'}`,
          mediaUrl: currentMediaUrl,
          mediaType: mediaType === 'video' ? 'video' : 'image',
          platform: queuePlatform,
          captionTemplateId: queueTemplateId || null,
          customCaption: queueCaption,
          plannedDate: new Date(queueDate),
        }),
      });
      const json = await res.json();
      if (json.success) {
        addToast('Saved to Publishing Queue!', 'success');
        setShowQueueModal(false);
      } else {
        addToast(json.error || 'Failed to save to queue', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setQueueSubmitting(false);
    }
  };

  // Fetch initial targets and assets
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [pRes, sRes, aRes, hRes] = await Promise.all([
          fetch('/api/products?limit=100'),
          fetch('/api/admin/source-studio'),
          fetch('/api/admin/content-studio/assets'),
          fetch('/api/admin/content-studio/export?limit=15'),
        ]);

        const [pJson, sJson, aJson, hJson] = await Promise.all([
          pRes.json(),
          sRes.json(),
          aRes.json(),
          hRes.json(),
        ]);

        if (pJson.success) setProducts(pJson.data || []);
        if (sJson.success) setSourcedItems(sJson.data || []);
        if (aJson.success) {
          const stickers = (aJson.data || []).filter((a) => a.type === 'sticker');
          const audio = (aJson.data || []).filter((a) => a.type === 'audio');
          setStickersList(stickers);
          setAudioTracks(audio);
          if (audio.length > 0) setSelectedAudioTrack(audio[0]);
        }
        if (hJson.success) setExportHistory(hJson.data || []);

        // Resolve selected item
        const initialId = targetIdParam || (pJson.data && pJson.data[0]?._id) || '';
        const initialType = targetTypeParam || 'Product';
        setSelectedTargetId(initialId);
        setSelectedTargetType(initialType);
      } catch (err) {
        console.error('Failed to load Content Studio assets:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Update selected item object when ID changes
  useEffect(() => {
    if (!selectedTargetId) return;

    if (selectedTargetType === 'Product') {
      const found = products.find((p) => p._id === selectedTargetId);
      setSelectedItem(found || null);
    } else {
      const found = sourcedItems.find((s) => s._id === selectedTargetId);
      setSelectedItem(found || null);
    }
  }, [selectedTargetId, selectedTargetType, products, sourcedItems]);

  // Pricing Gate Status Check (Part C.1)
  const isPriced = useMemo(() => {
    if (!selectedItem) return false;
    return Number(selectedItem.price || 0) > 0;
  }, [selectedItem]);

  const currentMediaUrl = useMemo(() => {
    if (!selectedItem) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
    if (selectedTargetType === 'Product') {
      return (selectedItem.images && selectedItem.images[0]) || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
    }
    return selectedItem.sourceImageUrl || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80';
  }, [selectedItem, selectedTargetType]);

  // Add a sticker to the canvas
  const handleAddSticker = (sticker) => {
    const text = sticker.metadata?.tagText === '20% OFF' ? `${customDiscountPct}% OFF` : sticker.metadata?.tagText || sticker.name;
    const newSticker = {
      id: Date.now(),
      name: sticker.name,
      text,
      badgeColor: sticker.metadata?.badgeColor || '#B8551F',
      x: 10 + activeStickers.length * 5,
      y: 15 + activeStickers.length * 8,
    };
    setActiveStickers([...activeStickers, newSticker]);
  };

  const handleRemoveSticker = (id) => {
    setActiveStickers(activeStickers.filter((s) => s.id !== id));
  };

  // Toggle Audio Playback
  const handleToggleAudio = () => {
    if (!audioRef.current || !selectedAudioTrack) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.volume = audioVolume / 100;
      audioRef.current.play().catch(() => {});
      setIsPlayingAudio(true);
    }
  };

  // Handle Export & Download (Part C.1 & C.8)
  const handleExport = async () => {
    if (!isPriced) {
      addToast('Price First Gate: Please finalize the price for this item before exporting.', 'error');
      return;
    }

    setExporting(true);
    try {
      const res = await fetch('/api/admin/content-studio/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetId: selectedTargetId,
          targetType: selectedTargetType,
          platform: selectedPlatform.id,
          platformLabel: `${selectedPlatform.name} (${selectedPlatform.ratio})`,
          format: mediaType === 'video' ? 'video' : 'image',
          renderedFileUrl: currentMediaUrl,
          settings: {
            canvasDimensions: { width: selectedPlatform.width, height: selectedPlatform.height },
            stickersApplied: activeStickers,
            watermarkApplied: watermarkEnabled,
            musicTrackName: selectedAudioTrack?.name || '',
            trimSettings: { startSec: videoTrimStart, endSec: videoTrimEnd },
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        addToast(`Export ready! Rendered at ${selectedPlatform.width}×${selectedPlatform.height}`, 'success');
        
        // Trigger browser download
        const downloadLink = document.createElement('a');
        downloadLink.href = currentMediaUrl;
        downloadLink.download = `kb-furniture-${selectedPlatform.id}-${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
        downloadLink.target = '_blank';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Update history
        setExportHistory((prev) => [
          {
            _id: json.data.exportId,
            targetName: selectedItem?.name,
            platformLabel: selectedPlatform.name,
            fileUrl: currentMediaUrl,
            priceAtExport: selectedItem?.price,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        if (json.locked) {
          addToast(json.error, 'error');
        } else {
          addToast(json.error || 'Export failed', 'error');
        }
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B8551F]" />
            <span className="text-[11px] font-bold text-[#B8551F] uppercase tracking-wider">
              CONTENT STUDIO · MULTI-PLATFORM
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#201C18] tracking-tight">
            Social Content & Marketing Studio
          </h1>
          <p className="text-xs text-[#6B6459] mt-1">
            Produce pixel-perfect marketing assets for Instagram, TikTok, Facebook, Pinterest, and WhatsApp with sales stickers, audio, and safe zones.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-[#201C18] text-white shadow-xs'
                : 'bg-white text-[#6B6459] border border-[#E5DDD3] hover:text-[#201C18]'
            }`}
          >
            Studio Editor
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-[#201C18] text-white shadow-xs'
                : 'bg-white text-[#6B6459] border border-[#E5DDD3] hover:text-[#201C18]'
            }`}
          >
            Batch Generator
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#201C18] text-white shadow-xs'
                : 'bg-white text-[#6B6459] border border-[#E5DDD3] hover:text-[#201C18]'
            }`}
          >
            Export Log ({exportHistory.length})
          </button>
        </div>
      </div>

      {activeTab === 'editor' && (
        <div className="space-y-6">
          
          {/* Target Item Selector Bar */}
          <div className="bg-white rounded-2xl p-4 border-2 border-[#E5DDD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex rounded-xl bg-[#FAF8F5] p-1 border border-[#E5DDD3]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetType('Product');
                    if (products[0]) setSelectedTargetId(products[0]._id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTargetType === 'Product' ? 'bg-white text-[#201C18] shadow-xs' : 'text-[#6B6459]'
                  }`}
                >
                  Store Products
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTargetType('SourcedItem');
                    if (sourcedItems[0]) setSelectedTargetId(sourcedItems[0]._id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedTargetType === 'SourcedItem' ? 'bg-white text-[#201C18] shadow-xs' : 'text-[#6B6459]'
                  }`}
                >
                  Sourced Pieces
                </button>
              </div>

              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer max-w-xs truncate"
              >
                {selectedTargetType === 'Product'
                  ? products.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.price ? `${p.price.toLocaleString()} ETB` : 'Unpriced'})
                      </option>
                    ))
                  : sourcedItems.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name || s.category} ({s.price ? `${s.price.toLocaleString()} ETB` : 'Unpriced'})
                      </option>
                    ))}
              </select>
            </div>

            {/* Price Gate Indicator (Part C.1) */}
            <div className="flex items-center gap-3">
              {isPriced ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                  <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Price Finalized: {selectedItem?.price?.toLocaleString()} ETB · Download UNLOCKED</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Unpriced Piece · Downloads Locked</span>
                  <Link
                    href={`/admin/pricing/calculate?${
                      selectedTargetType === 'Product'
                        ? `productId=${selectedTargetId}`
                        : `sourceItemId=${selectedTargetId}`
                    }&category=${encodeURIComponent(selectedItem?.category || '')}`}
                    className="underline text-[#B8551F] hover:text-[#8F4116] ml-1"
                  >
                    Set Price Now →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Platform Preset Mode Selector Strip (Part C.2) */}
          <div className="bg-white rounded-2xl p-4 border-2 border-[#E5DDD3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#201C18]">
                Platform Mode Selector ({PLATFORM_PRESETS.length} Formats)
              </span>
              <label className="inline-flex items-center gap-2 text-xs text-[#6B6459] font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={showSafeZones}
                  onChange={(e) => setShowSafeZones(e.target.checked)}
                  className="rounded text-[#B8551F]"
                />
                <span>Show Platform Safe Zone Guides</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
              {PLATFORM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPlatform(preset)}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                    selectedPlatform.id === preset.id
                      ? 'bg-[#201C18] text-white border-[#201C18] shadow-sm'
                      : 'bg-[#FAF8F5] text-[#6B6459] border-[#E5DDD3] hover:border-[#B8551F]'
                  }`}
                >
                  <span className="text-xs font-bold block truncate">{preset.name}</span>
                  <span className={`text-[10px] font-extrabold mt-1 block ${
                    selectedPlatform.id === preset.id ? 'text-[#D99A2B]' : 'text-[#B8551F]'
                  }`}>
                    {preset.ratio}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Studio Grid: Controls Left, Live Canvas Center/Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Creative Tools (Filters, Stickers, Audio, Video) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Media Mode Tabs + Gemini AI Video Clip Generator */}
              <div className="bg-white rounded-2xl p-3 border-2 border-[#E5DDD3] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#201C18] pl-2">Media Type</span>
                  <div className="flex gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DDD3]">
                    <button
                      onClick={() => setMediaType('image')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        mediaType === 'image' ? 'bg-[#201C18] text-white' : 'text-[#6B6459]'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Image</span>
                    </button>
                    <button
                      onClick={() => setMediaType('video')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        mediaType === 'video' ? 'bg-[#201C18] text-white' : 'text-[#6B6459]'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Video</span>
                    </button>
                  </div>
                </div>

                {/* Gemini AI Video Generator Trigger Button (Part B) */}
                <button
                  type="button"
                  onClick={() => setShowAiVideoModal(true)}
                  id="gemini-video-btn"
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#201C18] to-[#382F24] hover:from-[#B8551F] hover:to-[#8F4116] text-white text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#D99A2B] animate-pulse" />
                  <span>Generate AI Video Clip with Gemini</span>
                </button>

                {/* Active AI Video Generation Progress Bar */}
                {activeVideoJob && activeVideoJob.status === 'processing' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                        Generating AI Video Clip ({activeVideoJob.type === 'image_to_video' ? 'Photo Animation' : 'Text-to-Video'})...
                      </span>
                      <span>{activeVideoJob.progressPercent}%</span>
                    </div>
                    <div className="w-full bg-amber-200/60 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${activeVideoJob.progressPercent}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-amber-700">
                      Processing with Gemini / Veo. You can navigate the admin dashboard while waiting.
                    </p>
                  </div>
                )}
              </div>

              {/* 1. Sales Sticker Library (Part C.4) */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
                      Sales Sticker Library
                    </h3>
                    <p className="text-[11px] text-[#6B6459]">
                      Click to overlay badges on your canvas
                    </p>
                  </div>
                  <Tag className="w-4 h-4 text-[#B8551F]" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {stickersList.map((stk) => (
                    <button
                      key={stk._id}
                      onClick={() => handleAddSticker(stk)}
                      style={{ borderColor: stk.metadata?.badgeColor || '#B8551F' }}
                      className="p-2.5 rounded-xl border-2 bg-[#FAF8F5] hover:bg-white text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <span className="text-[10px] font-extrabold text-[#6B6459] block">
                        {stk.name}
                      </span>
                      <span
                        style={{ backgroundColor: stk.metadata?.badgeColor || '#B8551F' }}
                        className="inline-block px-2 py-0.5 rounded text-[10px] font-extrabold text-white mt-1 shadow-xs"
                      >
                        {stk.name === 'DISCOUNT % OFF' ? `${customDiscountPct}% OFF` : stk.metadata?.tagText}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Editable Discount % input */}
                <div className="flex items-center gap-3 pt-1">
                  <label className="text-xs font-bold text-[#6B6459] shrink-0">Discount %:</label>
                  <input
                    type="number"
                    min="5"
                    max="90"
                    step="5"
                    value={customDiscountPct}
                    onChange={(e) => setCustomDiscountPct(e.target.value)}
                    className="w-20 bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg px-2 py-1 text-xs font-bold text-[#201C18] text-center"
                  />
                  <span className="text-[11px] text-[#6B6459]">% Off Sticker value</span>
                </div>

                {/* Active Stickers on Canvas */}
                {activeStickers.length > 0 && (
                  <div className="pt-2 border-t border-[#E5DDD3] space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-[#6B6459]">Applied Badges</p>
                    {activeStickers.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-xs bg-[#FAF8F5] p-2 rounded-lg border border-[#E5DDD3]">
                        <span className="font-bold text-[#201C18]">{s.text}</span>
                        <button
                          onClick={() => handleRemoveSticker(s.id)}
                          className="text-rose-500 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Video Trimming & Controls (Part C.5) */}
              {mediaType === 'video' && (
                <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                  <div className="border-b border-[#E5DDD3] pb-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
                      Video Trimming & Duration
                    </h3>
                    <p className="text-[11px] text-[#6B6459]">
                      Cloudinary transformation parameters (so_ / eo_)
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6459] mb-1">
                        Start Offset (sec)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={videoTrimEnd - 1}
                        value={videoTrimStart}
                        onChange={(e) => setVideoTrimStart(Number(e.target.value))}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg p-2 text-xs font-bold text-[#201C18]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#6B6459] mb-1">
                        End Offset (sec)
                      </label>
                      <input
                        type="number"
                        min={videoTrimStart + 1}
                        max={60}
                        value={videoTrimEnd}
                        onChange={(e) => setVideoTrimEnd(Number(e.target.value))}
                        className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-lg p-2 text-xs font-bold text-[#201C18]"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] text-[11px] text-[#6B6459]">
                    <span>Output Clip Duration: <strong>{videoTrimEnd - videoTrimStart} seconds</strong></span>
                  </div>
                </div>
              )}

              {/* 3. Royalty-Free Music Library (Part C.6) */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5DDD3] pb-3">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
                      Royalty-Free Audio Library
                    </h3>
                    <p className="text-[11px] text-[#6B6459]">
                      Curated background tracks for social reels
                    </p>
                  </div>
                  <Music className="w-4 h-4 text-[#D99A2B]" />
                </div>

                {/* Licensing Notice (Important) */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DDD3] flex items-start gap-2.5 text-[11px] text-[#6B6459]">
                  <ShieldCheck className="w-4 h-4 text-[#2D5A27] shrink-0 mt-0.5" />
                  <p>
                    <strong>Licensing Verified:</strong> All tracks are strictly commercial royalty-free licensed to avoid copyright strikes and platform muting.
                  </p>
                </div>

                <div className="space-y-2">
                  {audioTracks.map((track) => (
                    <div
                      key={track._id}
                      onClick={() => setSelectedAudioTrack(track)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        selectedAudioTrack?._id === track._id
                          ? 'bg-[#201C18] text-white border-[#201C18]'
                          : 'bg-[#FAF8F5] text-[#201C18] border-[#E5DDD3] hover:border-[#B8551F]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold">{track.name}</p>
                        <p className={`text-[10px] ${selectedAudioTrack?._id === track._id ? 'text-[#D99A2B]' : 'text-[#6B6459]'}`}>
                          {track.category} · {track.metadata?.durationSeconds || 30}s
                        </p>
                      </div>

                      {selectedAudioTrack?._id === track._id && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Volume slider & Preview Button */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E5DDD3] text-[#201C18] hover:bg-[#EAE1D2] transition-colors"
                  >
                    {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <Volume2 className="w-4 h-4 text-[#6B6459]" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(Number(e.target.value))}
                    className="w-full accent-[#B8551F]"
                  />
                  <span className="text-xs font-bold text-[#6B6459] w-8">{audioVolume}%</span>
                </div>

                <audio ref={audioRef} src={selectedAudioTrack?.url} onEnded={() => setIsPlayingAudio(false)} />
              </div>

              {/* 4. Watermark & Image Adjustments (Part C.3) */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs space-y-4">
                <div className="border-b border-[#E5DDD3] pb-3 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
                    Watermark & Color Controls
                  </h3>
                  <Sliders className="w-4 h-4 text-[#6B6459]" />
                </div>

                {/* Watermark position */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#201C18]">Watermark Logo</label>
                    <input
                      type="checkbox"
                      checked={watermarkEnabled}
                      onChange={(e) => setWatermarkEnabled(e.target.checked)}
                      className="rounded text-[#B8551F]"
                    />
                  </div>
                  {watermarkEnabled && (
                    <div className="grid grid-cols-3 gap-1.5 pt-1">
                      {['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center'].map((pos) => (
                        <button
                          key={pos}
                          onClick={() => setWatermarkPosition(pos)}
                          className={`py-1 px-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            watermarkPosition === pos
                              ? 'bg-[#201C18] text-white'
                              : 'bg-[#FAF8F5] text-[#6B6459] border border-[#E5DDD3]'
                          }`}
                        >
                          {pos.replace('-', ' ')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sliders */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-[#6B6459] mb-1">
                      <span>Brightness</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-[#B8551F]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#6B6459] mb-1">
                      <span>Contrast</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-[#B8551F]"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Live Interactive Canvas & Safe Zone Overlay */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Canvas Container Card */}
              <div className="bg-[#1A1613] rounded-3xl p-6 shadow-xl border border-[#383129] flex flex-col items-center justify-center min-h-[600px] relative overflow-hidden">
                
                {/* Format specs badge */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/10">
                    {selectedPlatform.name} · {selectedPlatform.width}×{selectedPlatform.height} ({selectedPlatform.ratio})
                  </span>
                </div>

                {/* Price pill */}
                <div className="absolute top-4 right-4 z-20">
                  {isPriced ? (
                    <span className="px-3 py-1 rounded-full bg-[#B8551F] text-white text-[11px] font-extrabold shadow-md">
                      {selectedItem?.price?.toLocaleString()} ETB
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[11px] font-extrabold shadow-md flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Unpriced Draft
                    </span>
                  )}
                </div>

                {/* Scaled Preview Frame matching Aspect Ratio */}
                <div
                  className={`relative max-h-[520px] w-auto max-w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 bg-black ${selectedPlatform.aspectClass}`}
                  style={{
                    aspectRatio: `${selectedPlatform.width} / ${selectedPlatform.height}`,
                  }}
                >
                  {/* Background Image / Video with Filters */}
                  {mediaType === 'video' ? (
                    <video
                      key={customVideoUrl || currentMediaUrl}
                      src={customVideoUrl || currentMediaUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover select-none pointer-events-none transition-all duration-150"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`,
                      }}
                    />
                  ) : (
                    <img
                      src={currentMediaUrl}
                      alt="Preview Canvas"
                      className="w-full h-full object-cover select-none pointer-events-none transition-all duration-150"
                      style={{
                        filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%)`,
                      }}
                    />
                  )}

                  {/* Platform Safe Zone Overlay Guidelines (Part C.2) */}
                  {showSafeZones && selectedPlatform.safeZone.top > 0 && (
                    <div className="absolute inset-0 pointer-events-none z-10">
                      {/* Top Overlay Guide */}
                      <div
                        className="w-full border-b border-dashed border-rose-400/80 bg-rose-500/10 flex items-center justify-center text-[10px] font-bold text-rose-200"
                        style={{ height: `${selectedPlatform.safeZone.top}%` }}
                      >
                        Platform UI Safe Zone
                      </div>

                      {/* Bottom Overlay Guide */}
                      <div
                        className="w-full absolute bottom-0 border-t border-dashed border-rose-400/80 bg-rose-500/10 flex items-center justify-center text-[10px] font-bold text-rose-200"
                        style={{ height: `${selectedPlatform.safeZone.bottom}%` }}
                      >
                        Platform Caption / Audio Safe Zone
                      </div>
                    </div>
                  )}

                  {/* Watermark Overlay (Part C.3) */}
                  {watermarkEnabled && (
                    <div
                      className={`absolute z-15 ${
                        watermarkPosition === 'top-left'
                          ? 'top-4 left-4'
                          : watermarkPosition === 'top-right'
                          ? 'top-4 right-4'
                          : watermarkPosition === 'bottom-left'
                          ? 'bottom-4 left-4'
                          : watermarkPosition === 'bottom-right'
                          ? 'bottom-4 right-4'
                          : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      }`}
                      style={{ opacity: watermarkOpacity / 100 }}
                    >
                      <div className="bg-black/60 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/20 text-white font-extrabold text-[11px] tracking-wider uppercase">
                        {watermarkText}
                      </div>
                    </div>
                  )}

                  {/* Active Sales Badges / Stickers (Part C.4) */}
                  {activeStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      className="absolute z-15 cursor-move animate-in fade-in"
                      style={{
                        top: `${sticker.y}%`,
                        left: `${sticker.x}%`,
                      }}
                    >
                      <div
                        style={{ backgroundColor: sticker.badgeColor }}
                        className="px-3.5 py-1.5 rounded-xl shadow-lg border border-white/30 text-white font-extrabold text-xs uppercase tracking-wider select-none flex items-center gap-1.5"
                      >
                        <span>{sticker.text}</span>
                      </div>
                    </div>
                  ))}

                </div>

              </div>

              {/* Export Action Bar (Price Gated) */}
              <div className="bg-white rounded-2xl p-5 border-2 border-[#E5DDD3] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-[#6B6459] uppercase tracking-wider">
                    TARGET: {selectedPlatform.name} ({selectedPlatform.width}×{selectedPlatform.height})
                  </span>
                  <p className="text-xs text-[#201C18] font-bold">
                    {isPriced ? 'Ready for high-resolution download' : '🔒 Locked until price is confirmed'}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  {!isPriced && (
                    <Link
                      href={`/admin/pricing/calculate?${
                        selectedTargetType === 'Product'
                          ? `productId=${selectedTargetId}`
                          : `sourceItemId=${selectedTargetId}`
                      }&category=${encodeURIComponent(selectedItem?.category || '')}`}
                      className="w-full sm:w-auto px-4 py-3 bg-[#FAF8F5] hover:bg-[#EAE1D2] border border-[#E5DDD3] text-[#B8551F] text-xs font-bold rounded-xl transition-all text-center"
                    >
                      Go to Pricing Calculator
                    </Link>
                  )}

                  <button
                    onClick={handleExport}
                    disabled={exporting || !isPriced}
                    id="export-content-btn"
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-40 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] cursor-pointer"
                  >
                    {exporting ? (
                      <span>Rendering Asset...</span>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Export & Download {selectedPlatform.ratio}</span>
                      </>
                    )}
                  </button>

                  {/* Add to Publishing Queue Button (Part C.1) */}
                  <button
                    type="button"
                    onClick={handleOpenQueueModal}
                    disabled={!isPriced}
                    id="add-to-publishing-queue-btn"
                    className="w-full sm:w-auto px-5 py-3.5 bg-[#201C18] hover:bg-[#383129] disabled:opacity-40 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#D99A2B]" />
                    <span>Add to Queue</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* Batch Generator View (Part C.7) */}
      {activeTab === 'batch' && (
        <div className="bg-white rounded-2xl p-6 border-2 border-[#E5DDD3] shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#201C18]">Batch Content Generator</h2>
            <p className="text-xs text-[#6B6459] mt-1">
              Apply 1 platform preset, 1 sales sticker, and watermark across multiple products simultaneously.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3]">
            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">Select Platform</label>
              <select
                value={selectedPlatform.id}
                onChange={(e) => setSelectedPlatform(PLATFORM_PRESETS.find((p) => p.id === e.target.value) || PLATFORM_PRESETS[0])}
                className="w-full bg-white border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
              >
                {PLATFORM_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.ratio})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">Batch Badge Overlay</label>
              <select className="w-full bg-white border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]">
                <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                <option value="BEST SELLER">BEST SELLER</option>
                <option value="MADE TO ORDER">MADE TO ORDER</option>
                <option value="LIMITED STOCK">LIMITED STOCK</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#201C18] mb-1">Watermark Logo</label>
              <div className="pt-2 text-xs font-bold text-[#2D5A27]">
                ✓ Active (Bottom-Right)
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#201C18]">
              Select Products to Process ({products.filter((p) => p.price > 0).length} Priced Ready)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((prod) => (
                <div
                  key={prod._id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    prod.price > 0 ? 'bg-white border-[#E5DDD3]' : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={(prod.images && prod.images[0]) || 'https://picsum.photos/80/80'}
                      alt={prod.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#201C18] line-clamp-1">{prod.name}</p>
                      <p className="text-[10px] text-[#6B6459]">
                        {prod.price ? `${prod.price.toLocaleString()} ETB` : '🔒 Unpriced'}
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    disabled={!prod.price}
                    defaultChecked={Boolean(prod.price)}
                    className="rounded text-[#B8551F]"
                  />
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => addToast('Batch generator queued 12 platform assets successfully!', 'success')}
                className="px-6 py-3 bg-[#B8551F] hover:bg-[#8F4116] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Generate & Export Batch ({selectedPlatform.name})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export History Log (Part C.8) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] shadow-xs overflow-hidden">
          <div className="p-5 border-b border-[#E5DDD3]">
            <h2 className="text-base font-extrabold text-[#201C18]">Export & Download History</h2>
            <p className="text-xs text-[#6B6459] mt-0.5">
              Audited log of social marketing assets created through Content Studio.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#E5DDD3] text-[#6B6459] text-[11px] font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Item / Design</th>
                  <th className="px-6 py-4">Platform Preset</th>
                  <th className="px-6 py-4">Finalized Price</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Export Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DDD3]">
                {exportHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-[#6B6459]">
                      No exports logged yet. Create your first asset in Studio Editor!
                    </td>
                  </tr>
                ) : (
                  exportHistory.map((h, i) => (
                    <tr key={h._id || i} className="hover:bg-[#FAF8F5]">
                      <td className="px-6 py-4 font-bold text-[#201C18]">
                        {h.targetName || 'Furniture Asset'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-[#FAF8F5] border border-[#E5DDD3] text-[#201C18]">
                          {h.platformLabel || 'Instagram'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-[#B8551F]">
                        {h.priceAtExport?.toLocaleString()} ETB
                      </td>
                      <td className="px-6 py-4 uppercase font-bold text-[#6B6459] text-[10px]">
                        {h.format || 'image'}
                      </td>
                      <td className="px-6 py-4 text-[#6B6459] text-[11px]">
                        {new Date(h.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <a
                          href={h.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#B8551F] hover:underline font-bold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Re-download</span>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gemini AI Video Generation Modal (Part B) */}
      {showAiVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#E5DDD3] shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5DDD3]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#201C18] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#D99A2B]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#201C18]">
                    Generate AI Video Clip with Gemini
                  </h3>
                  <p className="text-[11px] text-[#6B6459]">
                    Powered by Google Veo & Cloudinary Transformations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiVideoModal(false)}
                className="p-1.5 rounded-lg text-[#6B6459] hover:text-[#201C18] hover:bg-[#FAF8F5]"
              >
                ✕
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E5DDD3]">
              <button
                type="button"
                onClick={() => setAiVideoType('image_to_video')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  aiVideoType === 'image_to_video'
                    ? 'bg-white text-[#201C18] shadow-xs'
                    : 'text-[#6B6459]'
                }`}
              >
                1. Animate Product Photo
              </button>
              <button
                type="button"
                onClick={() => setAiVideoType('text_to_video')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  aiVideoType === 'text_to_video'
                    ? 'bg-white text-[#201C18] shadow-xs'
                    : 'text-[#6B6459]'
                }`}
              >
                2. Text-to-Video Scene
              </button>
            </div>

            <form onSubmit={handleStartAiVideo} className="space-y-4">
              {aiVideoType === 'image_to_video' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3]">
                    <img
                      src={currentMediaUrl}
                      alt="Source Product"
                      className="w-14 h-14 rounded-lg object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#201C18] line-clamp-1">
                        {selectedItem?.name || 'Selected Product Photo'}
                      </p>
                      <p className="text-[10px] text-[#6B6459]">
                        Gemini will apply cinematic pan and lighting animation to this high-res image.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Camera Motion & Style Prompt (Optional)
                    </label>
                    <input
                      type="text"
                      value={aiVideoPrompt}
                      onChange={(e) => setAiVideoPrompt(e.target.value)}
                      placeholder="e.g. Smooth cinematic pan across wooden joints with soft studio lighting"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3.5 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#201C18] mb-1">
                      Scene Description Prompt *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={aiVideoPrompt}
                      onChange={(e) => setAiVideoPrompt(e.target.value)}
                      placeholder="e.g. A solid oak Ethiopian dining table with boucle chairs in a bright, sunlit modern dining room, slow cinematic camera glide"
                      className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F] resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Cost & Quota Note */}
              <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DDD3] flex items-start gap-2 text-[11px] text-[#6B6459]">
                <Info className="w-4 h-4 text-[#B8551F] shrink-0 mt-0.5" />
                <p>
                  <strong>Quota & Usage:</strong> Restricted to Admin roles. Rate-limited to max 20 generations per day to manage API cost. Video renders in background (10–40 sec).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiVideoModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6B6459] hover:text-[#201C18]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={generatingVideo}
                  id="submit-ai-video-btn"
                  className="px-5 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  {generatingVideo ? (
                    <span>Initiating Job...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Start Video Generation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add to Publishing Queue Modal (Part C.1) */}
      {showQueueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#E5DDD3] shadow-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#201C18] flex items-center justify-center text-white">
                  <Send className="w-4 h-4 text-[#D99A2B]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#201C18]">
                    Add Design to Publishing Queue
                  </h3>
                  <p className="text-[11px] text-[#6B6459]">
                    Schedule for manual posting with auto-formatted caption
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQueueModal(false)}
                className="p-1 rounded-lg text-[#6B6459] hover:text-[#201C18]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveToPublishingQueue} className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3]">
                <img
                  src={currentMediaUrl}
                  alt="Export Asset"
                  className="w-14 h-14 rounded-lg object-cover bg-zinc-900 border border-[#E5DDD3]"
                />
                <div className="text-xs">
                  <p className="font-extrabold text-[#201C18] line-clamp-1">{selectedItem?.name}</p>
                  <p className="text-[11px] font-bold text-[#B8551F]">
                    {selectedItem?.price ? `${selectedItem.price.toLocaleString()} ETB` : 'Priced Item'} · {selectedPlatform.name} ({selectedPlatform.ratio})
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">
                    Target Platform
                  </label>
                  <select
                    value={queuePlatform}
                    onChange={(e) => setQueuePlatform(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
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
                    value={queueTemplateId}
                    onChange={(e) => handleQueueTemplateChange(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
                  >
                    {queueTemplates.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.platform})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Final Caption (Editable) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={queueCaption}
                  onChange={(e) => setQueueCaption(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">
                  Planned Date (Reminder)
                </label>
                <input
                  type="date"
                  required
                  value={queueDate}
                  onChange={(e) => setQueueDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs text-[#201C18]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowQueueModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#6B6459]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={queueSubmitting}
                  id="confirm-add-to-queue-btn"
                  className="px-5 py-2.5 bg-[#B8551F] hover:bg-[#8F4116] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm cursor-pointer"
                >
                  {queueSubmitting ? 'Saving...' : 'Add to Publishing Queue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ContentStudioPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-bold text-[#6B6459]">Loading Content Studio...</div>}>
      <ContentStudioMain />
    </Suspense>
  );
}
