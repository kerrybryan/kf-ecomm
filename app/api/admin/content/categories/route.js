import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const categories = await Category.find({}).sort({ order: 1, name: 1 }).lean();

    // Recalculate item counts dynamically from published products
    const productCounts = await Product.aggregate([
      { $match: { status: 'published', deletedAt: null } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    productCounts.forEach((c) => countMap.set(c._id, c.count));

    const enriched = categories.map((cat) => ({
      ...cat,
      itemCount: countMap.get(cat.slug) || 0,
    }));

    return NextResponse.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Admin GET categories error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();

    // Case 1: Reorder categories batch: { reorder: [{ _id, order }] }
    if (body.reorder && Array.isArray(body.reorder)) {
      for (const item of body.reorder) {
        await Category.findByIdAndUpdate(item._id, { order: item.order });
      }
      return NextResponse.json({ success: true, message: 'Category order updated successfully' });
    }

    // Case 2: Create new category
    if (!body.name || !body.image) {
      return NextResponse.json({ success: false, error: 'Category name and image URL are required' }, { status: 400 });
    }

    const slug = (body.slug || body.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const category = await Category.create({
      ...body,
      slug,
      order: body.order || 0,
    });

    return NextResponse.json({ success: true, data: category, message: 'Category created' }, { status: 201 });
  } catch (error) {
    console.error('Admin create/reorder category error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to process category request' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { _id, name, slug, image, icon, description, order } = body;

    if (!_id) {
      return NextResponse.json({ success: false, error: 'Category ID is required' }, { status: 400 });
    }

    const category = await Category.findById(_id);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (image) category.image = image;
    if (icon) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (order !== undefined) category.order = Number(order);

    await category.save();

    return NextResponse.json({ success: true, data: category, message: 'Category updated successfully' });
  } catch (error) {
    console.error('Admin update category error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update category' }, { status: 500 });
  }
}
