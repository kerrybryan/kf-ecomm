'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  Send,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  Calendar,
} from 'lucide-react';
import SocialHeader from '@/components/admin/social/SocialHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function SocialQueuePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/social/posts?status=queued');
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (err) {
      console.error('Fetch queue error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handlePublishNow = async (id) => {
    try {
      setActionLoading(id);
      setErrorMsg('');

      const res = await fetch(`/api/admin/social/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish_now' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to publish post');
      }

      setSuccessMsg('Post published immediately across all target channels!');
      fetchQueue();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Publishing error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelPost = async (id) => {
    if (!window.confirm('Cancel this queued post?')) return;
    try {
      setActionLoading(id);
      const res = await fetch(`/api/admin/social/posts/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Queued post cancelled.');
        fetchQueue();
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      setErrorMsg('Failed to cancel post');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SocialHeader
        title="Publish Queue & Scheduled Posts"
        subtitle="Manage pending social media jobs waiting for automated release."
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

      {/* Queue Items List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7C7265]">Loading scheduled publish queue...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#EBE5DF] text-[#A8875E] flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-bold text-[#1A1613]">Queue Is Currently Clear</h3>
            <p className="text-xs text-[#7C7265] mt-1">
              No posts are currently queued for future release. Use the Composer to schedule seasonal promotions, reels, or product drops.
            </p>
          </div>
          <Link
            href="/admin/social/compose"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule New Social Post
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#D5CCC2] transition-all"
            >
              {/* Left: Thumbnail & Content */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#EBE5DF]">
                  <Image src={post.mediaUrl} alt="Post Media" fill className="object-cover" />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={post.status} size="xs" />
                    {post.platforms?.map((plat) => (
                      <span
                        key={plat}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FAF8F5] text-[#4A4036] border border-[#EBE5DF]"
                      >
                        {plat}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs font-bold text-[#1A1613] line-clamp-1">
                    {post.captions?.default?.split('\n')[0] || post.productId?.name || 'Social Post'}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-[#7C7265]">
                    <Clock className="w-3.5 h-3.5 text-[#A8875E]" />
                    <span>
                      Scheduled for:{' '}
                      <strong className="text-[#1A1613]">
                        {post.scheduledFor
                          ? new Date(post.scheduledFor).toLocaleString()
                          : 'Immediate release'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handlePublishNow(post._id)}
                  disabled={actionLoading === post._id}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1A1613] hover:bg-[#2C2520] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {actionLoading === post._id ? 'Publishing...' : 'Publish Now'}
                </button>

                <button
                  type="button"
                  onClick={() => handleCancelPost(post._id)}
                  disabled={actionLoading === post._id}
                  className="p-2 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-600 transition-colors"
                  title="Cancel Post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
