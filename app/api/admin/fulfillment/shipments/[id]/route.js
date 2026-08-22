import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Shipment from '@/models/Shipment';
import Order from '@/models/Order';
import { requireAdminAuth } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'support', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;

    const shipment = await Shipment.findById(id)
      .populate('orderId')
      .lean();

    if (!shipment) {
      return NextResponse.json({ success: false, error: 'Shipment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: shipment });
  } catch (err) {
    console.error('Fetch shipment error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch shipment' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAdminAuth(request, ['super_admin', 'sales_manager', 'support', 'admin']);
  if (auth.error) return auth.error;

  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();
    const {
      status,
      driverName,
      driverPhone,
      vehicleId,
      deliveryWindow,
      proofOfDelivery,
      timelineNote,
      location = 'In Transit',
    } = body;

    const shipment = await Shipment.findById(id);
    if (!shipment) {
      return NextResponse.json({ success: false, error: 'Shipment not found' }, { status: 404 });
    }

    const previousStatus = shipment.status;

    // Status transition & Timeline append
    if (status && status !== previousStatus) {
      shipment.status = status;
      shipment.timeline.push({
        status,
        timestamp: new Date(),
        location,
        note: timelineNote || `Status updated to ${status.replace('_', ' ')}`,
      });

      // If delivered, update Order status
      if (status === 'delivered') {
        if (proofOfDelivery) {
          shipment.proofOfDelivery = {
            signatureUrl: proofOfDelivery.signatureUrl || 'sig_verified_digital_pad',
            photoUrls: proofOfDelivery.photoUrls || [],
            recipientName: proofOfDelivery.recipientName || 'Verified Recipient',
            deliveredAt: new Date(),
            conditionNotes: proofOfDelivery.conditionNotes || 'Inspected and assembled on site.',
          };
        }

        if (shipment.orderId) {
          const linkedOrder = await Order.findById(shipment.orderId);
          if (linkedOrder) {
            linkedOrder.status = 'delivered';
            linkedOrder.timeline.push({
              status: 'delivered',
              note: `White-glove delivery completed by driver ${shipment.driverName || 'Fleet'}.`,
              date: new Date(),
            });
            await linkedOrder.save();
          }
        }
      }
    }

    if (driverName) shipment.driverName = driverName;
    if (driverPhone) shipment.driverPhone = driverPhone;
    if (vehicleId) shipment.vehicleId = vehicleId;
    if (deliveryWindow) shipment.deliveryWindow = { ...shipment.deliveryWindow, ...deliveryWindow };

    await shipment.save();

    return NextResponse.json({
      success: true,
      data: shipment,
      message: `Shipment updated to ${shipment.status}`,
    });
  } catch (err) {
    console.error('Update shipment error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update shipment' },
      { status: 500 }
    );
  }
}
