'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react';
import SocialHeader from '@/components/admin/social/SocialHeader';

const AVAILABLE_PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: 'text-pink-600' },
  { id: 'pinterest', name: 'Pinterest', color: 'text-red-600' },
  { id: 'facebook', name: 'Facebook', color: 'text-blue-600' },
  { id: 'tiktok', name: 'TikTok', color: 'text-gray-900' },
];

export default function SocialAutomationPage() {
  const [rule, setRule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [mode, setMode] = useState('review_queue'); // 'review_queue' | 'auto_publish'
  const [defaultPlatforms, setDefaultPlatforms] = useState(['instagram', 'pinterest', 'facebook']);
  const [captionTemplate, setCaptionTemplate] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/social/automation');
      const data = await res.json();
      if (data.success && data.data) {
        setRule(data.data);
        setEnabled(data.data.enabled ?? true);
        setMode(data.data.mode || 'review_queue');
        setDefaultPlatforms(data.data.defaultPlatforms || ['instagram', 'pinterest', 'facebook']);
        setCaptionTemplate(data.data.defaultCaptionTemplate || '');
      }
    } catch (err) {
      console.error('Fetch automation rule error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handlePlatformToggle = (platformId) => {
    setDefaultPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId]
    );
  };

  const handleInsertTag = (tag) => {
    setCaptionTemplate((prev) => `${prev} ${tag}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setErrorMsg('');
      setSuccessMsg('');

      const res = await fetch('/api/admin/social/automation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled,
          mode,
          defaultPlatforms,
          defaultCaptionTemplate: captionTemplate,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save automation rules');
      }

      setSuccessMsg('Product launch automation settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Save error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <SocialHeader
        title="Product Launch Automation Rules"
        subtitle="Configure automatic social post creation when new furniture products are released."
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-[#7C7265]">Loading automation rules...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Main Automation Trigger Card */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm space-y-6">
            {/* Master Toggle */}
            <div className="flex items-start justify-between border-b border-[#EBE5DF] pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#A8875E]" />
                  <h3 className="text-sm font-bold text-[#1A1613]">
                    Auto-Post on New Product Release
                  </h3>
                </div>
                <p className="text-xs text-[#7C7265]">
                  When a product transitions from <strong>Draft → Published</strong> in Catalog Management, automatically trigger social media workflow.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#A8875E]" />
              </label>
            </div>

            {/* Execution Mode Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                Workflow Execution Mode
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Review Before Posting (Default) */}
                <div
                  onClick={() => setMode('review_queue')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    mode === 'review_queue'
                      ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
                      : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#1A1613]">Review Before Posting (Recommended)</p>
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Human in the loop
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7C7265] leading-relaxed">
                      Creates a draft post in the Publish Queue with rendered AI captions and Image Studio media for team inspection and 1-click approval.
                    </p>
                  </div>
                </div>

                {/* Option 2: Fully Automatic */}
                <div
                  onClick={() => setMode('auto_publish')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    mode === 'auto_publish'
                      ? 'border-[#A8875E] bg-[#FAF8F5] ring-1 ring-[#A8875E]'
                      : 'border-[#EBE5DF] bg-white hover:border-[#D5CCC2]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-[#1A1613]">Instant Auto-Publish</p>
                    <p className="text-[11px] text-[#7C7265] leading-relaxed">
                      Immediately pushes posts out to all connected channels the instant a product is made live on the storefront.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Default Target Platforms */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                Default Target Platforms
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {AVAILABLE_PLATFORMS.map((plat) => {
                  const isSelected = defaultPlatforms.includes(plat.id);
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

            {/* Caption Template Builder */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
                  Default Caption Template
                </label>
                <span className="text-[11px] text-[#7C7265]">Click tag to insert into template</span>
              </div>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleInsertTag('{productName}')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#A8875E] hover:text-white border border-[#D5CCC2] text-xs font-mono text-[#4A4036] transition-all"
                >
                  + {'{productName}'}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('{price}')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#A8875E] hover:text-white border border-[#D5CCC2] text-xs font-mono text-[#4A4036] transition-all"
                >
                  + {'{price}'}
                </button>
                <button
                  type="button"
                  onClick={() => handleInsertTag('{material}')}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#A8875E] hover:text-white border border-[#D5CCC2] text-xs font-mono text-[#4A4036] transition-all"
                >
                  + {'{material}'}
                </button>
              </div>

              <textarea
                rows={5}
                value={captionTemplate}
                onChange={(e) => setCaptionTemplate(e.target.value)}
                placeholder="Write your template with dynamic tags..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CCC2] text-xs leading-relaxed text-[#1A1613] focus:outline-none focus:border-[#A8875E]"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="bg-white rounded-2xl border border-[#EBE5DF] p-5 flex items-center justify-between shadow-sm">
            <span className="text-xs text-[#7C7265] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Automations run server-side with verified brand assets.
            </span>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving Rules...' : 'Save Automation Rules'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
