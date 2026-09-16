import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';
import { requireAdminAuth } from '@/lib/adminAuth';
import { generateCSV } from '@/lib/csv';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format'); // json or csv

    const subscribers = await Newsletter.find({}).sort({ createdAt: -1 }).lean();

    if (format === 'csv') {
      const csv = generateCSV(subscribers, [
        { key: 'email', label: 'Email' },
        { key: 'status', label: 'Status' },
        { key: 'source', label: 'Source' },
        { key: 'createdAt', label: 'Subscription Date' },
      ]);

      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="kb-furniture-newsletter-subscribers-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: subscribers,
      total: subscribers.length,
    });
  } catch (error) {
    console.error('Admin GET subscribers error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Subscriber ID is required' }, { status: 400 });
    }

    await Newsletter.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Subscriber removed' });
  } catch (error) {
    console.error('Admin delete subscriber error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete subscriber' }, { status: 500 });
  }
}
