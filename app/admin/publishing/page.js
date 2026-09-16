'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Calendar,
  List,
  Plus,
  Send,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  FileText,
  Trash2,
  Edit3,
  Sparkles,
  AlertCircle,
  X,
  Share2,
  Check,
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const PLATFORM_CONFIG = {
  instagram: { name: 'Instagram', color: '#E1306C', url: 'https://instagram.com', icon: '📸' },
  facebook: { name: 'Facebook', color: '#1877F2', url: 'https://facebook.com', icon: '📘' },
  tiktok: { name: 'TikTok', color: '#000000', url: 'https://tiktok.com', icon: '🎵' },
  pinterest: { name: 'Pinterest', color: '#BD081C', url: 'https://pinterest.com', icon: '📌' },
  whatsapp: { name: 'WhatsApp', color: '#25D366', url: 'https://web.whatsapp.com', icon: '💬' },
  general: { name: 'General', color: '#B8551F', url: '', icon: '🌐' },
};

export default function PublishingQueuePage() {
  const { addToast } = useToast();
  const [queueItems, setQueueItems] = useState([]);
  const [counts, setCounts] = useState({ total: 0, queued: 0, posted: 0, skipped: 0 });
  const [loading, setLoading] = useState(true);

  // View & Filters
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('queued'); // 'all' | 'queued' | 'posted' | 'skipped'
  const [searchQuery, setSearchQuery] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  // Ready to Post Modal State (Part E)
  const [activePostModalItem, setActivePostModalItem] = useState(null);
  const [captionCopied, setCaptionCopied] = useState(false);

  // Edit / Reschedule Modal State
  const [editingItem, setEditingItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    finalCaption: '',
    plannedDate: '',
    platform: 'instagram',
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedPlatform !== 'all') params.append('platform', selectedPlatform);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/admin/publishing/queue?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setQueueItems(json.data || []);
        if (json.counts) setCounts(json.counts);
      }
    } catch (err) {
      console.error('Failed to load publishing queue:', err);
      addToast('Failed to load publishing queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedStatus, selectedPlatform, searchQuery]);

  // Core "Ready to Post" Trigger (Part E)
  const handleReadyToPost = async (item) => {
    try {
      // 1. Copy caption to clipboard
      await navigator.clipboard.writeText(item.finalCaption);
      setCaptionCopied(true);

      // 2. Trigger media download
      const link = document.createElement('a');
      link.href = item.mediaUrl;
      link.download = `kb-publishing-${item.platform}-${item._id}.${item.mediaType === 'video' ? 'mp4' : 'jpg'}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 3. Open prompt modal with external link
      setActivePostModalItem(item);
      addToast('Caption copied! Media download started.', 'success');
    } catch (err) {
      console.error('Ready to post action error:', err);
      // Fallback open modal anyway
      setActivePostModalItem(item);
    }
  };

  // Mark status update helper
  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/publishing/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (json.success) {
        addToast(
          status === 'posted' ? '🎉 Marked as Published!' : `Status set to ${status}`,
          'success'
        );
        setActivePostModalItem(null);
        fetchQueue();
      } else {
        addToast(json.error || 'Failed to update status', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Remove this item from the publishing queue?')) return;
    try {
      const res = await fetch(`/api/admin/publishing/queue/${id}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        addToast('Removed from queue', 'success');
        setQueueItems((prev) => prev.filter((i) => i._id !== id));
      } else {
        addToast(json.error || 'Failed to remove', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      finalCaption: item.finalCaption,
      plannedDate: item.plannedDate ? new Date(item.plannedDate).toISOString().split('T')[0] : '',
      platform: item.platform || 'instagram',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingItem) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/publishing/queue/${editingItem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      const json = await res.json();
      if (json.success) {
        addToast('Post updated successfully', 'success');
        setEditingItem(null);
        fetchQueue();
      } else {
        addToast(json.error || 'Failed to update', 'error');
      }
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  // Calendar Helpers (D.2)
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    const days = [];
    // Previous month filler days
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, dateStr: '' });
    }
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ day: i, dateStr });
    }
    return days;
  }, [currentDate]);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#201C18]">
            Publishing Queue
          </h1>
          <p className="text-xs text-[#6B6459] mt-0.5">
            Organize social marketing posts, copy captions in 1 click, and download content ready to publish
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/publishing/templates"
            className="px-3.5 py-2 bg-white hover:bg-[#FAF8F5] text-[#201C18] border border-[#E5DDD3] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <FileText className="w-4 h-4 text-[#A8875E]" />
            <span>Caption Templates</span>
          </Link>
          <Link
            href="/admin/publishing/new"
            id="new-queue-post-btn"
            className="px-4 py-2 bg-[#B8551F] hover:bg-[#8F4116] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Queue</span>
          </Link>
        </div>
      </div>

      {/* Status Badges Header & View Toggle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'queued', label: 'Queued to Post', count: counts.queued, color: 'text-[#B8551F] bg-[#FAF8F5] border-[#B8551F]/30' },
          { id: 'posted', label: 'Published / Posted', count: counts.posted, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { id: 'skipped', label: 'Skipped', count: counts.skipped, color: 'text-zinc-600 bg-zinc-50 border-zinc-200' },
          { id: 'all', label: 'Total Planned', count: counts.total, color: 'text-[#201C18] bg-white border-[#E5DDD3]' },
        ].map((st) => (
          <button
            key={st.id}
            onClick={() => setSelectedStatus(st.id)}
            className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
              selectedStatus === st.id ? 'ring-2 ring-[#B8551F] shadow-xs' : 'opacity-90 hover:opacity-100'
            } ${st.color}`}
          >
            <span className="text-[11px] font-bold block">{st.label}</span>
            <span className="text-xl font-extrabold block mt-0.5">{st.count}</span>
          </button>
        ))}
      </div>

      {/* Filter and View Toggle Controls */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#E5DDD3] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Search & Platform filter */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B6459] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search posts or captions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
            />
          </div>

          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-1.5 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#B8551F] cursor-pointer"
          >
            <option value="all">All Platforms</option>
            <option value="instagram">📸 Instagram</option>
            <option value="facebook">📘 Facebook</option>
            <option value="tiktok">🎵 TikTok</option>
            <option value="pinterest">📌 Pinterest</option>
            <option value="whatsapp">💬 WhatsApp</option>
            <option value="general">🌐 General</option>
          </select>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#E5DDD3] w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-[#201C18] text-white shadow-xs' : 'text-[#6B6459]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'calendar' ? 'bg-[#201C18] text-white shadow-xs' : 'text-[#6B6459]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-16 text-center text-xs font-bold text-[#6B6459]">
          Loading publishing schedule...
        </div>
      ) : queueItems.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] p-12 text-center space-y-3">
          <Share2 className="w-10 h-10 text-[#A8875E] mx-auto opacity-40" />
          <h3 className="text-sm font-bold text-[#201C18]">No items in this queue filter</h3>
          <p className="text-xs text-[#6B6459] max-w-sm mx-auto">
            Add content from Content Studio exports or create a standalone social post.
          </p>
          <Link
            href="/admin/publishing/new"
            className="inline-block px-4 py-2 bg-[#B8551F] text-white text-xs font-bold rounded-xl"
          >
            Add First Queue Item
          </Link>
        </div>
      ) : viewMode === 'list' ? (
        /* ================= D.1 LIST / TABLE VIEW ================= */
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border-2 border-[#E5DDD3] shadow-xs overflow-hidden">
            <div className="divide-y divide-[#E5DDD3]">
              {queueItems.map((item) => {
                const plat = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.general;
                const plannedDateObj = new Date(item.plannedDate || item.createdAt);
                const isToday = new Date().toDateString() === plannedDateObj.toDateString();

                return (
                  <div
                    key={item._id}
                    className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
                  >
                    {/* Media Thumbnail + Title + Caption Preview */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-900 border border-[#E5DDD3] shrink-0">
                        {item.mediaType === 'video' ? (
                          <video
                            src={item.mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <span
                          style={{ backgroundColor: plat.color }}
                          className="absolute bottom-1 right-1 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-sm"
                        >
                          {plat.name}
                        </span>
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-extrabold text-[#201C18] truncate">
                            {item.title}
                          </h3>
                          {item.productId && (
                            <span className="text-[10px] font-bold text-[#B8551F] bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#E5DDD3]">
                              {item.productId?.price ? `${item.productId.price.toLocaleString()} ETB` : 'Product'}
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                              item.status === 'posted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'skipped'
                                ? 'bg-zinc-100 text-zinc-600'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        <p className="text-xs text-[#6B6459] font-medium line-clamp-2 pr-4 leading-relaxed">
                          {item.finalCaption}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] text-[#A8875E] font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Planned:{' '}
                            <strong className={isToday ? 'text-[#B8551F]' : 'text-[#201C18]'}>
                              {isToday ? 'Today' : plannedDateObj.toLocaleDateString()}
                            </strong>
                          </span>
                          {item.postedAt && (
                            <span className="text-emerald-700 font-bold">
                              ✓ Posted {new Date(item.postedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions Column */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#E5DDD3]">
                      {/* Core Ready to Post Button (Part E) */}
                      {item.status === 'queued' && (
                        <button
                          onClick={() => handleReadyToPost(item)}
                          id={`ready-to-post-${item._id}`}
                          className="px-4 py-2 bg-gradient-to-r from-[#B8551F] to-[#8F4116] hover:from-[#8F4116] hover:to-[#6B2F0E] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Ready to Post</span>
                        </button>
                      )}

                      {item.status === 'queued' ? (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'skipped')}
                          className="p-2 text-[#6B6459] hover:text-zinc-900 hover:bg-zinc-100 rounded-lg text-xs font-bold"
                          title="Skip"
                        >
                          Skip
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(item._id, 'queued')}
                          className="p-2 text-[#B8551F] hover:bg-[#FAF8F5] rounded-lg text-xs font-bold"
                          title="Re-queue"
                        >
                          Re-queue
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-[#6B6459] hover:text-[#201C18] hover:bg-white rounded-lg border border-[#E5DDD3]"
                        title="Edit caption or date"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="p-2 text-[#6B6459] hover:text-rose-500 hover:bg-white rounded-lg border border-[#E5DDD3]"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* ================= D.2 CALENDAR VIEW ================= */
        <div className="bg-white rounded-3xl border-2 border-[#E5DDD3] p-6 shadow-xs space-y-4">
          {/* Month Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-[#201C18]">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
                  )
                }
                className="p-2 rounded-lg border border-[#E5DDD3] hover:bg-[#FAF8F5] text-[#201C18]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-lg border border-[#E5DDD3] hover:bg-[#FAF8F5] text-xs font-bold text-[#201C18]"
              >
                Today
              </button>
              <button
                onClick={() =>
                  setCurrentDate(
                    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
                  )
                }
                className="p-2 rounded-lg border border-[#E5DDD3] hover:bg-[#FAF8F5] text-[#201C18]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold text-[#6B6459] uppercase tracking-wider pb-2 border-b border-[#E5DDD3]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((d, idx) => {
              if (!d.day) {
                return (
                  <div
                    key={idx}
                    className="min-h-24 bg-[#FAF8F5]/40 rounded-xl border border-transparent"
                  />
                );
              }

              const itemsOnDay = queueItems.filter((i) => {
                const pDate = new Date(i.plannedDate).toISOString().split('T')[0];
                return pDate === d.dateStr;
              });

              const isToday = new Date().toISOString().split('T')[0] === d.dateStr;

              return (
                <div
                  key={idx}
                  className={`min-h-24 p-2 rounded-xl border transition-all flex flex-col justify-between ${
                    isToday
                      ? 'bg-amber-50/60 border-[#B8551F]'
                      : 'bg-[#FAF8F5]/60 border-[#E5DDD3] hover:bg-white'
                  }`}
                >
                  <span
                    className={`text-xs font-extrabold ${
                      isToday ? 'text-[#B8551F]' : 'text-[#201C18]'
                    }`}
                  >
                    {d.day}
                  </span>

                  <div className="space-y-1 my-1">
                    {itemsOnDay.map((item) => {
                      const plat = PLATFORM_CONFIG[item.platform] || PLATFORM_CONFIG.general;
                      return (
                        <button
                          key={item._id}
                          onClick={() => handleReadyToPost(item)}
                          style={{ borderColor: plat.color }}
                          className="w-full text-left p-1 rounded-md bg-white border text-[10px] font-bold text-[#201C18] truncate block shadow-2xs hover:scale-[1.02] transition-transform"
                          title={`${item.title} — Click to post`}
                        >
                          <span className="mr-1">{plat.icon}</span>
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="text-[9px] text-[#A8875E] font-extrabold text-right block">
                    {itemsOnDay.length > 0 ? `${itemsOnDay.length} posts` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= PART E: READY TO POST MODAL ================= */}
      {activePostModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#E5DDD3] shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#201C18] flex items-center justify-center text-white">
                  <Send className="w-4 h-4 text-[#D99A2B]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#201C18]">
                    Ready to Post on {PLATFORM_CONFIG[activePostModalItem.platform]?.name || 'Social Media'}
                  </h3>
                  <p className="text-[11px] text-[#6B6459]">
                    Follow these 2 quick steps to publish
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActivePostModalItem(null)}
                className="p-1 rounded-lg text-[#6B6459] hover:text-[#201C18]"
              >
                ✕
              </button>
            </div>

            {/* Step 1: Caption & Media status */}
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Caption copied to clipboard & file downloaded!
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(activePostModalItem.finalCaption);
                    addToast('Caption re-copied!', 'info');
                  }}
                  className="text-[10px] text-emerald-800 underline uppercase"
                >
                  Re-copy
                </button>
              </div>

              {/* Caption Preview Box */}
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] text-xs text-[#201C18] whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                {activePostModalItem.finalCaption}
              </div>

              {/* Step 2: Open Social App Link */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E5DDD3] flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-extrabold text-[#201C18]">
                    Step 1: Open {PLATFORM_CONFIG[activePostModalItem.platform]?.name}
                  </p>
                  <p className="text-[11px] text-[#6B6459]">
                    Paste the caption and select the downloaded file to share.
                  </p>
                </div>
                {PLATFORM_CONFIG[activePostModalItem.platform]?.url && (
                  <a
                    href={PLATFORM_CONFIG[activePostModalItem.platform].url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#201C18] hover:bg-[#B8551F] text-white text-xs font-bold rounded-lg flex items-center gap-1 shrink-0 transition-colors"
                  >
                    <span>Open App</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Step 3: Mark as Posted Button */}
            <div className="pt-2 border-t border-[#E5DDD3] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setActivePostModalItem(null)}
                className="text-xs font-bold text-[#6B6459] hover:text-[#201C18]"
              >
                Close (Keep in Queue)
              </button>

              <button
                type="button"
                onClick={() => handleUpdateStatus(activePostModalItem._id, 'posted')}
                id="mark-as-posted-btn"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Mark as Posted</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Reschedule Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border-2 border-[#E5DDD3] shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5DDD3]">
              <h3 className="text-base font-extrabold text-[#201C18]">Edit Queue Post</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1 text-[#6B6459] hover:text-[#201C18]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs text-[#201C18] focus:outline-none focus:border-[#B8551F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">Platform</label>
                  <select
                    value={editFormData.platform}
                    onChange={(e) => setEditFormData({ ...editFormData, platform: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs font-bold text-[#201C18]"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#201C18] mb-1">Planned Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.plannedDate}
                    onChange={(e) => setEditFormData({ ...editFormData, plannedDate: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl px-3 py-2 text-xs text-[#201C18]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#201C18] mb-1">Final Caption</label>
                <textarea
                  rows={4}
                  required
                  value={editFormData.finalCaption}
                  onChange={(e) => setEditFormData({ ...editFormData, finalCaption: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD3] rounded-xl p-3 text-xs text-[#201C18]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 text-xs font-bold text-[#6B6459]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-[#B8551F] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
