'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  History,
  Search,
  Filter,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Layers,
  Heart,
  MessageCircle,
} from 'lucide-react';
import SocialHeader from '@/components/admin/social/SocialHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

export default function SocialHistoryPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [retryingId, setRetryingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/admin/social/posts', window.location.origin);
      if (filterStatus !== 'all') url.searchParams.set('status', filterStatus);
      if (searchTerm) url.searchParams.set('search', searchTerm);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setPosts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filterStatus]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleRetryPost = async (id) => {
    try {
      setRetryingId(id);
      setErrorMsg('');

      const res = await fetch(`/api/admin/social/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'retry' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Retry failed');
      }

      setSuccessMsg('Post retried and published successfully!');
      fetchHistory();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Retry failed');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SocialHeader
        title="Post History & Performance"
        subtitle="Complete chronological record of multi-platform social publications and engagement telemetry."
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
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['all', 'posted', 'queued', 'failed', 'draft'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-[#1A1613] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#A3998D] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search caption text..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#EBE5DF] text-xs font-medium text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
          />
        </form>
      </div>

      {/* History Records Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7C7265]">Loading post history...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          No social posts match the selected filter.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
                <tr>
                  <th className="px-5 py-3.5">Media & Content</th>
                  <th className="px-5 py-3.5">Platforms</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Published / Scheduled</th>
                  <th className="px-5 py-3.5">Engagement</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE5DF]">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                    {/* Media & Caption */}
                    <td className="px-5 py-4 max-w-sm">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-[#EBE5DF]">
                          <Image src={post.mediaUrl} alt="Media" fill className="object-cover" />
                        </div>
                        <div className="min-w-0 space-y-0.5">
                          <p className="font-bold text-xs text-[#1A1613] line-clamp-1">
                            {post.captions?.default?.split('\n')[0] || 'Social Post'}
                          </p>
                          {post.productId && (
                            <p className="text-[11px] text-[#A8875E] font-medium truncate">
                              Linked: {post.productId.name}
                            </p>
                          )}
                          {post.errorLog && (
                            <p className="text-[10px] text-red-600 font-mono line-clamp-1">
                              Error: {post.errorLog}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Target Platforms */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {post.platforms?.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded bg-[#FAF8F5] text-[10px] font-bold uppercase tracking-wider text-[#4A4036] border border-[#EBE5DF]"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <StatusBadge status={post.status} size="xs" />
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-4 whitespace-nowrap text-[11px] text-[#7C7265]">
                      {post.publishedAt ? (
                        <span>{new Date(post.publishedAt).toLocaleString()}</span>
                      ) : post.scheduledFor ? (
                        <span>Queued: {new Date(post.scheduledFor).toLocaleString()}</span>
                      ) : (
                        <span>Draft</span>
                      )}
                    </td>

                    {/* Engagement */}
                    <td className="px-5 py-4 whitespace-nowrap text-[11px] text-[#7C7265]">
                      {post.status === 'posted' ? (
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 font-semibold text-[#1A1613]">
                            <Heart className="w-3.5 h-3.5 text-red-500" />
                            {post.engagementStats?.instagram?.likes || '—'}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-[#1A1613]">
                            <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
                            {post.engagementStats?.instagram?.comments || '—'}
                          </span>
                        </div>
                      ) : (
                        <span>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      {post.status === 'failed' && (
                        <button
                          type="button"
                          onClick={() => handleRetryPost(post._id)}
                          disabled={retryingId === post._id}
                          className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1 ml-auto shadow-xs"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === post._id ? 'animate-spin' : ''}`} />
                          {retryingId === post._id ? 'Retrying...' : 'Retry Publish'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
