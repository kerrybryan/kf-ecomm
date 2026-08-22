'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Printer,
  ArrowLeft,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function InvoicePrintPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetch(`/api/admin/finance/invoices/${params.id}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.success) setInvoice(j.data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [params?.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-12 text-xs text-[#7C7265]">
        <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Generating Studio Invoice Document...
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-12 text-center text-xs text-[#7C7265]">
        <p>Invoice document not found for this order.</p>
        <Link href="/admin/orders" className="text-[#A8875E] underline mt-2 block">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-4 sm:p-8 font-sans">
      {/* Top Action Bar (Hidden when printing) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 text-xs font-bold text-[#4A4036] hover:text-[#1A1613]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Orders
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="px-5 py-2 rounded-xl bg-[#1A1613] hover:bg-[#2C2520] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          Print / Export PDF
        </button>
      </div>

      {/* Luxury Printable Invoice Sheet */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl border border-[#EBE5DF] shadow-lg print:border-0 print:shadow-none print:p-0 space-y-8 text-[#1A1613]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#EBE5DF] pb-8">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-serif font-bold text-[#A8875E]">
              Nordika Scandinavian Studio
            </span>
            <h1 className="text-3xl font-serif font-bold text-[#1A1613] mt-1">INVOICE</h1>
            <p className="text-xs text-[#7C7265] mt-1">
              Invoice #{invoice.invoiceNumber} • Order #{invoice.orderNumber}
            </p>
          </div>

          <div className="text-xs text-right sm:text-right space-y-1 text-[#7C7265]">
            <p className="font-bold text-[#1A1613]">{invoice.store?.name}</p>
            <p>{invoice.store?.address}</p>
            <p>{invoice.store?.email} • {invoice.store?.phone}</p>
          </div>
        </div>

        {/* Client & Date Meta */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Billed & Shipped To:</span>
            <p className="font-bold text-sm text-[#1A1613] mt-1">{invoice.customer?.name}</p>
            <p className="text-[#7C7265]">{invoice.customer?.email}</p>
            <p className="text-[#7C7265]">{invoice.customer?.phone}</p>
            <p className="text-[#7C7265] mt-1">
              {invoice.customer?.address?.street}, {invoice.customer?.address?.city}, {invoice.customer?.address?.state} {invoice.customer?.address?.postalCode}
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">Invoice Details:</span>
            <p className="text-[#4A4036]">Date: <strong>{new Date(invoice.date).toLocaleDateString()}</strong></p>
            <p className="text-[#4A4036]">Payment: <strong>Credit Card / Verified</strong></p>
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-widest bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full">
                ✓ {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-[#EBE5DF] rounded-2xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
              <tr>
                <th className="px-5 py-3">Bespoke Item & Material Specs</th>
                <th className="px-5 py-3 text-center">Qty</th>
                <th className="px-5 py-3 text-right">Unit Price</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5DF]">
              {invoice.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#1A1613] text-sm">{item.name}</p>
                    {(item.color || item.material) && (
                      <p className="text-[11px] text-[#A8875E]">
                        Specification: {item.material || 'Solid European Oak'} {item.color ? `• ${item.color}` : ''}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-[#1A1613]">{item.quantity}</td>
                  <td className="px-5 py-4 text-right text-[#4A4036]">${item.price?.toLocaleString()}</td>
                  <td className="px-5 py-4 text-right font-bold text-[#1A1613]">${item.total?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotals */}
        <div className="flex justify-end pt-2">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-[#7C7265]">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#1A1613]">${invoice.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#7C7265]">
              <span>White-Glove Delivery:</span>
              <span className="font-semibold text-[#1A1613]">${invoice.shipping?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[#7C7265]">
              <span>Sales Tax:</span>
              <span className="font-semibold text-[#1A1613]">${invoice.tax?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-base text-[#1A1613] border-t border-[#EBE5DF] pt-2">
              <span>Total:</span>
              <span className="text-[#A8875E]">${invoice.total?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Guarantee Footer */}
        <div className="border-t border-[#EBE5DF] pt-6 text-center text-xs text-[#7C7265] space-y-1">
          <p className="font-bold text-[#1A1613]">5-Year Structural Joinery & Craftsmanship Guarantee Included</p>
          <p>Thank you for choosing Nordika Scandinavian Studio. For care guidelines and bespoke commissions, visit nordika.com</p>
        </div>
      </div>
    </div>
  );
}
