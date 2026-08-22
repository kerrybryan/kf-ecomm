import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WarrantyClaim from '@/models/WarrantyClaim';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'support', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = {};
    if (status && status !== 'all') query.status = status;

    const claims = await WarrantyClaim.find(query)
      .sort({ createdAt: -1 })
      .populate('orderId', 'orderNumber customer total')
      .lean();

    return NextResponse.json({ success: true, data: claims });
  } catch (err) {
    console.error('Fetch warranty claims error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load warranty claims' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      orderId,
      customerName,
      customerEmail,
      productName,
      claimType = 'transit_damage',
      description,
      photoUrls = [],
      severity = 'minor_touchup',
    } = body;

    if (!orderId || !customerName || !description) {
      return NextResponse.json({ success: false, error: 'Missing required claim fields' }, { status: 400 });
    }

    const claimNumber = `CLAIM-${Date.now().toString().slice(-6)}`;

    const claim = await WarrantyClaim.create({
      orderId,
      claimNumber,
      customerName,
      customerEmail,
      productName,
      claimType,
      description,
      photoUrls,
      severity,
      status: 'submitted',
    });

    return NextResponse.json({ success: true, data: claim, message: 'Warranty claim submitted successfully' }, { status: 201 });
  } catch (err) {
    console.error('Submit claim error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to submit claim' }, { status: 500 });
  }
}
