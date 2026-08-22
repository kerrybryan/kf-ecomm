import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductionOrder from '@/models/ProductionOrder';
import RawMaterial from '@/models/RawMaterial';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const craftsman = searchParams.get('craftsman');

    const query = {};
    if (stage && stage !== 'all') query.currentStage = stage;
    if (priority && priority !== 'all') query.priority = priority;
    if (status && status !== 'all') query.status = status;
    if (craftsman && craftsman !== 'all') query.leadCraftsman = craftsman;

    const orders = await ProductionOrder.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .populate('productId', 'name slug price images category')
      .populate('orderId', 'orderNumber customer total status')
      .lean();

    // Grouping counts by Kanban stage
    const stages = [
      'timber_selection',
      'cutting_joinery',
      'hand_sanding',
      'finishing_staining',
      'upholstery',
      'quality_inspection',
      'completed',
    ];

    const stageCounts = {};
    for (const st of stages) {
      stageCounts[st] = await ProductionOrder.countDocuments({ currentStage: st, status: { $ne: 'cancelled' } });
    }

    return NextResponse.json({
      success: true,
      data: orders,
      stageCounts,
      totalActive: await ProductionOrder.countDocuments({ status: 'in_progress' }),
    });
  } catch (err) {
    console.error('Fetch production orders error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load production orders' },
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
    const {
      productId,
      orderId,
      productName,
      productSku,
      productImage,
      customSpecifications = {},
      priority = 'standard',
      leadCraftsman = 'Lars Lindqvist',
      workshopBench = 'Bench 3 - Joinery East',
      materialsRequired = [],
      targetDays = 14,
    } = body;

    if (!productId && !productName) {
      return NextResponse.json({ success: false, error: 'Product is required' }, { status: 400 });
    }

    let finalName = productName;
    let finalImage = productImage;
    let finalSku = productSku;

    if (productId) {
      const prod = await Product.findById(productId);
      if (prod) {
        finalName = prod.name;
        finalImage = prod.images?.[0] || '';
        finalSku = prod.slug?.toUpperCase() || 'NORD-ITEM';
      }
    }

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(targetDays || 14));

    const initialStageHistory = [
      {
        stage: 'timber_selection',
        enteredAt: new Date(),
        craftsman: leadCraftsman,
        notes: 'Production order created and queued for raw timber selection.',
      },
    ];

    const productionOrder = await ProductionOrder.create({
      productId: productId || null,
      orderId: orderId || null,
      productName: finalName,
      productSku: finalSku,
      productImage: finalImage,
      customSpecifications,
      currentStage: 'timber_selection',
      priority,
      leadCraftsman,
      workshopBench,
      stageHistory: initialStageHistory,
      materialsRequired,
      targetCompletionDate: targetDate,
      status: 'in_progress',
    });

    return NextResponse.json(
      {
        success: true,
        data: productionOrder,
        message: 'Production order created in Workshop Kanban!',
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Create production order error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create production order' },
      { status: 500 }
    );
  }
}
