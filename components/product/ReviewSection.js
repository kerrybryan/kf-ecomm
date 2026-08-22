'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, X, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ReviewSection({ productId, initialReviews = [], averageRating = 5.0, reviewCount = 0 }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [modalOpen, setModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) {
      addToast('Please enter your name and review comment.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          customerName,
          customerEmail,
          rating,
          title,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setReviews([data.data, ...reviews]);
      addToast('Thank you! Your verified review has been published.', 'success');
      setModalOpen(false);
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setTitle('');
      setComment('');
      setRating(5);
    } catch (err) {
      addToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-12 border-t border-stone-200" id="reviews">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-serif-luxury font-bold text-stone-900">
            Customer Reviews & Experiences
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= Math.round(averageRating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-bold text-stone-900">{averageRating.toFixed(1)} out of 5</span>
            <span className="text-stone-400 text-xs">({reviews.length || reviewCount} verified reviews)</span>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-stone-900 text-white hover:bg-stone-800 text-xs font-semibold px-6 py-3 rounded-xl uppercase tracking-wider transition-colors shadow-sm"
        >
          Write a Review
        </button>
      </div>

      {/* Review List */}
      {reviews.length === 0 ? (
        <div className="bg-stone-50 rounded-2xl p-8 text-center border border-stone-200/80">
          <MessageSquare className="w-8 h-8 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-stone-700">Be the first to review this piece</p>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Share your interior styling experience and craftsmanship feedback with the community.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev._id || rev.comment}
              className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-stone-400">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Verified Buyer'}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="text-sm font-semibold text-stone-900 mb-1.5">{rev.title}</h4>
                )}
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                <span className="font-semibold text-stone-900">{rev.customerName}</span>
                {rev.verifiedPurchase && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Verified Purchase
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-serif-luxury font-bold text-stone-900 mb-1">
              Write a Verified Review
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Your honest feedback helps fellow connoisseurs furnish their spaces.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star rating selector */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-stone-300 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-stone-700 ml-2">
                    {rating} of 5 Stars
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Henrik L."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="henrik@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flawless craftsmanship and stunning wood grain"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Detailed Experience *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about the comfort, finish, wood quality, delivery, and styling..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:outline-none focus:border-stone-900 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-stone-900 text-white hover:bg-stone-800 disabled:opacity-50 py-3 rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors shadow-md"
                >
                  {submitting ? 'Publishing...' : 'Submit Verified Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
