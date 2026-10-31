'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceStatusBadge, formatINR } from '@/components/features/invoices/InvoiceStatusBadge';
import { FileText, Eye, Printer, Calendar, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CustomerPortalInvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCustomerInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load customer invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerInvoices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Customer Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Customer Self-Service Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              My Subscriptions & Invoices
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Access your billing statements, view payment history, and download official invoice receipts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/portal/payments"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold border border-white/20 transition"
            >
              My Payments
            </Link>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800 flex items-center justify-between">
          <span>Billing Statements</span>
          <span className="text-xs text-slate-500 font-normal">
            {invoices.length} statement{invoices.length !== 1 ? 's' : ''} on record
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-500">Loading your invoices...</div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-700">No invoices yet</h4>
            <p className="text-xs text-slate-500 mt-1">
              Invoices will appear here once your subscription is confirmed.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Issued</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-right">Paid</th>
                  <th className="py-3.5 px-4 text-right">Balance Due</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                      <Link
                        href={`/portal/invoices/${inv.id}`}
                        className="text-emerald-600 hover:underline"
                      >
                        #{inv.invoiceNo}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                      {new Date(inv.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                      <span className={inv.isOverdue ? 'text-rose-700 font-bold' : 'text-slate-600'}>
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
                          inv.outstandingPaise > 0 ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {formatINR(inv.outstandingPaise)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <InvoiceStatusBadge status={inv.status} isOverdue={inv.isOverdue} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/invoices/${inv.id}/print`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Print / PDF"
                          className="p-1.5 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </a>
                        <Link
                          href={`/portal/invoices/${inv.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Link>
                      </div>
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
