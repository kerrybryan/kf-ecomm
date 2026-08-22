'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  X,
  CreditCard,
  Building,
} from 'lucide-react';
import FinanceHeader from '@/components/admin/finance/FinanceHeader';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    title: '',
    category: 'raw_timber_lumber',
    amount: 1500,
    vendor: 'Pacific Hardwood Lumber Co.',
    paymentMethod: 'bank_wire',
    notes: '',
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/finance/expenses');
      const data = await res.json();
      if (data.success) {
        setExpenses(data.data || []);
        setTotalExpenses(data.totalExpenses || 0);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleRecordExpense = async (e) => {
    e.preventDefault();
    try {
      setErrorMsg('');
      const res = await fetch('/api/admin/finance/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to record expense');
      }

      setSuccessMsg('Expense recorded & automatically journaled to General Ledger!');
      setShowAddModal(false);
      fetchExpenses();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error recording expense');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <FinanceHeader
        title="Operating & Workshop Expenses"
        subtitle="Record vendor invoices, raw timber purchase orders, machinery maintenance, and marketing expenditures."
      />

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header Actions */}
      <div className="bg-white rounded-2xl border border-[#EBE5DF] p-4 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs text-[#7C7265]">Total Recorded Expenses:</span>
          <h3 className="text-xl font-bold text-[#1A1613]">${totalExpenses.toLocaleString()}</h3>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[#A8875E] hover:bg-[#967750] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Record Expense
        </button>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] p-12 text-center text-xs text-[#7C7265]">
          <div className="w-8 h-8 border-2 border-[#A8875E] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading expenses...
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EBE5DF] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-[#EBE5DF] text-[10px] font-bold uppercase tracking-wider text-[#7C7265]">
              <tr>
                <th className="px-5 py-3.5">Title & Vendor</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Payment Method</th>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Amount ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE5DF]">
              {expenses.map((exp) => (
                <tr key={exp._id} className="hover:bg-[#FAF8F5]/60 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#1A1613]">{exp.title}</p>
                    <p className="text-[11px] text-[#7C7265]">{exp.vendor}</p>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-bold uppercase text-gray-700">
                      {exp.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap capitalize text-[#7C7265]">
                    {exp.paymentMethod.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-[#7C7265]">
                    {new Date(exp.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right font-bold text-red-600">
                    -${exp.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRecordExpense} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-[#EBE5DF]">
            <div className="flex items-center justify-between border-b border-[#EBE5DF] pb-3">
              <h3 className="text-sm font-bold text-[#1A1613]">Record Workshop Expense</h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="p-1 text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#4A4036]">Expense Description / PO Title</label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  placeholder="e.g. FSC White Oak Slabs 500 bdft"
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#4A4036]">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                  >
                    <option value="raw_timber_lumber">Raw Timber Lumber</option>
                    <option value="upholstery_fabrics">Upholstery Fabrics</option>
                    <option value="hardware_joinery">Hardware & Joinery</option>
                    <option value="workshop_rent_utilities">Rent & Power</option>
                    <option value="white_glove_logistics">Logistics & Freight</option>
                    <option value="marketing_advertising">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#4A4036]">Amount ($)</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#4A4036]">Vendor Name</label>
                <input
                  type="text"
                  value={newExpense.vendor}
                  onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                  className="w-full mt-1 p-2.5 rounded-xl border border-[#D5CCC2]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#EBE5DF]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-[#D5CCC2] text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#A8875E] text-white text-xs font-bold hover:bg-[#967750]"
              >
                Record & Post to Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
