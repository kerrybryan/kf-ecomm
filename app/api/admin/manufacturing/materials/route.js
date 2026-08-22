import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RawMaterial from '@/models/RawMaterial';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { supplier: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await RawMaterial.find(query).sort({ category: 1, name: 1 }).lean();

    const lowStockItems = materials.filter((m) => m.inStock <= m.reorderThreshold);

    return NextResponse.json({
      success: true,
      data: materials,
      lowStockCount: lowStockItems.length,
      totalValuation: materials.reduce((acc, m) => acc + m.inStock * m.unitCost, 0),
    });
  } catch (err) {
    console.error('Fetch raw materials error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load materials' },
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
    const { name, sku, category = 'timber', inStock = 0, unit = 'units', unitCost = 0, reorderThreshold = 10, supplier = 'Nordic Forest Mill' } = body;

    if (!name || !sku) {
      return NextResponse.json({ success: false, error: 'Name and SKU are required' }, { status: 400 });
    }

    const material = await RawMaterial.create({
      name,
      sku: sku.toUpperCase(),
      category,
      inStock: Number(inStock),
      unit,
      unitCost: Number(unitCost),
      reorderThreshold: Number(reorderThreshold),
      supplier,
    });

    return NextResponse.json({ success: true, data: material, message: 'Material added to workshop inventory' }, { status: 201 });
  } catch (err) {
    console.error('Add raw material error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to add material' }, { status: 500 });
  }
}
