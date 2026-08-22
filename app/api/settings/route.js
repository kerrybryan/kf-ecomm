import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectDB();
    let setting = await Setting.findOne({}).lean();
    if (!setting) {
      setting = await Setting.create({});
    }

    return NextResponse.json({
      success: true,
      data: {
        shippingRules: setting.shippingRules || {
          flatRate: 150,
          freeShippingThreshold: 2000,
          expeditedRate: 350,
          whiteGloveRate: 450,
        },
        currency: setting.currency || { code: 'USD', symbol: '$' },
        storeName: setting.storeName,
        paymentMethods: setting.paymentMethods,
      },
    });
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
