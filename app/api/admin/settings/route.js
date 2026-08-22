import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    let setting = await Setting.findOne({}).lean();
    if (!setting) {
      setting = await Setting.create({});
    }

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error('Admin GET settings error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();

    let setting = await Setting.findOne({});
    if (!setting) {
      setting = new Setting();
    }

    const updatable = [
      'storeName',
      'storeEmail',
      'storePhone',
      'storeAddress',
      'currency',
      'shippingRules',
      'taxRates',
      'paymentMethods',
      'globalCommissionRate',
      'branding',
    ];

    updatable.forEach((key) => {
      if (body[key] !== undefined) {
        setting[key] = body[key];
      }
    });

    await setting.save();

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Store settings saved successfully',
    });
  } catch (error) {
    console.error('Admin update settings error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save settings' }, { status: 500 });
  }
}
