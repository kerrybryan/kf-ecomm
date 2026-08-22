'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

export default function OrderInvoicePage() {
  const params = useParams();
  const id = params?.id;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        const json = await res.json();
        if (json.success) {
          setOrder(json.data);
        }
      } catch (err) {
        console.error('Invoice load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-zinc-400">
        <span>Generating printable invoice...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-xs text-rose-600">
        <span>Order not found</span>
      </div>
    );
  }

  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-100/60 p-4 sm:p-8 print:p-0 print:bg-white text-zinc-900 font-sans">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/admin/orders/${order._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Order File</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#A8875E] hover:bg-[#96764E] text-[#1A1613] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Printable Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-zinc-200 print:border-none rounded-2xl print:rounded-none p-8 sm:p-12 shadow-sm print:shadow-none space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-zinc-100 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif text-2xl font-bold tracking-wider text-zinc-900">
                NORDIKA
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#A8875E] border border-[#A8875E] px-1 rounded">
                STUDIO
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-light max-w-xs">
              Handcrafted Scandinavian Luxury Joinery & Architectural Woodwork
            </p>
            <p className="text-[11px] text-zinc-400 mt-2">
              440 Westlake Ave N, Suite 300, Seattle, WA 98109 • concierge@nordika.com
            </p>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="font-serif text-xl font-bold text-zinc-900">COMMERCIAL INVOICE</h2>
            <p className="text-xs font-mono font-bold text-[#A8875E] mt-1">
              INV-{order.orderNumber}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Date: {invoiceDate}</p>
            <p className="text-xs text-zinc-500 capitalize">
              Payment Status: <span className="font-semibold text-emerald-700">{order.paymentStatus || 'Paid'}</span>
            </p>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
          <div>
            <p className="font-bold uppercase tracking-wider text-zinc-400 text-[10px] mb-2">
              Billed & Shipped To:
            </p>
            <p className="font-bold text-zinc-900 text-sm">{order.customer?.name}</p>
            <p className="text-zinc-600 mt-0.5">{order.customer?.email}</p>
            <p className="text-zinc-600">{order.customer?.phone}</p>
            <p className="text-zinc-600 mt-1">{order.customer?.address?.street}</p>
            {order.customer?.address?.apartment && (
              <p className="text-zinc-600">{order.customer?.address?.apartment}</p>
            )}
            <p className="text-zinc-600">
              {order.customer?.address?.city}, {order.customer?.address?.state}{' '}
              {order.customer?.address?.postalCode}
            </p>
            <p className="text-zinc-500">{order.customer?.address?.country}</p>
          </div>

          <div className="sm:text-right space-y-1">
            <p className="font-bold uppercase tracking-wider text-zinc-400 text-[10px] mb-2">
              Fulfillment Info:
            </p>
            <p className="text-zinc-600">
              Payment Method:{' '}
              <span className="font-semibold text-zinc-900 capitalize">
                {order.paymentMethod?.replace(/_/g, ' ')}
              </span>
            </p>
            <p className="text-zinc-600">
              Fulfillment Status:{' '}
              <span className="font-semibold text-zinc-900 capitalize">{order.status}</span>
            </p>
            <p className="text-zinc-600">Carrier: White-Glove Architectural Logistics</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-zinc-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-zinc-50 border-b border-zinc-200 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Description & Finishes</th>
                <th className="px-4 py-3 text-center">Qty</th>
                <th className="px-4 py-3 text-right">Unit Price</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {order.items?.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-zinc-900">{item.name}</p>
                    <p className="text-[11px] text-zinc-500">
                      {item.variant?.color && `Color: ${item.variant.color}`}
                      {item.variant?.material && ` • Material: ${item.variant.material}`}
                    </p>
                  </td>
                  <td className="px-4 py-3.5 text-center font-medium">{item.quantity}</td>
                  <td className="px-4 py-3.5 text-right font-mono">${item.price?.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-bold font-mono">
                    ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Calculation */}
        <div className="flex justify-end text-xs">
          <div className="w-72 space-y-2 border-t border-zinc-200 pt-3">
            <div className="flex justify-between text-zinc-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">${order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>White-Glove Delivery:</span>
              <span className="font-mono font-semibold">
                {order.shipping === 0 ? '$0.00 (Complimentary)' : `$${order.shipping?.toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Sales Tax:</span>
              <span className="font-mono font-semibold">${order.tax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 border-t border-zinc-200 pt-2">
              <span>Grand Total:</span>
              <span className="font-mono text-[#A8875E]">${order.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="border-t border-zinc-100 pt-6 text-[11px] text-zinc-400 space-y-1 text-center">
          <p className="font-semibold text-zinc-600">
            Thank you for choosing Nordika Scandinavian Studio.
          </p>
          <p>
            All architectural woodwork is backed by our 10-Year Master Joinery Warranty. For delivery
            concierge, contact support@nordika.com.
          </p>
        </div>
      </div>
    </div>
  );
}
