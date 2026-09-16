import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shipment from '@/models/Shipment';
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
    const carrier = searchParams.get('carrier');
    const search = searchParams.get('search');

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (carrier && carrier !== 'all') query.carrier = carrier;
    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { driverName: { $regex: search, $options: 'i' } },
      ];
    }

    const shipments = await Shipment.find(query)
      .sort({ 'deliveryWindow.date': 1, createdAt: -1 })
      .populate({
        path: 'orderId',
        select: 'orderNumber customer items total status',
      })
      .lean();

    const counts = {
      total: await Shipment.countDocuments(),
      pending_dispatch: await Shipment.countDocuments({ status: 'pending_dispatch' }),
      dispatched: await Shipment.countDocuments({ status: 'dispatched' }),
      out_for_delivery: await Shipment.countDocuments({ status: 'out_for_delivery' }),
      delivered: await Shipment.countDocuments({ status: 'delivered' }),
    };

    return NextResponse.json({
      success: true,
      data: shipments,
      counts,
    });
  } catch (err) {
    console.error('Fetch shipments error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to load shipments' },
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
    const {
      orderId,
      carrier = 'KB Furniture White-Glove Fleet',
      deliveryService = 'white_glove_assembly',
      driverName = 'Erik Holmgren',
      driverPhone = '+1 (206) 555-0144',
      vehicleId = 'Van #4 (Sprinter EV)',
      deliveryZone = 'Greater Seattle & Puget Sound',
      deliveryWindow = {},
    } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order reference is required' }, { status: 400 });
    }

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = `NORD-LOG-${randomSuffix}`;

    const shipment = await Shipment.create({
      orderId,
      trackingNumber,
      carrier,
      deliveryService,
      driverName,
      driverPhone,
      vehicleId,
      deliveryZone,
      status: 'pending_dispatch',
      deliveryWindow: {
        date: deliveryWindow.date ? new Date(deliveryWindow.date) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        timeSlot: deliveryWindow.timeSlot || '09:00 - 13:00',
        instructions: deliveryWindow.instructions || 'White-glove placement in living room.',
      },
      timeline: [
        {
          status: 'pending_dispatch',
          timestamp: new Date(),
          location: 'KB Furniture Seattle Hub',
          note: 'Shipment created and scheduled for white-glove delivery appointment.',
        },
      ],
    });

    return NextResponse.json({
      success: true,
      data: shipment,
      message: 'Shipment scheduled successfully!',
    }, { status: 201 });
  } catch (err) {
    console.error('Create shipment error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create shipment' },
      { status: 500 }
    );
  }
}
