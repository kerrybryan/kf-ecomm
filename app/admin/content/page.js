'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Star,
  Mail,
  Download,
  Plus,
  Trash2,
  Edit,
  Save,
  ArrowUpDown,
  CheckCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminModal from '@/components/admin/ui/AdminModal';
import { FormField, TextInput, TextArea, Select } from '@/components/admin/ui/FormControls';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'homepage', 'reviews', 'subscribers'

  // Categories State
  const [categories, setCategories] = useState([]);
  const [categoryModal, setCategoryModal] = useState(null); // null or category object
  const [catSaving, setCatSaving] = useState(false);

  // Homepage Sections State
  const [homepageSettings, setHomepageSettings] = useState({
    bestSellersTitle: "Today's Best Selling",
    bestSellersSubtitle: 'Artisanal creations designed for modern living',
    trendingTitle: 'Trending Now',
    trendingSubtitle: 'What customers are loving this month',
  });
  const [savingHomepage, setSavingHomepage] = useState(false);
  const [homepageSuccess, setHomepageSuccess] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Subscribers State
  const [subscribers, setSubscribers] = useState([]);
  const [subsLoading, setSubsLoading] = useState(false);

  // General Loading & Notification State
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/content/categories');
      const json = await res.json();
      if (json.success) setCategories(json.data);
    } catch (err) {
      console.error('Fetch categories error:', err);
    }
  };

  const fetchHomepageSettings = async () => {
    try {
      const res = await fetch('/api/admin/content/homepage');
      const json = await res.json();
      if (json.success && json.data) {
        setHomepageSettings((prev) => ({
          ...prev,
          ...json.data,
        }));
      }
    } catch (err) {
      console.error('Fetch homepage error:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await fetch('/api/admin/content/reviews');
      const json = await res.json();
      if (json.success) setReviews(json.data);
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setSubsLoading(true);
      const res = await fetch('/api/admin/content/subscribers');
      const json = await res.json();
      if (json.success) setSubscribers(json.data);
    } catch (err) {
      console.error('Fetch subscribers error:', err);
    } finally {
      setSubsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchCategories(), fetchHomepageSettings(), fetchReviews(), fetchSubscribers()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSaveHomepage = async (e) => {
    e.preventDefault();
    try {
      setSavingHomepage(true);
      setHomepageSuccess(false);
      const res = await fetch('/api/admin/content/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageSettings),
      });
      const json = await res.json();
      if (json.success) {
        setHomepageSuccess(true);
        setTimeout(() => setHomepageSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save homepage error:', err);
    } finally {
      setSavingHomepage(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!categoryModal) return;

    try {
      setCatSaving(true);
      const isNew = !categoryModal._id;
      const url = '/api/admin/content/categories';
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryModal),
      });
      const json = await res.json();
      if (json.success) {
        setCategoryModal(null);
        fetchCategories();
      }
    } catch (err) {
      console.error('Save category error:', err);
    } finally {
      setCatSaving(false);
    }
  };

  const handleMoveCategory = async (index, direction) => {
    const newCats = [...categories];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= newCats.length) return;

    const temp = newCats[index];
    newCats[index] = newCats[targetIdx];
    newCats[targetIdx] = temp;

    // Assign new orders
    const reordered = newCats.map((cat, idx) => ({ _id: cat._id, order: idx }));
    setCategories(newCats);

    try {
      await fetch('/api/admin/content/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: reordered }),
      });
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  const handleToggleReviewVerified = async (review) => {
    try {
      const res = await fetch('/api/admin/content/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _id: review._id,
          verifiedPurchase: !review.verifiedPurchase,
        }),
      });
      if (res.ok) fetchReviews();
    } catch (err) {
      console.error('Toggle review error:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    try {
      await fetch(`/api/admin/content/reviews?id=${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const handleExportSubscribersCSV = () => {
    window.location.href = '/api/admin/content/subscribers?format=csv';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
            Content & Visual Merchandising
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Category ordering, homepage spotlights, customer reviews, and newsletter subscribers.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'categories'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Categories ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('homepage')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'homepage'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Homepage Sections
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'reviews'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Reviews Moderation ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('subscribers')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'subscribers'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Newsletter Subscribers ({subscribers.length})
        </button>
      </div>

      {/* TAB 1: CATEGORIES MANAGER */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-zinc-500">
              The order below directly drives the circular category slider on the storefront homepage.
            </p>
            <button
              onClick={() =>
                setCategoryModal({
                  name: '',
                  slug: '',
                  image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
                  icon: 'Armchair',
                  description: '',
                  order: categories.length,
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, idx) => (
              <div
                key={cat._id}
                className="p-4 bg-white rounded-xl border border-zinc-200/80 shadow-xs flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-900 text-xs truncate">{cat.name}</p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate">{cat.slug}</p>
                    <span className="text-[10px] text-[#A8875E] font-medium block">
                      {cat.itemCount || 0} active items
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveCategory(idx, -1)}
                      className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] text-zinc-600 disabled:opacity-30 cursor-pointer"
                      title="Move Left/Up in Homepage Slider"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMoveCategory(idx, 1)}
                      className="px-1.5 py-0.5 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] text-zinc-600 disabled:opacity-30 cursor-pointer"
                      title="Move Right/Down in Homepage Slider"
                    >
                      ▼
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCategoryModal(cat)}
                    className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOMEPAGE SECTIONS */}
      {activeTab === 'homepage' && (
        <form onSubmit={handleSaveHomepage} className="max-w-3xl space-y-6">
          {homepageSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Homepage spotlight copy updated successfully!</span>
            </div>
          )}

          <AdminCard
            title="Today's Best Selling Section"
            subtitle="Configure titles and subtitles displayed above the primary filterable product grid"
          >
            <div className="space-y-4">
              <FormField label="Section Title">
                <TextInput
                  value={homepageSettings.bestSellersTitle}
                  onChange={(e) =>
                    setHomepageSettings({ ...homepageSettings, bestSellersTitle: e.target.value })
                  }
                  placeholder="Today's Best Selling"
                />
              </FormField>

              <FormField label="Section Subtitle / Tagline">
                <TextInput
                  value={homepageSettings.bestSellersSubtitle}
                  onChange={(e) =>
                    setHomepageSettings({
                      ...homepageSettings,
                      bestSellersSubtitle: e.target.value,
                    })
                  }
                  placeholder="Artisanal creations designed for modern living"
                />
              </FormField>
            </div>
          </AdminCard>

          <AdminCard
            title="Trending Now Spotlight"
            subtitle="Configure headlines for the curated secondary product showcase section"
          >
            <div className="space-y-4">
              <FormField label="Section Title">
                <TextInput
                  value={homepageSettings.trendingTitle}
                  onChange={(e) =>
                    setHomepageSettings({ ...homepageSettings, trendingTitle: e.target.value })
                  }
                  placeholder="Trending Now"
                />
              </FormField>

              <FormField label="Section Subtitle / Tagline">
                <TextInput
                  value={homepageSettings.trendingSubtitle}
                  onChange={(e) =>
                    setHomepageSettings({
                      ...homepageSettings,
                      trendingSubtitle: e.target.value,
                    })
                  }
                  placeholder="What customers are loving this month"
                />
              </FormField>
            </div>
          </AdminCard>

          <button
            type="submit"
            disabled={savingHomepage}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingHomepage ? 'Saving...' : 'Save Homepage Copy'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: REVIEWS MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="divide-y divide-zinc-100 bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
            {reviewsLoading ? (
              <div className="p-8 text-center text-xs text-zinc-400">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">No reviews found.</div>
            ) : (
              reviews.map((rev) => (
                <div key={rev._id} className="p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-bold text-xs text-zinc-900">{rev.title}</span>
                      {rev.verifiedPurchase && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                          Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed">{rev.comment}</p>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <span>By {rev.customerName}</span>
                      {rev.productId?.name && <span>• Product: {rev.productId.name}</span>}
                      <span>• {new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => handleToggleReviewVerified(rev)}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                    >
                      {rev.verifiedPurchase ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev._id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: NEWSLETTER SUBSCRIBERS */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-zinc-500">
              Collected customer emails from the store footer newsletter form.
            </p>
            <button
              onClick={handleExportSubscribersCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-semibold text-zinc-700 shadow-xs cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#A8875E]" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Subscriber Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Source</th>
                  <th className="px-5 py-3">Subscribed On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {subsLoading ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-zinc-400">
                      Loading subscriber list...
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-zinc-400">
                      No subscribers collected yet.
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr key={sub._id} className="hover:bg-zinc-50">
                      <td className="px-5 py-3.5 font-bold text-zinc-900 font-mono">{sub.email}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={sub.status} size="xs" />
                      </td>
                      <td className="px-5 py-3.5 text-zinc-500 capitalize">{sub.source || 'footer'}</td>
                      <td className="px-5 py-3.5 text-zinc-500">
                        {new Date(sub.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Edit / Create Modal */}
      <AdminModal
        isOpen={!!categoryModal}
        onClose={() => setCategoryModal(null)}
        title={categoryModal?._id ? `Edit Category: ${categoryModal.name}` : 'Create New Category'}
        subtitle="Categories are shown in the circular homepage carousel and filter lists"
        footer={
          <>
            <button
              onClick={() => setCategoryModal(null)}
              disabled={catSaving}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCategory}
              disabled={catSaving}
              className="px-5 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {catSaving ? 'Saving...' : 'Save Category'}
            </button>
          </>
        }
      >
        {categoryModal && (
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <FormField label="Category Name" required>
              <TextInput
                value={categoryModal.name}
                onChange={(e) =>
                  setCategoryModal({
                    ...categoryModal,
                    name: e.target.value,
                    slug: categoryModal.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  })
                }
                placeholder="e.g. Seating"
                required
              />
            </FormField>

            <FormField label="Slug (URL Path)" required>
              <TextInput
                value={categoryModal.slug}
                onChange={(e) => setCategoryModal({ ...categoryModal, slug: e.target.value })}
                placeholder="e.g. living-room"
                required
              />
            </FormField>

            <FormField label="Image URL" required>
              <TextInput
                value={categoryModal.image}
                onChange={(e) => setCategoryModal({ ...categoryModal, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                required
              />
            </FormField>

            <FormField label="Category Description">
              <TextArea
                rows={2}
                value={categoryModal.description}
                onChange={(e) => setCategoryModal({ ...categoryModal, description: e.target.value })}
                placeholder="Sculptural bouclé sofas and minimalist lounge chairs..."
              />
            </FormField>
          </form>
        )}
      </AdminModal>
    </div>
  );
}
