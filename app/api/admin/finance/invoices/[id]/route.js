import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Setting from '@/models/Setting';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'support', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const [order, settings] = await Promise.all([
      Order.findById(id).lean(),
      Setting.findOne().lean(),
    ]);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const invoiceData = {
      invoiceNumber: `INV-${order.orderNumber?.replace('NORD-', '') || '2026-001'}`,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      dueDate: order.createdAt,
      status: order.paymentStatus === 'paid' ? 'PAID' : 'DUE',
      store: {
        name: settings?.storeName || 'KB Furniture Scandinavian Studio',
        address: settings?.storeAddress || '440 Westlake Ave N, Suite 300, Seattle, WA 98109',
        email: settings?.storeEmail || 'concierge@kbfurniture.com',
        phone: settings?.storePhone || '+1 (206) 555-0199',
      },
      customer: order.customer || { name: 'Valued Client' },
      items: (order.items || []).map((item) => {
        const itemPrice = item.price || 0;
        const itemQty = item.quantity || 1;
        return {
          name: item.name || 'Nordic Bespoke Furniture Piece',
          quantity: itemQty,
          price: itemPrice,
          total: itemPrice * itemQty,
          color: item.variant?.color || item.selectedColor || '',
          material: item.variant?.material || item.selectedMaterial || '',
        };
      }),
      subtotal: order.subtotal || order.total || 0,
      shipping: order.shipping || 0,
      tax: order.tax || 0,
      total: order.total || 0,
      paymentMethod: order.paymentMethod || 'credit_card',
    };

    return NextResponse.json({ success: true, data: invoiceData });
  } catch (err) {
    console.error('Fetch invoice error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
