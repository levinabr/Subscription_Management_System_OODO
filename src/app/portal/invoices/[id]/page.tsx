'use client';

import React, { useState, useEffect } from 'react';
import { InvoiceStatusBadge, formatINR } from '@/components/features/invoices/InvoiceStatusBadge';
import { FileText, Printer, ArrowLeft, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function CustomerInvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (!res.ok) {
          if (res.status === 403) throw new Error('Access denied: You do not own this invoice.');
          if (res.status === 404) throw new Error('Invoice not found.');
          throw new Error('Failed to load invoice.');
        }
        const data = await res.json();
        setInvoice(data);
      } catch (err: any) {
        setError(err.message || 'Error loading invoice');
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading invoice details...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="py-20 text-center bg-white rounded-xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800">Invoice Unavailable</h2>
        <p className="text-sm text-slate-500 mt-2">{error || 'This invoice does not exist.'}</p>
        <Link
          href="/portal/invoices"
          className="inline-block mt-4 text-emerald-600 font-semibold hover:underline"
        >
          &larr; Back to My Invoices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/portal/invoices"
            className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Invoice #{invoice.invoiceNo}
              </h1>
              <InvoiceStatusBadge status={invoice.status} isOverdue={invoice.isOverdue} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Issued: {new Date(invoice.issuedAt).toLocaleDateString()} • Due:{' '}
              {new Date(invoice.dueAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <a
          href={`/api/invoices/${invoice.id}/print`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 border border-slate-300 rounded-lg text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-2 shadow-sm transition self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-slate-500" />
          Print / PDF Statement
        </a>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Billing Information
          </div>
          <div className="text-base font-bold text-slate-900">
            {invoice.customer?.businessName}
          </div>
          <div className="text-sm text-slate-600 mt-0.5">
            {invoice.customer?.billingEmail}
          </div>
          {invoice.customer?.addressLine1 && (
            <div className="text-xs text-slate-500 mt-2">
              {invoice.customer.addressLine1}, {invoice.customer.city || ''}
            </div>
          )}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Statement Summary
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Billing Period:</span>
              <span className="font-medium text-slate-800">
                {new Date(invoice.periodStart).toLocaleDateString()} –{' '}
                {new Date(invoice.periodEnd).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Amount:</span>
              <span className="font-bold text-slate-900">{formatINR(invoice.totalPaise)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-bold text-emerald-700">{formatINR(invoice.totalPaidPaise)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1.5 font-bold">
              <span className="text-slate-700">Balance Due:</span>
              <span className={invoice.outstandingPaise > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                {formatINR(invoice.outstandingPaise)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Lines Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
          Items & Services
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4 text-right">Qty</th>
              <th className="py-3 px-4 text-right">Unit Price</th>
              <th className="py-3 px-4 text-right">Tax</th>
              <th className="py-3 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {invoice.lines && invoice.lines.length > 0 ? (
              invoice.lines.map((line: any) => (
                <tr key={line.id}>
                  <td className="py-3 px-4 font-medium text-slate-900">{line.description}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{line.quantity}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{formatINR(line.unitPricePaise)}</td>
                  <td className="py-3 px-4 text-right text-slate-600">{formatINR(line.taxPaise)}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatINR(line.totalPaise)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-4 text-slate-900">Subscription Subscription Plan</td>
                <td className="py-3 px-4 text-right text-slate-600">1</td>
                <td className="py-3 px-4 text-right text-slate-600">{formatINR(invoice.subtotalPaise)}</td>
                <td className="py-3 px-4 text-right text-slate-600">{formatINR(invoice.taxPaise)}</td>
                <td className="py-3 px-4 text-right font-semibold text-slate-900">
                  {formatINR(invoice.totalPaise)}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <div className="w-64 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span>{formatINR(invoice.subtotalPaise)}</span>
            </div>
            {invoice.discountPaise > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount:</span>
                <span>-{formatINR(invoice.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax:</span>
              <span>{formatINR(invoice.taxPaise)}</span>
            </div>
            <div className="flex justify-between font-black text-slate-900 border-t border-slate-200 pt-1.5 text-base">
              <span>Total Statement:</span>
              <span>{formatINR(invoice.totalPaise)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History for this invoice */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
          Payment Receipts
        </div>

        {invoice.payments && invoice.payments.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.payments.map((p: any) => (
                <tr key={p.id}>
                  <td className="py-3 px-4 text-slate-800 font-medium">
                    {new Date(p.paidAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{p.method}</td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-xs">{p.reference || '—'}</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-700">
                    {formatINR(p.amountPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            No payments have been recorded for this statement yet.
          </div>
        )}
      </div>
    </div>
  );
}
