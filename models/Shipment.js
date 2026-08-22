import mongoose from 'mongoose';

const ShipmentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required'],
    },
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    carrier: {
      type: String,
      default: 'Nordika White-Glove Fleet',
    },
    deliveryService: {
      type: String,
      enum: ['standard_freight', 'room_of_choice', 'white_glove_assembly'],
      default: 'white_glove_assembly',
    },
    driverName: {
      type: String,
      default: 'Erik Holmgren',
    },
    driverPhone: {
      type: String,
      default: '+1 (206) 555-0144',
    },
    vehicleId: {
      type: String,
      default: 'Van #4 (Sprinter EV)',
    },
    deliveryZone: {
      type: String,
      default: 'Greater Seattle & Puget Sound',
    },
    status: {
      type: String,
      enum: [
        'pending_dispatch',
        'dispatched',
        'out_for_delivery',
        'delivered',
        'failed_attempt',
        'rescheduled',
      ],
      default: 'pending_dispatch',
    },
    deliveryWindow: {
      date: { type: Date, default: null },
      timeSlot: { type: String, default: '09:00 - 13:00' },
      instructions: { type: String, default: '' },
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        location: { type: String, default: 'Seattle Workshop Hub' },
        note: { type: String, default: '' },
      },
    ],
    proofOfDelivery: {
      signatureUrl: { type: String, default: '' },
      photoUrls: { type: [String], default: [] },
      recipientName: { type: String, default: '' },
      deliveredAt: { type: Date, default: null },
      conditionNotes: { type: String, default: 'Delivered in pristine condition and assembled on site.' },
    },
  },
  {
    timestamps: true,
  }
);

ShipmentSchema.index({ status: 1, 'deliveryWindow.date': 1 });
ShipmentSchema.index({ trackingNumber: 1 });

export default mongoose.models.Shipment || mongoose.model('Shipment', ShipmentSchema);
