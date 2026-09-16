'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  Share2,
  ThumbsUp,
  MoreHorizontal,
  Music2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function PlatformPreviewCards({
  mediaUrl,
  mediaType = 'image',
  captions = {},
  selectedPlatforms = ['instagram', 'pinterest'],
  product = null,
}) {
  const [activePlatformTab, setActivePlatformTab] = useState(
    selectedPlatforms[0] || 'instagram'
  );

  const currentCaption =
    captions[activePlatformTab] ||
    captions.default ||
    'KB Furniture Scandinavian Luxury Furniture Piece. Handcrafted for intentional modern living. ✨\n\n#NordicDesign #ScandinavianLiving #KBFurniture';

  const defaultAvatar = 'https://picsum.photos/seed/kb-furniture-avatar/200/200';
  const displayMedia =
    mediaUrl || 'https://picsum.photos/seed/kb-furniture-sofa/800/800';

  return (
    <div className="bg-white rounded-2xl border border-[#EBE5DF] shadow-sm overflow-hidden flex flex-col">
      {/* Header & Platform Selector Tabs */}
      <div className="px-5 py-3.5 border-b border-[#EBE5DF] flex items-center justify-between bg-[#FAF8F5]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#A8875E]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1613]">
            Live Device Mockup Preview
          </h3>
        </div>

        {/* Preview Platform Switcher */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#EBE5DF]">
          {['instagram', 'pinterest', 'facebook', 'tiktok'].map((platform) => (
            <button
              key={platform}
              type="button"
              onClick={() => setActivePlatformTab(platform)}
              className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                activePlatformTab === platform
                  ? 'bg-[#1A1613] text-white shadow-xs'
                  : 'text-[#7C7265] hover:text-[#1A1613]'
              }`}
            >
              {platform}
            </button>
          ))}
        </div>
      </div>

      {/* Mockup Canvas Container */}
      <div className="p-6 flex items-center justify-center bg-[#F3ECE1]/40 min-h-[460px]">
        {/* 1. INSTAGRAM FEED PREVIEW */}
        {activePlatformTab === 'instagram' && (
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EBE5DF] shadow-xl overflow-hidden text-[#1A1613] text-xs">
            {/* IG Header */}
            <div className="px-3.5 py-2.5 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-600/30 p-0.5 ring-1 ring-amber-500">
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image src={defaultAvatar} alt="KB Furniture" fill className="object-cover" />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-[11px] leading-tight">kbfurniture.studio</p>
                  <p className="text-[9px] text-gray-500">Seattle, Washington</p>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </div>

            {/* IG Media */}
            <div className="relative aspect-square w-full bg-stone-100">
              <Image src={displayMedia} alt="Post Media" fill className="object-cover" />
            </div>

            {/* IG Actions */}
            <div className="px-3.5 py-2 flex items-center justify-between text-gray-800">
              <div className="flex items-center gap-3">
                <Heart className="w-4 h-4 hover:text-red-500 cursor-pointer" />
                <MessageCircle className="w-4 h-4 hover:text-gray-900 cursor-pointer" />
                <Send className="w-4 h-4 hover:text-gray-900 cursor-pointer" />
              </div>
              <Bookmark className="w-4 h-4 hover:text-gray-900 cursor-pointer" />
            </div>

            {/* IG Caption Content */}
            <div className="px-3.5 pb-3.5 space-y-1">
              <p className="font-bold text-[11px]">1,284 likes</p>
              <p className="text-[11px] leading-relaxed whitespace-pre-line">
                <span className="font-bold mr-1.5">kbfurniture.studio</span>
                {currentCaption}
              </p>
              <p className="text-[9px] uppercase tracking-wider text-gray-400 pt-1">
                2 hours ago • KB Furniture Studio Original
              </p>
            </div>
          </div>
        )}

        {/* 2. PINTEREST PIN PREVIEW */}
        {activePlatformTab === 'pinterest' && (
          <div className="w-full max-w-xs bg-white rounded-3xl border border-[#EBE5DF] shadow-xl overflow-hidden text-[#1A1613]">
            {/* Pin Media Container */}
            <div className="relative aspect-[3/4] w-full bg-stone-100 group">
              <Image src={displayMedia} alt="Pin Media" fill className="object-cover" />
              <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                Save
              </div>
            </div>

            {/* Pin Metadata */}
            <div className="p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span className="font-semibold text-gray-700">kbfurniture.com</span>
                <ExternalLink className="w-3 h-3" />
              </div>
              <h4 className="font-bold text-sm text-[#1A1613] leading-snug">
                {product?.name || 'KB Furniture Scandinavian Studio Collection'}
              </h4>
              <p className="text-[11px] text-gray-600 line-clamp-3 leading-relaxed whitespace-pre-line">
                {currentCaption}
              </p>
              <div className="pt-2 flex items-center gap-2 border-t border-gray-100">
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image src={defaultAvatar} alt="KB Furniture" fill className="object-cover" />
                </div>
                <span className="text-[11px] font-bold text-gray-700">KB Furniture Scandinavian Living</span>
              </div>
            </div>
          </div>
        )}

        {/* 3. FACEBOOK FEED PREVIEW */}
        {activePlatformTab === 'facebook' && (
          <div className="w-full max-w-sm bg-white rounded-2xl border border-[#EBE5DF] shadow-xl overflow-hidden text-[#1A1613] text-xs">
            {/* FB Page Header */}
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image src={defaultAvatar} alt="KB Furniture" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs">KB Furniture Scandinavian Studio</span>
                    <span className="text-blue-500 font-bold text-[10px]">✓</span>
                  </div>
                  <span className="text-[10px] text-gray-500">Just now • 🌍</span>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </div>

            {/* FB Caption */}
            <div className="px-3.5 pb-2.5 text-xs leading-relaxed whitespace-pre-line text-gray-900">
              {currentCaption}
            </div>

            {/* FB Media */}
            <div className="relative aspect-video w-full bg-stone-100">
              <Image src={displayMedia} alt="Facebook Media" fill className="object-cover" />
            </div>

            {/* FB Action Bar */}
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-around text-gray-600 font-semibold text-[11px]">
              <button type="button" className="flex items-center gap-1.5 hover:text-blue-600">
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Like</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-blue-600">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Comment</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-blue-600">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}

        {/* 4. TIKTOK REEL / VIDEO PREVIEW */}
        {activePlatformTab === 'tiktok' && (
          <div className="relative w-[260px] h-[480px] rounded-3xl border-4 border-black bg-black shadow-2xl overflow-hidden text-white flex flex-col justify-between">
            {/* Background Media */}
            <div className="absolute inset-0 bg-stone-900">
              <Image src={displayMedia} alt="TikTok Media" fill className="object-cover opacity-90" />
            </div>

            {/* Top Navigation */}
            <div className="relative p-3 flex justify-center text-xs font-bold gap-3 drop-shadow">
              <span className="text-gray-300">Following</span>
              <span className="border-b-2 border-white pb-0.5">For You</span>
            </div>

            {/* Floating Right Actions */}
            <div className="relative self-end px-3 space-y-3.5 flex flex-col items-center drop-shadow-md">
              <div className="relative w-8 h-8 rounded-full border border-white overflow-hidden">
                <Image src={defaultAvatar} alt="KB Furniture" fill className="object-cover" />
              </div>
              <div className="flex flex-col items-center">
                <Heart className="w-5 h-5 text-white fill-white/20" />
                <span className="text-[10px] font-bold mt-0.5">24.5K</span>
              </div>
              <div className="flex flex-col items-center">
                <MessageCircle className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold mt-0.5">382</span>
              </div>
              <div className="flex flex-col items-center">
                <Bookmark className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold mt-0.5">1,490</span>
              </div>
              <div className="flex flex-col items-center">
                <Share2 className="w-5 h-5 text-white" />
                <span className="text-[10px] font-bold mt-0.5">Share</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 border-2 border-white flex items-center justify-center animate-spin">
                <Music2 className="w-3.5 h-3.5 text-white" />
              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="relative p-3 space-y-1 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <p className="font-bold text-xs">@kbfurnituredesign</p>
              <p className="text-[10px] line-clamp-2 leading-snug drop-shadow-sm">
                {currentCaption.split('\n')[0]}
              </p>
              <div className="flex items-center gap-1.5 text-[9px] text-gray-300 pt-0.5">
                <Music2 className="w-3 h-3 animate-pulse" />
                <span className="truncate">KB Furniture Studio • Original Audio</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
