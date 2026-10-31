'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceStatusBadge, formatINR } from '@/components/features/invoices/InvoiceStatusBadge';
import {
  FileText,
  Search,
  Filter,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalCount: 0,
    totalPages: 1,
  });

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isOverdueOnly, setIsOverdueOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInvoices = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (isOverdueOnly) params.append('isOverdue', 'true');
      if (search.trim()) params.append('search', search.trim());

      const res = await fetch(`/api/invoices?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.items);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1);
  }, [statusFilter, isOverdueOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Invoices
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor invoices, inspect line items, track outstanding balances, and collect payments.
          </p>
        </div>
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
            placeholder="Search invoice # or customer..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 focus:outline-none"
          />
        </form>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status selector */}
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg bg-white text-slate-800 text-xs font-medium focus:ring-2 focus:ring-emerald-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PAID">Paid</option>
              <option value="DRAFT">Draft</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Overdue toggle */}
          <button
            type="button"
            onClick={() => setIsOverdueOnly(!isOverdueOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
              isOverdueOnly
                ? 'bg-rose-100 text-rose-800 border-rose-300'
                : 'bg-slate-50 text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Only Overdue
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">
            Loading invoices...
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700">No invoices found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Try adjusting your search criteria or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Issued</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Total</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Outstanding</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-emerald-600 hover:underline flex items-center gap-1.5"
                      >
                        #{inv.invoiceNo}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {inv.customer?.businessName || 'Customer'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {inv.customer?.billingEmail}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <span
                        className={
                          inv.isOverdue
                            ? 'text-rose-700 font-bold'
                            : 'text-slate-600'
                        }
                      >
                        {new Date(inv.dueAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatINR(inv.totalPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-emerald-700 whitespace-nowrap">
                      {formatINR(inv.totalPaidPaise)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold ${
                          inv.outstandingPaise > 0
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {formatINR(inv.outstandingPaise)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <InvoiceStatusBadge
                        status={inv.status}
                        isOverdue={inv.isOverdue}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                      >
                        {inv.status === 'CONFIRMED' && inv.outstandingPaise > 0 ? (
                          <>
                            <CreditCard className="w-3.5 h-3.5" /> Record Pay
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5" /> Details
                          </>
                        )}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
              {pagination.totalCount} invoices
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchInvoices(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-2.5 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <span className="font-semibold px-2 text-slate-800">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchInvoices(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-2.5 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
