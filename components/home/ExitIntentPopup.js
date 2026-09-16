'use client';

import React, { useState, useEffect } from 'react';

/**
 * ExitIntentPopup — shows a discount offer when user moves mouse toward browser top/exit
 * Triggers once per session using sessionStorage.
 */
export default function ExitIntentPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (typeof window !== 'undefined' && sessionStorage.getItem('exit-popup-shown')) return;

    const handleMouseLeave = (e) => {
      if (e.clientY <= 10 && !dismissed) {
        setVisible(true);
        sessionStorage.setItem('exit-popup-shown', 'true');
      }
    };

    // Fallback: also show after 45 seconds of inactivity
    const timer = setTimeout(() => {
      if (!dismissed && !sessionStorage.getItem('exit-popup-shown')) {
        setVisible(true);
        sessionStorage.setItem('exit-popup-shown', 'true');
      }
    }, 45000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timer);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'exit-popup', discount: 'WELCOME10' }),
      });
    } catch (_) {}
    setSubmitted(true);
    setTimeout(() => {
      setVisible(false);
    }, 3000);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998] transition-opacity"
        onClick={handleDismiss}
      />

      {/* Popup Card */}
      <div
        id="exit-intent-popup"
        className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md mx-4"
        style={{ animation: 'popupIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            id="exit-popup-close"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/8 hover:bg-black/15 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors z-10"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Top image band */}
          <div className="relative h-36 bg-[#1F1A15] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=75"
              alt="KB Furniture living room"
              className="w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1F1A15]/80" />
            {/* Badge */}
            <div className="absolute bottom-4 left-6">
              <span className="inline-flex items-center gap-1.5 bg-[#D99A2B] text-[#1F1A15] text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Special Offer
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {!submitted ? (
              <>
                <h2 className="text-2xl font-extrabold text-[#1F1A15] tracking-tight leading-tight">
                  Before you go —
                  <br />
                  <span className="text-[#B8551F]">get 10% off</span> your first order
                </h2>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  Enter your email and we&apos;ll send you code{' '}
                  <span className="font-bold text-[#1F1A15] font-mono">WELCOME10</span> instantly.
                  Valid on all solid wood furniture.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
                  <input
                    id="exit-popup-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 border-2 border-[#E5DDD3] focus:border-[#B8551F] rounded-xl px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none transition-colors"
                  />
                  <button
                    type="submit"
                    id="exit-popup-submit"
                    className="bg-[#B8551F] hover:bg-[#8F4116] text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors whitespace-nowrap"
                  >
                    Get 10% Off
                  </button>
                </form>

                <button
                  onClick={handleDismiss}
                  className="mt-4 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors"
                >
                  No thanks, I&apos;ll pay full price
                </button>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-[#E9F1E6] flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-[#4C7A3D]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#1F1A15]">Code sent! Check your inbox.</h3>
                <p className="text-sm text-stone-500 mt-1">
                  Use <span className="font-mono font-bold text-[#B8551F]">WELCOME10</span> at checkout.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translate(-50%, -45%) scale(0.92); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  );
}
