'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  Truck,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import FulfillmentHeader from '@/components/admin/fulfillment/FulfillmentHeader';

export default function DeliverySchedulePage() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/fulfillment/shipments')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setShipments(j.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <FulfillmentHeader
        title="Delivery Window Schedule"
        subtitle="Scheduled white-glove assembly appointments and regional van routes."
      />

      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading white-glove delivery schedule...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {shipments.map((ship) => (
            <div
              key={ship._id}
              className="bg-white rounded-2xl border border-[#EBE5DF] p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#A8875E] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#F3ECE1] pb-2.5">
                  <span className="text-[10px] font-mono font-bold text-[#A8875E]">{ship.trackingNumber}</span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#FAF8F5] text-gray-800 border border-[#EBE5DF]">
                    {ship.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#1A1613]">{ship.orderId?.customer?.name || 'Private Client'}</h4>
                  <p className="text-xs text-[#7C7265] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[#A8875E]" />
                    {ship.orderId?.customer?.address?.street || 'Seattle Waterfront'}, {ship.orderId?.customer?.address?.city || 'Seattle'}
                  </p>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EBE5DF] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-[#1A1613]">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#A8875E]" />
                    <span>
                      {ship.deliveryWindow?.date
                        ? new Date(ship.deliveryWindow.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
                        : 'Scheduled Appointment'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-[#7C7265]">
                    <Clock className="w-3 h-3 text-[#A8875E]" />
                    <span>Time Slot: <strong>{ship.deliveryWindow?.timeSlot}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EBE5DF] flex items-center justify-between text-xs text-[#7C7265]">
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#A8875E]" />
                  <span>{ship.driverName}</span>
                </div>
                <span className="text-[10px] font-semibold">{ship.vehicleId}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
