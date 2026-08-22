'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Star,
  Wand2,
  ShieldAlert,
} from 'lucide-react';
import { FormField, TextInput, TextArea, Select, Toggle, TagInput } from '../ui/FormControls';
import AdminCard from '../ui/AdminCard';

export default function ProductForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    category: initialData?.category || 'living-room',
    price: initialData?.price !== undefined ? initialData.price : '',
    originalPrice: initialData?.originalPrice || '',
    description: initialData?.description || '',
    images: initialData?.images || ['https://picsum.photos/seed/nordika-sofa/800/800'],
    colors: initialData?.colors || ['Natural Oak', 'Oatmeal Bouclé'],
    materials: initialData?.materials || ['Solid European Oak', 'Bouclé Fabric'],
    specs: {
      dimensions: initialData?.specs?.dimensions || '',
      weight: initialData?.specs?.weight || '',
      materialDetails: initialData?.specs?.materialDetails || '',
      warranty: initialData?.specs?.warranty || '5-Year Manufacturer Warranty',
      assembly: initialData?.specs?.assembly || 'Minimal assembly required (Tools included)',
      care: initialData?.specs?.care || 'Wipe clean with a soft dry cloth.',
    },
    inStock: initialData?.inStock !== undefined ? initialData.inStock : true,
    stockCount: initialData?.stockCount !== undefined ? initialData.stockCount : 15,
    status: initialData?.status || 'published',
    isFeatured: initialData?.isFeatured || false,
    isBestSeller: initialData?.isBestSeller || false,
    trending: initialData?.trending || false,
    isReferenceImage: initialData?.isReferenceImage || false,
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/admin/content/categories');
        const json = await res.json();
        if (json.success && json.data?.length > 0) {
          setCategories(json.data);
          if (!formData.category) {
            setFormData((prev) => ({ ...prev, category: json.data[0].slug }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug when name changes if not manually set
  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    const autoSlug = nameVal
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    setFormData((prev) => ({
      ...prev,
      name: nameVal,
      slug: !isEdit || prev.slug === '' ? autoSlug : prev.slug,
    }));
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImageUrl.trim()],
      }));
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetPrimaryImage = (index) => {
    const primary = formData.images[index];
    const rest = formData.images.filter((_, idx) => idx !== index);
    setFormData((prev) => ({
      ...prev,
      images: [primary, ...rest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.name.trim()) throw new Error('Product name is required');
      if (formData.price === '' || isNaN(formData.price)) throw new Error('Valid price is required');
      if (formData.images.length === 0) throw new Error('At least one image URL is required');

      if (formData.status === 'published' && formData.isReferenceImage) {
        throw new Error(
          'Publishing Blocked: The primary photo is flagged as an unedited reference image. To protect brand integrity and copyright, please brand the image in Image Studio or keep status as Draft.'
        );
      }

      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stockCount: Number(formData.stockCount),
      };

      const url = isEdit ? `/api/admin/products/${initialData._id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save product');
      }

      setSuccess(isEdit ? 'Product updated successfully!' : 'Product created successfully!');
      setTimeout(() => {
        router.push('/admin/products');
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-xl text-zinc-600 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">
              {isEdit ? `Edit: ${initialData?.name}` : 'Create New Product'}
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              Fill in product information, photography, and technical specifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-[#A8875E] hover:bg-[#8F724E] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Reference Image Safeguard Warning Banner */}
      {formData.isReferenceImage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-950">
                Reference Image Safeguard Active
              </p>
              <p className="text-[11px] text-amber-800">
                This listing uses an unedited external reference photo. Live storefront publishing is blocked until the image is branded in Image Studio.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/image-studio?productId=${initialData?._id || ''}&imageUrl=${encodeURIComponent(formData.images[0] || '')}`}
            className="px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs"
          >
            <Wand2 className="w-4 h-4" />
            Brand in Image Studio →
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) - Basic Info & Images & Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information */}
          <AdminCard title="General Information" subtitle="Primary product identifiers and descriptions">
            <div className="space-y-4">
              <FormField label="Product Name" required>
                <TextInput
                  value={formData.name}
                  onChange={handleNameChange}
                  placeholder="e.g. Stockholm Minimalist Dining Table"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Slug (URL Identifier)" required helperText="Unique URL identifier for the product page">
                  <TextInput
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="stockholm-minimalist-dining-table"
                    required
                  />
                </FormField>

                <FormField label="Category Collection" required>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    options={categoryOptions.length > 0 ? categoryOptions : [{ value: 'living-room', label: 'Living Room' }]}
                  />
                </FormField>
              </div>

              <FormField label="Product Description" required>
                <TextArea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe craftsmanship, wood joints, bouclé textures, and styling ideas..."
                  required
                />
              </FormField>
            </div>
          </AdminCard>

          {/* Image Gallery */}
          <AdminCard
            title="Photography & Media Gallery"
            subtitle="Add product angles and lifestyle shots. First image is used as the primary thumbnail."
          >
            <div className="space-y-4">
              {/* Image Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-zinc-200 aspect-square bg-zinc-50"
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-[#1A1613]/90 text-[#A8875E] text-[10px] font-bold px-2 py-0.5 rounded shadow-sm border border-[#A8875E]/30">
                        Primary
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                      {idx !== 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimaryImage(idx)}
                          className="p-1.5 bg-white/90 text-zinc-900 rounded-lg text-[10px] font-bold hover:bg-white transition-colors"
                          title="Set as Primary"
                        >
                          Make Primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Image URL Input */}
              <div className="flex gap-2">
                <TextInput
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste direct image URL (https://images.unsplash.com/...)"
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </AdminCard>

          {/* Technical Specifications */}
          <AdminCard title="Technical Specifications" subtitle="Detailed dimensions, materials, and care guidelines">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Dimensions">
                <TextInput
                  value={formData.specs.dimensions}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, dimensions: e.target.value },
                    })
                  }
                  placeholder='e.g. 78" L x 38" W x 30" H'
                />
              </FormField>

              <FormField label="Weight">
                <TextInput
                  value={formData.specs.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, weight: e.target.value },
                    })
                  }
                  placeholder="e.g. 145 lbs"
                />
              </FormField>

              <FormField label="Material Details">
                <TextInput
                  value={formData.specs.materialDetails}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, materialDetails: e.target.value },
                    })
                  }
                  placeholder="e.g. Solid European White Oak, Natural Oil"
                />
              </FormField>

              <FormField label="Warranty">
                <TextInput
                  value={formData.specs.warranty}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, warranty: e.target.value },
                    })
                  }
                  placeholder="e.g. 5-Year Manufacturer Warranty"
                />
              </FormField>

              <FormField label="Assembly Instructions" className="sm:col-span-2">
                <TextInput
                  value={formData.specs.assembly}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, assembly: e.target.value },
                    })
                  }
                  placeholder="e.g. Minimal assembly required (Tools included)"
                />
              </FormField>

              <FormField label="Care & Maintenance" className="sm:col-span-2">
                <TextInput
                  value={formData.specs.care}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      specs: { ...formData.specs, care: e.target.value },
                    })
                  }
                  placeholder="e.g. Wipe clean with a soft dry cloth."
                />
              </FormField>
            </div>
          </AdminCard>
        </div>

        {/* Right Column (1 Col) - Pricing, Inventory & Status */}
        <div className="space-y-6">
          {/* Pricing & Inventory */}
          <AdminCard title="Pricing & Inventory">
            <div className="space-y-4">
              <FormField label="Price ($ USD)" required>
                <TextInput
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="1450"
                  required
                />
              </FormField>

              <FormField label="Original / Compare Price ($ USD)" helperText="Leave empty if no discount applied">
                <TextInput
                  type="number"
                  min="0"
                  step="1"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="1750"
                />
              </FormField>

              <div className="pt-2 border-t border-zinc-100 space-y-3">
                <FormField label="Stock Units Count">
                  <TextInput
                    type="number"
                    min="0"
                    value={formData.stockCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockCount: e.target.value,
                        inStock: Number(e.target.value) > 0,
                      })
                    }
                  />
                </FormField>

                <Toggle
                  label="In Stock Toggle"
                  description="Immediately show as available or sold out"
                  checked={formData.inStock}
                  onChange={(checked) => setFormData({ ...formData, inStock: checked })}
                />
              </div>
            </div>
          </AdminCard>

          {/* Variants (Materials & Colors) */}
          <AdminCard title="Available Finishes" subtitle="Manage colorways and material swatches">
            <div className="space-y-4">
              <FormField label="Color Options" helperText="Press Enter to add a new colorway">
                <TagInput
                  tags={formData.colors}
                  onChange={(colors) => setFormData({ ...formData, colors })}
                  placeholder="Add color (e.g. Oatmeal, Charcoal)..."
                />
              </FormField>

              <FormField label="Material Options" helperText="Press Enter to add material">
                <TagInput
                  tags={formData.materials}
                  onChange={(materials) => setFormData({ ...formData, materials })}
                  placeholder="Add material (e.g. Solid Oak, Bouclé)..."
                />
              </FormField>
            </div>
          </AdminCard>

          {/* Visibility & Marketing Badges */}
          <AdminCard title="Publication & Badges">
            <div className="space-y-4">
              <FormField label="Catalog Status">
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  options={[
                    { value: 'published', label: 'Published (Live in Store)' },
                    { value: 'draft', label: 'Draft (Staff Only)' },
                  ]}
                />
              </FormField>

              <div className="pt-3 border-t border-zinc-100 space-y-3">
                <Toggle
                  label="Trending Item"
                  description="Feature in the homepage 'Trending Now' spotlight"
                  checked={formData.trending}
                  onChange={(checked) => setFormData({ ...formData, trending: checked })}
                />

                <Toggle
                  label="Best Seller Flag"
                  description="Include in 'Today's Best Selling' curated grid"
                  checked={formData.isBestSeller}
                  onChange={(checked) => setFormData({ ...formData, isBestSeller: checked })}
                />

                <Toggle
                  label="Featured Item"
                  description="Highlight in seasonal banners and category heroes"
                  checked={formData.isFeatured}
                  onChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </div>
          </AdminCard>
        </div>
      </div>
    </form>
  );
}
