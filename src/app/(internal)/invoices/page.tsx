'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { InvoiceStatusBadge } from '@/components/features/invoices/invoice-status-badge';
import { Search, Filter, AlertCircle, FileText, CheckCircle, XCircle } from 'lucide-react';

interface InvoiceListItem {
  id: string;
  invoiceNo: string;
  periodStart: string;
  periodEnd: string;
  issuedAt: string;
  dueAt: string;
  status: string;
  subtotalPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  customer: {
    name: string;
    email: string;
  };
  subscription: {
    subscriptionNo: string;
  };
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (overdueOnly) params.set('overdue', 'true');

      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setInvoices(data.data || []);
      } else {
        setError(data.error?.message || 'Failed to fetch invoices');
      }
    } catch {
      setError('Network error loading invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, overdueOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices();
  };

  const handleConfirm = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/invoices/${id}/confirm`, { method: 'POST' });
      if (res.ok) {
        await fetchInvoices();
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to confirm');
      }
    } catch {
      alert('Error confirming invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/invoices/${id}/cancel`, { method: 'POST' });
      if (res.ok) {
        await fetchInvoices();
      } else {
        const data = await res.json();
        alert(data.error?.message || 'Failed to cancel');
      }
    } catch {
      alert('Error cancelling invoice');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage customer subscription invoices, review tax breakdowns and dispatch bills.
          </p>
        </div>
        <Link
          href="/billing"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <FileText className="w-4 h-4" />
          Run Recurring Billing
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96 relative">
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PAID">Paid</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
            <input
              type="checkbox"
              checked={overdueOnly}
              onChange={(e) => setOverdueOnly(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            Overdue Only
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No invoices found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Subtotal</th>
                  <th className="py-3 px-4 text-right">Discount</th>
                  <th className="py-3 px-4 text-right">Tax</th>
                  <th className="py-3 px-4 text-right">Total</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-indigo-600">
                      <Link href={`/invoices/${inv.id}`} className="hover:underline">
                        {inv.invoiceNo}
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{inv.customer.name}</div>
                      <div className="text-xs text-slate-500">{inv.customer.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{inv.subscription.subscriptionNo}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {formatDate(inv.periodStart)} - {formatDate(inv.periodEnd)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(inv.subtotalPaise)}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-medium">
                      {inv.discountPaise > 0 ? `-${formatCurrency(inv.discountPaise)}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(inv.taxPaise)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(inv.totalPaise)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">{formatDate(inv.dueAt)}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        View
                      </Link>
                      {inv.status === 'DRAFT' && (
                        <button
                          onClick={() => handleConfirm(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="text-xs font-medium text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                      )}
                      {inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCancel(inv.id)}
                          disabled={actionLoading === inv.id}
                          className="text-xs font-medium text-rose-600 hover:text-rose-800 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
