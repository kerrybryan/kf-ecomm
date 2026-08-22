import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DeliveryZone from '@/models/DeliveryZone';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const zones = await DeliveryZone.find().sort({ baseCost: 1 }).lean();

    return NextResponse.json({ success: true, data: zones });
  } catch (err) {
    console.error('Fetch delivery zones error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load delivery zones' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { name, code, regionCodes = [], baseCost = 150, freeShippingThreshold = 2000, whiteGloveSurcharge = 250 } = body;

    const zone = await DeliveryZone.create({
      name,
      code: code.toUpperCase(),
      regionCodes,
      baseCost: Number(baseCost),
      freeShippingThreshold: Number(freeShippingThreshold),
      whiteGloveSurcharge: Number(whiteGloveSurcharge),
    });

    return NextResponse.json({ success: true, data: zone, message: 'Delivery zone created' }, { status: 201 });
  } catch (err) {
    console.error('Create delivery zone error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to create zone' }, { status: 500 });
  }
}
