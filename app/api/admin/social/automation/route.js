import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AutomationRule from '@/models/AutomationRule';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    let rule = await AutomationRule.findOne({ trigger: 'product_published' });
    if (!rule) {
      rule = await AutomationRule.create({
        trigger: 'product_published',
        mode: 'review_queue',
        defaultPlatforms: ['instagram', 'pinterest', 'facebook'],
        defaultCaptionTemplate:
<<<<<<< HEAD
          'Introducing the {productName} — masterfully crafted in {material}. Starting at ${price}.\n\nExplore our bespoke Scandinavian collection online at KB Furniture. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #KBFurniture #LuxuryInteriors',
=======
          'Introducing the {productName} — masterfully crafted in {material}. Starting at ${price}.\n\nExplore our bespoke Scandinavian collection online at Nordika Studio. ✨\n\n#NordicDesign #ScandinavianLiving #BespokeFurniture #NordikaStudio #LuxuryInteriors',
>>>>>>> 4cd674b4af49d0a4c0c576d40cf1680f0734cfca
        enabled: true,
      });
    }

    return NextResponse.json({ success: true, data: rule });
  } catch (err) {
    console.error('Fetch automation rule error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load automation rule' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const body = await request.json();
    const { mode, defaultPlatforms, defaultCaptionTemplate, enabled } = body;

    let rule = await AutomationRule.findOne({ trigger: 'product_published' });
    if (!rule) {
      rule = new AutomationRule({ trigger: 'product_published' });
    }

    if (mode !== undefined) rule.mode = mode;
    if (defaultPlatforms !== undefined) rule.defaultPlatforms = defaultPlatforms;
    if (defaultCaptionTemplate !== undefined) rule.defaultCaptionTemplate = defaultCaptionTemplate;
    if (enabled !== undefined) rule.enabled = enabled;

    await rule.save();

    return NextResponse.json({
      success: true,
      data: rule,
      message: 'Product launch automation rules updated successfully',
    });
  } catch (err) {
    console.error('Update automation rule error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update automation rules' },
      { status: 500 }
    );
  }
}
