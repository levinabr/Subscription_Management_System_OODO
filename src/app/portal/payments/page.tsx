'use client';

import React, { useState, useEffect } from 'react';
import { PaymentTable } from '@/components/features/payments/PaymentTable';
import { CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CustomerPortalPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payments?page=${page}&limit=${pagination.limit}`);
      if (res.ok) {
        const data = await res.json();
        setPayments(data.items || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to load customer payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(1);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Link
            href="/portal/invoices"
            className="p-2 border border-slate-300 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              My Payment Receipts
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              History of all payments made towards your account invoices.
            </p>
          </div>
        </div>

        <Link
          href="/portal/invoices"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
        >
          View Statements
        </Link>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
          Loading payment receipts...
        </div>
      ) : (
        <PaymentTable
          payments={payments}
          pagination={pagination}
          onPageChange={(page) => fetchPayments(page)}
          isCustomerPortal={true}
        />
      )}
    </div>
  );
}
