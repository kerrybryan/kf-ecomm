import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';
import { parseProductCSV } from '@/lib/csv';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const contentType = request.headers.get('content-type') || '';
    let csvText = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      csvText = body.csvText || '';
    } else {
      csvText = await request.text();
    }

    if (!csvText || !csvText.trim()) {
      return NextResponse.json({ success: false, error: 'CSV data is required' }, { status: 400 });
    }

    const { valid, errors } = parseProductCSV(csvText);

    if (valid.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid product records found in CSV',
          details: errors,
        },
        { status: 400 }
      );
    }

    // Process valid records with upsert / insert
    let insertedCount = 0;
    let updatedCount = 0;
    const importErrors = [...errors];

    for (const item of valid) {
      try {
        const existing = await Product.findOne({ slug: item.slug });
        if (existing) {
          Object.assign(existing, item, { deletedAt: null });
          await existing.save();
          updatedCount++;
        } else {
          await Product.create(item);
          insertedCount++;
        }
      } catch (err) {
        importErrors.push({ product: item.name, error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Import complete: ${insertedCount} created, ${updatedCount} updated.`,
      stats: {
        totalRows: valid.length + errors.length,
        insertedCount,
        updatedCount,
        failedCount: importErrors.length,
      },
      errors: importErrors,
    });
  } catch (error) {
    console.error('Bulk CSV import error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'CSV Import failed' },
      { status: 500 }
    );
  }
}
