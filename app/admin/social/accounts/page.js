'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Plus,
  X,
  Sparkles,
} from 'lucide-react';
import SocialHeader from '@/components/admin/social/SocialHeader';
import StatusBadge from '@/components/admin/ui/StatusBadge';

const PLATFORM_CONFIGS = [
  {
    id: 'instagram',
    name: 'Instagram Business',
    desc: 'Feed posts, carousel albums, stories & reels via Meta Graph API',
    iconColor: 'bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700 text-white',
<<<<<<< HEAD
    defaultHandle: '@kbfurniture.studio',
    defaultName: 'KB Furniture Studio',
    defaultAvatar: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
=======
    defaultHandle: '@nordika.studio',
    defaultName: 'Nordika Scandinavian Studio',
    defaultAvatar: 'https://picsum.photos/seed/nordika-avatar/200/200',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
    followers: '24.8K',
  },
  {
    id: 'pinterest',
    name: 'Pinterest Business',
    desc: 'Rich product pins, catalog visual search & interior boards',
    iconColor: 'bg-red-600 text-white',
<<<<<<< HEAD
    defaultHandle: '@kbfurniturehome',
    defaultName: 'KB Furniture Living',
    defaultAvatar: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
=======
    defaultHandle: '@nordikahome',
    defaultName: 'Nordika Scandinavian Living',
    defaultAvatar: 'https://picsum.photos/seed/nordika-avatar/200/200',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
    followers: '41.2K',
  },
  {
    id: 'facebook',
    name: 'Facebook Page',
    desc: 'Official brand storefront page, product collections & video posts',
    iconColor: 'bg-blue-600 text-white',
<<<<<<< HEAD
    defaultHandle: 'KB Furniture',
    defaultName: 'KB Furniture Official Page',
    defaultAvatar: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
=======
    defaultHandle: 'Nordika Scandinavian Furniture',
    defaultName: 'Nordika Studio Official Page',
    defaultAvatar: 'https://picsum.photos/seed/nordika-avatar/200/200',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
    followers: '18.2K',
  },
  {
    id: 'tiktok',
    name: 'TikTok Creator Hub',
    desc: 'Short-form joinery woodworking reels & workshop process showcases',
    iconColor: 'bg-black text-white',
<<<<<<< HEAD
    defaultHandle: '@kbfurnituredesign',
    defaultName: 'KB Furniture Workshop',
    defaultAvatar: 'https://picsum.photos/seed/kb-furniture-avatar/200/200',
=======
    defaultHandle: '@nordikadesign',
    defaultName: 'Nordika Studio Workshop',
    defaultAvatar: 'https://picsum.photos/seed/nordika-avatar/200/200',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
    followers: '52.4K',
  },
];

export default function SocialAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectModalPlatform, setConnectModalPlatform] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/social/accounts');
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data || []);
      }
    } catch (err) {
      console.error('Fetch accounts error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleConnectAccount = async (platformConfig) => {
    try {
      setConnecting(true);
      setErrorMsg('');

      const res = await fetch('/api/admin/social/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: platformConfig.id,
          accountName: platformConfig.defaultName,
          accountHandle: platformConfig.defaultHandle,
          isSimulated: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to connect account');
      }

      setSuccessMsg(`Successfully connected ${platformConfig.name}!`);
      setConnectModalPlatform(null);
      fetchAccounts();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Connection error');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async (accountId) => {
    if (!window.confirm('Disconnect this social media account?')) return;
    try {
      const res = await fetch(`/api/admin/social/accounts/${accountId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Account disconnected.');
        fetchAccounts();
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      setErrorMsg('Failed to disconnect');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SocialHeader
        title="Connected Social Accounts"
        subtitle="Manage OAuth developer integrations and channel authorizations."
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

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLATFORM_CONFIGS.map((config) => {
          const connectedAccount = accounts.find(
            (a) => a.platform === config.id && a.status === 'connected'
          );
          const isConnected = Boolean(connectedAccount);

          return (
            <div
              key={config.id}
              className="bg-white rounded-2xl border border-[#EBE5DF] p-6 shadow-sm flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* Platform Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${config.iconColor}`}
                    >
                      {config.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#1A1613]">{config.name}</h3>
                      <p className="text-xs text-[#7C7265] mt-0.5">{config.desc}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border-gray-200'
                    }`}
                  >
                    {isConnected ? '✓ Connected' : 'Disconnected'}
                  </span>
                </div>

                {/* Account Details if Connected */}
                {isConnected ? (
                  <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EBE5DF] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-600/30">
                        <Image
                          src={connectedAccount.accountAvatarUrl || config.defaultAvatar}
                          alt="Avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1A1613]">
                          {connectedAccount.accountName}
                        </p>
                        <p className="text-[11px] text-[#A8875E] font-medium">
                          {connectedAccount.accountHandle} • {config.followers} followers
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-[#7C7265]">
                      Active Token
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-gray-50 border border-dashed border-gray-300 text-xs text-gray-500">
<<<<<<< HEAD
                    No active account linked. Click &ldquo;Connect&rdquo; to authorize KB Furniture.
=======
                    No active account linked. Click &ldquo;Connect&rdquo; to authorize Nordika Studio.
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#EBE5DF] flex items-center justify-between">
                <span className="text-[11px] text-[#7C7265] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  OAuth Token Encrypted
                </span>

                {isConnected ? (
                  <button
                    type="button"
                    onClick={() => handleDisconnect(connectedAccount._id)}
                    className="px-3.5 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Disconnect
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConnectModalPlatform(config)}
                    className="px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Connect {config.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated OAuth Authorization Modal */}
      {connectModalPlatform && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#EBE5DF] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${connectModalPlatform.iconColor}`}
                >
                  {connectModalPlatform.name.charAt(0)}
                </div>
                <h3 className="text-sm font-bold text-[#1A1613]">
                  Connect {connectModalPlatform.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConnectModalPlatform(null)}
                className="p-1 text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-[#EBE5DF] space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  <Image
                    src={connectModalPlatform.defaultAvatar}
                    alt="Brand Avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1A1613]">
                    {connectModalPlatform.defaultName}
                  </p>
                  <p className="text-[11px] text-[#A8875E] font-medium">
                    {connectModalPlatform.defaultHandle} • Official Brand
                  </p>
                </div>
              </div>
              <p className="text-[11px] text-[#7C7265] leading-relaxed">
<<<<<<< HEAD
                Granting permission allows KB Furniture Publishing Hub to publish photos, reels, and product catalog tags to this channel.
=======
                Granting permission allows Nordika Studio Publishing Hub to publish photos, reels, and product catalog tags to this channel.
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConnectModalPlatform(null)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-bold text-[#4A4036] hover:bg-[#FAF8F5]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConnectAccount(connectModalPlatform)}
                disabled={connecting}
                className="px-5 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {connecting ? 'Authorizing...' : 'Authorize & Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
