'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  X,
} from 'lucide-react';
import SocialHeader from '@/components/admin/social/SocialHeader';

const PLATFORM_COLORS = {
  instagram: 'bg-pink-50 text-pink-700 border-pink-200',
  pinterest: 'bg-red-50 text-red-700 border-red-200',
  facebook: 'bg-blue-50 text-blue-700 border-blue-200',
  tiktok: 'bg-gray-100 text-gray-900 border-gray-300',
};

export default function SocialCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthYearString = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/social/posts?month=${monthYearString}`);
      const json = await res.json();
      if (json.success) {
        setPosts(json.data || []);
      }
    } catch (err) {
      console.error('Fetch calendar posts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [monthYearString]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Group posts by day of month (1 to 31)
  const postsByDay = {};
  posts.forEach((post) => {
    const postDate = new Date(post.scheduledFor || post.publishedAt || post.createdAt);
    if (postDate.getFullYear() === year && postDate.getMonth() === month) {
      const day = postDate.getDate();
      if (!postsByDay[day]) postsByDay[day] = [];
      postsByDay[day].push(post);
    }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SocialHeader
        title="Content Calendar"
        subtitle="Visual editorial calendar for scheduled product drops, seasonal promotions & reels."
      />

      {/* Calendar Header Controls */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#A8875E]/15 text-[#A8875E] flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#1A1613]">{monthName}</h2>
            <p className="text-xs text-[#7C7265]">{posts.length} posts scheduled / published this month</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-[#D5CCC2] text-xs font-semibold hover:bg-[#FAF8F5] text-[#4A4036]"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl border border-[#D5CCC2] hover:bg-[#FAF8F5] text-[#7C7265]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl border border-[#D5CCC2] hover:bg-[#FAF8F5] text-[#7C7265]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <Link
            href="/admin/social/compose"
            className="px-3.5 py-1.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ml-2"
          >
            <Plus className="w-3.5 h-3.5" />
            Schedule Post
          </Link>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-[#EBE5DF] bg-[#FAF8F5] text-center text-xs font-bold text-[#7C7265] py-2.5">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Days Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr bg-[#EBE5DF] gap-px">
          {/* Empty cells before 1st of month */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[110px] bg-[#FAF8F5]/40 p-2" />
          ))}

          {/* Days of Month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayPosts = postsByDay[dayNum] || [];
            const isToday =
              dayNum === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            return (
              <div
                key={`day-${dayNum}`}
                className={`min-h-[110px] bg-white p-2 flex flex-col justify-between transition-colors hover:bg-[#FCFAF7] ${
                  isToday ? 'bg-amber-50/40 ring-1 ring-inset ring-[#A8875E]/30' : ''
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-[#A8875E] text-white' : 'text-[#4A4036]'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {dayPosts.length > 0 && (
                    <span className="text-[10px] font-bold text-[#7C7265]">{dayPosts.length}</span>
                  )}
                </div>

                {/* Posts in Day */}
                <div className="space-y-1 mt-1 flex-1 overflow-y-auto max-h-[80px]">
                  {dayPosts.map((p) => {
                    const primaryPlatform = p.platforms?.[0] || 'instagram';
                    const colorClass = PLATFORM_COLORS[primaryPlatform] || PLATFORM_COLORS.instagram;
                    const isPosted = p.status === 'posted';

                    return (
                      <button
                        key={p._id}
                        type="button"
                        onClick={() => setSelectedPost(p)}
                        className={`w-full text-left px-2 py-1 rounded-lg border text-[10px] font-semibold truncate transition-all flex items-center gap-1.5 ${colorClass}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            isPosted ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                        />
                        <span className="truncate">
                          {p.captions?.default?.split('\n')[0] || p.productId?.name || 'Post'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Post Detail Inspection Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-[#EBE5DF]">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A8875E]">
                  {selectedPost.status.toUpperCase()}
                </span>
                <span className="text-xs text-[#7C7265]">
                  •{' '}
                  {new Date(
                    selectedPost.scheduledFor || selectedPost.publishedAt || selectedPost.createdAt
                  ).toLocaleString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Media & Details */}
            <div className="flex gap-4">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#EBE5DF]">
                <Image src={selectedPost.mediaUrl} alt="Post Media" fill className="object-cover" />
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap gap-1">
                  {selectedPost.platforms?.map((plat) => (
                    <span
                      key={plat}
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-gray-800"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
                {selectedPost.productId && (
                  <p className="text-xs font-bold text-[#1A1613]">
                    Product: {selectedPost.productId.name}
                  </p>
                )}
              </div>
            </div>

            {/* Caption Body */}
            <div className="bg-[#FAF8F5] rounded-xl p-3 border border-[#EBE5DF] text-xs text-[#4A4036] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-line">
              {selectedPost.captions?.default || selectedPost.captions?.instagram}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold text-[#4A4036]"
              >
                Close
              </button>
              <Link
                href={`/admin/social/history`}
                className="px-4 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750]"
              >
                View in History
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
