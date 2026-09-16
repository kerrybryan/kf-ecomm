import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateOrderNumber } from '@/lib/utils';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const session = await getSessionUser();

    let query = {};
    if (email) {
      query['customer.email'] = email.toLowerCase().trim();
    } else if (session?.userId) {
      query.user = session.userId;
    } else {
      // If neither is provided, return recent orders or empty
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Please provide an email or login to view orders',
      });
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const { customer, items, paymentMethod, deliveryNotes } = body;

    if (!customer?.name || !customer?.email || !customer?.phone || !customer?.address?.street) {
      return NextResponse.json(
        { success: false, error: 'Complete customer contact and shipping details are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    // Calculate totals server-side (Free delivery over 50,000 Birr, else 1,500 Birr, 15% VAT)
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 50000 ? 0 : 1500;
    const tax = Math.round(subtotal * 0.15); // 15% Ethiopian VAT
    const total = subtotal + shipping + tax;

    const orderNumber = generateOrderNumber();
    const session = await getSessionUser();

    const newOrder = await Order.create({
      orderNumber,
      user: session?.userId || null,
      customer: {
        name: customer.name.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim(),
        address: {
          street: customer.address.street.trim(),
          apartment: customer.address.apartment?.trim() || '',
          city: customer.address.city.trim(),
          state: customer.address.state.trim(),
          postalCode: customer.address.postalCode?.trim() || '1000',
          country: customer.address.country || 'Ethiopia',
        },
      },
      items: items.map((item) => ({
        productId: item.productId || item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        variant: {
          color: item.variant?.color || item.selectedColor || '',
          material: item.variant?.material || item.selectedMaterial || '',
        },
        image: item.image || item.images?.[0] || '',
      })),
      subtotal,
      shipping,
      tax,
      total,
      status: 'pending',
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: 'paid',
      deliveryNotes: deliveryNotes || '',
    });

    return NextResponse.json(
      {
        success: true,
        data: newOrder,
        message: 'Order created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
