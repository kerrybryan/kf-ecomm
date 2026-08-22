import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || searchParams.get('q') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status'); // all, published, draft
    const stockStatus = searchParams.get('stockStatus'); // in_stock, out_of_stock, low_stock
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const query = { deletedAt: null };

    if (search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { category: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (stockStatus === 'in_stock') {
      query.inStock = true;
      query.stockCount = { $gt: 0 };
    } else if (stockStatus === 'out_of_stock') {
      query.$or = [{ inStock: false }, { stockCount: { $lte: 0 } }];
    } else if (stockStatus === 'low_stock') {
      query.stockCount = { $gt: 0, $lte: 5 };
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      Product.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin GET products error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();

    if (!body.name || body.price === undefined || !body.category) {
      return NextResponse.json(
        { success: false, error: 'Product name, price, and category are required' },
        { status: 400 }
      );
    }

    if (!body.slug) {
      body.slug = body.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    // Check duplicate slug
    let finalSlug = body.slug;
    const existing = await Product.findOne({ slug: finalSlug, deletedAt: null });
    if (existing) {
      finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
    }
    body.slug = finalSlug;

    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product, message: 'Product created successfully' }, { status: 201 });
  } catch (error) {
    console.error('Admin create product error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
