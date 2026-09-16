'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Shield,
  Truck,
  CreditCard,
  Image as ImageIcon,
  UserPlus,
  Save,
  CheckCircle,
  AlertCircle,
  Lock,
  Mail,
  User,
  Trash2,
  Edit,
} from 'lucide-react';
import AdminCard from '@/components/admin/ui/AdminCard';
import StatusBadge from '@/components/admin/ui/StatusBadge';
import AdminModal from '@/components/admin/ui/AdminModal';
import { FormField, TextInput, TextArea, Select, Toggle } from '@/components/admin/ui/FormControls';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('store'); // 'store', 'users', 'branding'
  const [settings, setSettings] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(false);
  const [storeSuccess, setStoreSuccess] = useState(false);
  const [error, setError] = useState('');

  // New Admin User Modal State
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'product_manager',
    phone: '',
    notes: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/admin/settings/users');
      const json = await res.json();
      if (json.success) setAdminUsers(json.data);
    } catch (err) {
      console.error('Fetch admin users error:', err);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchSettings(), fetchAdminUsers()]).finally(() => setLoading(false));
  }, []);

  const handleSaveStoreSettings = async (e) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSavingStore(true);
      setStoreSuccess(false);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setStoreSuccess(true);
        setTimeout(() => setStoreSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save store settings error:', err);
    } finally {
      setSavingStore(false);
    }
  };

  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    try {
      setCreatingUser(true);
      setError('');
      const res = await fetch('/api/admin/settings/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to create user');
      }

      setUserModalOpen(false);
      setNewUser({
        name: '',
        email: '',
        password: '',
        role: 'product_manager',
        phone: '',
        notes: '',
      });
      fetchAdminUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingUser(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await fetch('/api/admin/settings/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: user._id, status: newStatus }),
      });
      fetchAdminUsers();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading studio settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
            Studio & Store Configuration
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Shipping logic, tax rules, staff RBAC permissions, and brand assets.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200">
        <button
          onClick={() => setActiveTab('store')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'store'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Store Rules & Fulfillment
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Staff Accounts & RBAC ({adminUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`pb-3.5 px-4 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'branding'
              ? 'border-[#A8875E] text-[#A8875E]'
              : 'border-transparent text-zinc-400 hover:text-zinc-700'
          }`}
        >
          Brand & Watermarks
        </button>
      </div>

      {/* TAB 1: STORE RULES & FULFILLMENT */}
      {activeTab === 'store' && settings && (
        <form onSubmit={handleSaveStoreSettings} className="space-y-6">
          {storeSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Store parameters updated and applied across checkout!</span>
            </div>
          )}

          {/* Shipping Rates */}
          <AdminCard
            title="White-Glove Shipping & Delivery Rules"
            subtitle="Configure freight calculation thresholds used at checkout"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Standard Flat Rate Shipping ($ USD)">
                <TextInput
                  type="number"
                  min="0"
                  value={settings.shippingRules?.flatRate ?? 150}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingRules: {
                        ...settings.shippingRules,
                        flatRate: Number(e.target.value),
                      },
                    })
                  }
                />
              </FormField>

              <FormField label="Free Shipping Threshold ($ USD)" helperText="Orders above this amount receive complimentary freight">
                <TextInput
                  type="number"
                  min="0"
                  value={settings.shippingRules?.freeShippingThreshold ?? 2000}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingRules: {
                        ...settings.shippingRules,
                        freeShippingThreshold: Number(e.target.value),
                      },
                    })
                  }
                />
              </FormField>

              <FormField label="Expedited Courier Surcharge ($ USD)">
                <TextInput
                  type="number"
                  min="0"
                  value={settings.shippingRules?.expeditedRate ?? 350}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingRules: {
                        ...settings.shippingRules,
                        expeditedRate: Number(e.target.value),
                      },
                    })
                  }
                />
              </FormField>

              <FormField label="White-Glove In-Home Assembly ($ USD)">
                <TextInput
                  type="number"
                  min="0"
                  value={settings.shippingRules?.whiteGloveRate ?? 450}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      shippingRules: {
                        ...settings.shippingRules,
                        whiteGloveRate: Number(e.target.value),
                      },
                    })
                  }
                />
              </FormField>
            </div>
          </AdminCard>

          {/* Payment Gateways Toggle */}
          <AdminCard
            title="Accepted Payment Methods"
            subtitle="Enable or disable payment options rendered at customer checkout"
          >
            <div className="space-y-4">
              <Toggle
                label="Credit & Debit Cards (Stripe / Visa / MasterCard / AMEX)"
                description="Secure 256-bit tokenized card processing"
                checked={settings.paymentMethods?.creditCard ?? true}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, creditCard: checked },
                  })
                }
              />

              <Toggle
                label="Apple Pay / Mobile Wallet"
                description="One-touch biometrics on iOS and Safari"
                checked={settings.paymentMethods?.applePay ?? true}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, applePay: checked },
                  })
                }
              />

              <Toggle
                label="Direct Bank Wire / ACH Transfer"
                description="Suitable for large trade and contract architectural orders"
                checked={settings.paymentMethods?.bankTransfer ?? true}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, bankTransfer: checked },
                  })
                }
              />

              <Toggle
                label="Cash on Delivery (COD)"
                description="Available exclusively for verified Seattle metropolitan zip codes"
                checked={settings.paymentMethods?.cashOnDelivery ?? false}
                onChange={(checked) =>
                  setSettings({
                    ...settings,
                    paymentMethods: { ...settings.paymentMethods, cashOnDelivery: checked },
                  })
                }
              />
            </div>
          </AdminCard>

          {/* Currency & Contact */}
          <AdminCard title="Studio Contact & Currency">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Studio Trade Name">
                <TextInput
                  value={settings.storeName || ''}
                  onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                />
              </FormField>

              <FormField label="Concierge Email">
                <TextInput
                  value={settings.storeEmail || ''}
                  onChange={(e) => setSettings({ ...settings, storeEmail: e.target.value })}
                />
              </FormField>

              <FormField label="Store Phone">
                <TextInput
                  value={settings.storePhone || ''}
                  onChange={(e) => setSettings({ ...settings, storePhone: e.target.value })}
                />
              </FormField>

              <FormField label="Default Currency Symbol & Code">
                <div className="flex gap-2">
                  <TextInput
                    value={settings.currency?.symbol || '$'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, symbol: e.target.value },
                      })
                    }
                    className="w-20"
                  />
                  <TextInput
                    value={settings.currency?.code || 'USD'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        currency: { ...settings.currency, code: e.target.value },
                      })
                    }
                    className="flex-1"
                  />
                </div>
              </FormField>
            </div>
          </AdminCard>

          <button
            type="submit"
            disabled={savingStore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingStore ? 'Saving...' : 'Save Store Rules'}</span>
          </button>
        </form>
      )}

      {/* TAB 2: ADMIN USERS & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-zinc-800">
                Authorized Studio Staff & Roles
              </p>
              <p className="text-[11px] text-zinc-500">
                RBAC restricts dashboard sections based on role permissions.
              </p>
            </div>

            <button
              onClick={() => {
                setError('');
                setUserModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Invite Staff</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-700">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Staff Member</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Login</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-normal">
                {adminUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-zinc-50">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-zinc-900">{u.name}</p>
                      <p className="text-[11px] text-zinc-400">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.role} size="xs" />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={u.status || 'active'} size="xs" />
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never logged in'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
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

      {/* TAB 3: BRAND ASSETS */}
      {activeTab === 'branding' && settings && (
        <form onSubmit={handleSaveStoreSettings} className="max-w-2xl space-y-6">
          <AdminCard
            title="Studio Logo & Watermark Assets"
            subtitle="Manage vector graphics and watermarks used in exports and Image Studio"
          >
            <div className="space-y-4">
              <FormField label="Primary Light Logo URL">
                <TextInput
                  value={settings.branding?.logoUrl || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, logoUrl: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </FormField>

              <FormField label="Dark Background Logo URL">
                <TextInput
                  value={settings.branding?.darkLogoUrl || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, darkLogoUrl: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </FormField>

              <FormField label="Image Studio Watermark URL" helperText="Used in Phase 3 Image Studio rendering">
                <TextInput
                  value={settings.branding?.watermarkUrl || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      branding: { ...settings.branding, watermarkUrl: e.target.value },
                    })
                  }
                  placeholder="https://..."
                />
              </FormField>
            </div>
          </AdminCard>

          <button
            type="submit"
            disabled={savingStore}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{savingStore ? 'Saving...' : 'Save Brand Assets'}</span>
          </button>
        </form>
      )}

      {/* Create Admin User Modal */}
      <AdminModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Invite New Staff Administrator"
        subtitle="Provision a role-restricted account for internal staff"
        footer={
          <>
            <button
              onClick={() => setUserModalOpen(false)}
              disabled={creatingUser}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAdminUser}
              disabled={creatingUser}
              className="px-5 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              {creatingUser ? 'Creating...' : 'Create Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAdminUser} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {error}
            </div>
          )}

          <FormField label="Full Name" required>
            <TextInput
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Elsa Bergman"
              required
            />
          </FormField>

          <FormField label="Work Email" required>
            <TextInput
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="e.g. elsa@kbfurniture.com"
              required
            />
          </FormField>

          <FormField label="Initial Password" required>
            <TextInput
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="••••••••••••"
              required
            />
          </FormField>

          <FormField label="Staff Role Assignment" required>
            <Select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              options={[
                { value: 'product_manager', label: 'Product Manager (Catalog, Specs, Homepage)' },
                { value: 'sales_manager', label: 'Sales Director (Orders, Agents, Quotes)' },
                { value: 'support', label: 'Support Concierge (Orders, Customer Files)' },
                { value: 'super_admin', label: 'Super Admin (Unrestricted System Access)' },
              ]}
            />
          </FormField>

          <FormField label="Staff Phone">
            <TextInput
              value={newUser.phone}
              onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
              placeholder="+1 (206) 555-0199"
            />
          </FormField>
        </form>
      </AdminModal>
    </div>
  );
}
