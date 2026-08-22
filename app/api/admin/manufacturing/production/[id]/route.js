import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ProductionOrder from '@/models/ProductionOrder';
import RawMaterial from '@/models/RawMaterial';
import Product from '@/models/Product';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const order = await ProductionOrder.findById(id)
      .populate('productId', 'name slug price images category')
      .populate('orderId', 'orderNumber customer total status')
      .populate('materialsRequired.materialId')
      .lean();

    if (!order) {
      return NextResponse.json({ success: false, error: 'Production order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (err) {
    console.error('Fetch production order detail error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch production order' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const {
      newStage,
      leadCraftsman,
      workshopBench,
      priority,
      notes,
      materialsRequired,
      status,
    } = body;

    const order = await ProductionOrder.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Production order not found' }, { status: 404 });
    }

    const previousStage = order.currentStage;
    const now = new Date();

    // 1. Stage Transition & Audit Trail History
    if (newStage && newStage !== previousStage) {
      // Complete previous stage in stageHistory
      const historyLen = order.stageHistory.length;
      if (historyLen > 0) {
        const lastEntry = order.stageHistory[historyLen - 1];
        lastEntry.completedAt = now;
        const diffMs = now.getTime() - new Date(lastEntry.enteredAt).getTime();
        lastEntry.durationHours = Number((diffMs / (1000 * 60 * 60)).toFixed(1));
      }

      // Append new stage
      order.stageHistory.push({
        stage: newStage,
        enteredAt: now,
        craftsman: leadCraftsman || order.leadCraftsman,
        notes: notes || `Advanced from ${previousStage} to ${newStage}`,
      });

      order.currentStage = newStage;

      // If moving to completed
      if (newStage === 'completed') {
        order.status = 'completed';
        order.actualCompletionDate = now;
      }
    }

    // 2. Material Auto-Deduction Logic
    // When job enters cutting/joinery or upholstery, auto-deduct materials if not yet deducted
    if (
      (order.currentStage !== 'timber_selection' || newStage === 'completed') &&
      order.materialsRequired &&
      order.materialsRequired.length > 0
    ) {
      for (const mat of order.materialsRequired) {
        if (!mat.deducted && mat.quantity > 0) {
          if (mat.materialId) {
            await RawMaterial.findByIdAndUpdate(mat.materialId, {
              $inc: { inStock: -mat.quantity },
            });
          } else if (mat.name) {
            await RawMaterial.findOneAndUpdate(
              { name: mat.name },
              { $inc: { inStock: -mat.quantity } }
            );
          }
          mat.deducted = true;
        }
      }
    }

    if (leadCraftsman) order.leadCraftsman = leadCraftsman;
    if (workshopBench) order.workshopBench = workshopBench;
    if (priority) order.priority = priority;
    if (status) order.status = status;
    if (materialsRequired) order.materialsRequired = materialsRequired;

    await order.save();

    return NextResponse.json({
      success: true,
      data: order,
      message: `Production order updated to stage: ${order.currentStage}`,
    });
  } catch (err) {
    console.error('Update production order error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update production order' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'product_manager', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const order = await ProductionOrder.findByIdAndDelete(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Production order not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Production order removed from workshop schedule',
    });
  } catch (err) {
    console.error('Delete production order error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete production order' },
      { status: 500 }
    );
  }
}
