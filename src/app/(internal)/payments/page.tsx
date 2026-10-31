'use client';

import React, { useState, useEffect } from 'react';
import { PaymentTable } from '@/components/features/payments/PaymentTable';
import { CreditCard, Search, Filter, Calendar } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
  });

  const [method, setMethod] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (method) params.append('method', method);
      if (search.trim()) params.append('search', search.trim());
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`/api/payments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.items);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, [method, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPayments(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Payment History
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete audit trail of all received payments matched to customer invoices.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, invoice #, customer..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 focus:outline-none"
          />
        </form>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Method selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Method:</span>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CARD">Card</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Date range pickers */}
          <div className="flex items-center gap-2 text-xs">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-emerald-200"
              placeholder="From Date"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-slate-700 text-xs focus:ring-2 focus:ring-emerald-200"
              placeholder="To Date"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading payment records...
        </div>
      ) : (
        <PaymentTable
          payments={payments}
          pagination={pagination}
          onPageChange={(page) => fetchPayments(page)}
          isCustomerPortal={false}
        />
      )}
    </div>
  );
}
