'use client';

import React from 'react';
import { formatINR } from '../invoices/InvoiceStatusBadge';
import { Calendar, Hash, User, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface PaymentItem {
  id: string;
  amountPaise: number;
  method: string;
  paidAt: string | Date;
  reference?: string | null;
  note?: string | null;
  invoice: {
    id: string;
    invoiceNo: string;
    status: string;
    totalPaise: number;
    customer?: {
      id: string;
      businessName: string;
      billingEmail: string;
    } | null;
  };
  recordedByUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface PaymentTableProps {
  payments: PaymentItem[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  isCustomerPortal?: boolean;
}

export function PaymentTable({
  payments,
  pagination,
  onPageChange,
  isCustomerPortal = false,
}: PaymentTableProps) {
  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'UPI':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'BANK_TRANSFER':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'CARD':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CASH':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (payments.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
        <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-700">No payments found</h4>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          {isCustomerPortal
            ? "You haven't made any payments yet, or no payments match the selected criteria."
            : 'No payments have been recorded yet for this filter selection.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Payment Date</th>
              <th className="py-3.5 px-4">Reference</th>
              <th className="py-3.5 px-4">Invoice #</th>
              {!isCustomerPortal && <th className="py-3.5 px-4">Customer</th>}
              <th className="py-3.5 px-4">Method</th>
              <th className="py-3.5 px-4 text-right">Amount</th>
              {!isCustomerPortal && <th className="py-3.5 px-4">Recorded By</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {payments.map((p) => {
              const invoiceLink = isCustomerPortal
                ? `/portal/invoices/${p.invoice.id}`
                : `/invoices/${p.invoice.id}`;

              return (
                <tr key={p.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">
                        {new Date(p.paidAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {p.reference ? (
                      <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {p.reference}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <Link
                      href={invoiceLink}
                      className="font-semibold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                    >
                      <Hash className="w-3.5 h-3.5" />
                      {p.invoice.invoiceNo}
                    </Link>
                  </td>
                  {!isCustomerPortal && (
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {p.invoice.customer?.businessName || 'Customer'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.invoice.customer?.billingEmail}
                      </div>
                    </td>
                  )}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getMethodBadge(
                        p.method
                      )}`}
                    >
                      {p.method.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right font-bold text-emerald-700">
                    {formatINR(p.amountPaise)}
                  </td>
                  {!isCustomerPortal && (
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.recordedByUser?.name || 'Staff Member'}</span>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} payments
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2.5 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="font-semibold px-2 text-slate-800">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-2.5 py-1.5 border border-slate-300 rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 font-medium"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
