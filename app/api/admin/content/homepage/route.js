import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Setting from '@/models/Setting';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    let setting = await Setting.findOne({})
      .populate('homepageSections.pinnedBestSellers')
      .populate('homepageSections.pinnedTrending')
      .lean();

    if (!setting) {
      setting = await Setting.create({});
    }

    const allPublishedProducts = await Product.find({ status: 'published', deletedAt: null })
      .select('name slug price images category isBestSeller trending isFeatured')
      .lean();

    return NextResponse.json({
      success: true,
      data: setting.homepageSections || {},
      products: allPublishedProducts,
    });
  } catch (error) {
    console.error('Admin GET homepage content error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch homepage content' }, { status: 500 });
  }
}

export async function PUT(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();

    let setting = await Setting.findOne({});
    if (!setting) {
      setting = new Setting();
    }

    setting.homepageSections = {
      ...setting.homepageSections,
      ...body,
    };

    await setting.save();

    return NextResponse.json({
      success: true,
      data: setting.homepageSections,
      message: 'Homepage sections configuration saved',
    });
  } catch (error) {
    console.error('Admin update homepage content error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to save homepage sections' }, { status: 500 });
  }
}
