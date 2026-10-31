'use client';

import React, { useState } from 'react';
import { InvoiceStatusBadge } from './invoice-status-badge';
import { Printer, Send, CheckCircle, XCircle } from 'lucide-react';

interface InvoicePrintViewProps {
  invoice: {
    id: string;
    invoiceNo: string;
    subscriptionId: string;
    periodStart: string | Date;
    periodEnd: string | Date;
    issuedAt: string | Date;
    dueAt: string | Date;
    status: string;
    subtotalPaise: number;
    discountPaise: number;
    taxPaise: number;
    totalPaise: number;
    discountNameSnapshot?: string | null;
    sentAt?: string | Date | null;
    customer: {
      name: string;
      email: string;
      company?: string | null;
      address?: string | null;
      phone?: string | null;
    };
    subscription: {
      subscriptionNo: string;
      billingInterval: string;
    };
    lines: Array<{
      id: string;
      descriptionSnapshot: string;
      quantity: number;
      unitPricePaise: number;
      subtotalPaise: number;
      discountPaise: number;
      taxablePaise: number;
      taxRateBps: number;
      taxPaise: number;
      totalPaise: number;
    }>;
  };
  onStatusChange?: () => void;
}

export function InvoicePrintView({ invoice, onStatusChange }: InvoicePrintViewProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatCurrency = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleConfirm = async () => {
    setLoadingAction('confirm');
    setActionMessage(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Invoice confirmed successfully.' });
        if (onStatusChange) onStatusChange();
        window.location.reload();
      } else {
        setActionMessage({ type: 'error', text: data.error?.message || 'Failed to confirm invoice.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error confirming invoice.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this invoice?')) return;
    setLoadingAction('cancel');
    setActionMessage(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/cancel`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Invoice cancelled successfully.' });
        if (onStatusChange) onStatusChange();
        window.location.reload();
      } else {
        setActionMessage({ type: 'error', text: data.error?.message || 'Failed to cancel invoice.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error cancelling invoice.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSend = async () => {
    setLoadingAction('send');
    setActionMessage(null);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({ type: 'success', text: 'Invoice email sent to customer.' });
        if (onStatusChange) onStatusChange();
      } else {
        setActionMessage({ type: 'error', text: data.error?.message || 'Failed to send invoice email.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error sending invoice.' });
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar (Hidden when printing) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Actions:</span>
          {invoice.status === 'DRAFT' && (
            <button
              onClick={handleConfirm}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm Invoice
            </button>
          )}

          {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
            <button
              onClick={handleCancel}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              Cancel Invoice
            </button>
          )}

          {invoice.status !== 'CANCELLED' && (
            <button
              onClick={handleSend}
              disabled={loadingAction !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Send Email
            </button>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors shadow-sm"
        >
          <Printer className="w-4 h-4" />
          Print / PDF
        </button>
      </div>

      {actionMessage && (
        <div
          className={`no-print p-4 rounded-lg text-sm font-medium ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Invoice Document Box */}
      <div className="invoice-container bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-600 text-white rounded-md p-1.5 text-base font-black">BL</span>
              <span className="text-2xl font-black tracking-tight text-slate-900">Brightloop Software</span>
            </div>
            <p className="text-sm text-slate-500">Subscription Control Center</p>
            <p className="text-xs text-slate-400 mt-1">billing@brightloop.io | GSTIN: 29ABCDE1234F1Z5</p>
          </div>

          <div className="text-right">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TAX INVOICE</h1>
            <p className="font-mono text-base font-semibold text-indigo-600 mt-1">{invoice.invoiceNo}</p>
            <div className="mt-2 flex justify-end">
              <InvoiceStatusBadge status={invoice.status} />
            </div>
          </div>
        </div>

        {/* Invoice Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          {/* Bill To */}
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Billed To</span>
            <div className="font-bold text-slate-900 text-base">{invoice.customer.name}</div>
            {invoice.customer.company && (
              <div className="text-slate-700 font-medium">{invoice.customer.company}</div>
            )}
            <div className="text-slate-600">{invoice.customer.email}</div>
            {invoice.customer.phone && <div className="text-slate-500">{invoice.customer.phone}</div>}
            {invoice.customer.address && <div className="text-slate-500">{invoice.customer.address}</div>}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Subscription</span>
              <p className="font-semibold text-slate-900">{invoice.subscription.subscriptionNo}</p>
              <p className="text-xs text-slate-500">Interval: {invoice.subscription.billingInterval}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Issue Date</span>
              <p className="font-semibold text-slate-900">{formatDate(invoice.issuedAt)}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Billing Period</span>
              <p className="font-semibold text-slate-900">
                {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
              </p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Due Date</span>
              <p className="font-semibold text-indigo-600">{formatDate(invoice.dueAt)}</p>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50">
                <th className="py-3 px-3">Description</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Unit Price</th>
                <th className="py-3 px-3 text-right">Subtotal</th>
                <th className="py-3 px-3 text-right">Discount</th>
                <th className="py-3 px-3 text-right">Tax Rate</th>
                <th className="py-3 px-3 text-right">Tax</th>
                <th className="py-3 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.lines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-slate-900">{line.descriptionSnapshot}</td>
                  <td className="py-3 px-3 text-center text-slate-600">{line.quantity}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(line.unitPricePaise)}</td>
                  <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(line.subtotalPaise)}</td>
                  <td className="py-3 px-3 text-right text-emerald-600 font-medium">
                    {line.discountPaise > 0 ? `-${formatCurrency(line.discountPaise)}` : '—'}
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500">{(line.taxRateBps / 100).toFixed(1)}%</td>
                  <td className="py-3 px-3 text-right text-slate-600">{formatCurrency(line.taxPaise)}</td>
                  <td className="py-3 px-3 text-right font-semibold text-slate-900">
                    {formatCurrency(line.totalPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Breakdown Totals */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-6">
          <div className="text-xs text-slate-400 space-y-1">
            <p>Payment Terms: Due within scheduled terms.</p>
            {invoice.discountNameSnapshot && (
              <p className="text-emerald-700 font-medium">Applied Discount Rule: {invoice.discountNameSnapshot}</p>
            )}
            {invoice.sentAt && <p>Email dispatched on: {formatDate(invoice.sentAt)}</p>}
          </div>

          <div className="w-full sm:w-72 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">{formatCurrency(invoice.subtotalPaise)}</span>
            </div>
            {invoice.discountPaise > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Total Discount:</span>
                <span>-{formatCurrency(invoice.discountPaise)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Tax Total:</span>
              <span className="font-medium text-slate-900">{formatCurrency(invoice.taxPaise)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-bold text-slate-900">
              <span>Total Due:</span>
              <span className="text-indigo-600">{formatCurrency(invoice.totalPaise)}</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          This is a computer-generated tax invoice from Brightloop Subscription Control Center.
        </div>
      </div>
    </div>
  );
}
