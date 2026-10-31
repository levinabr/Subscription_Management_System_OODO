'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { InvoicePrintView } from '@/components/features/invoices/invoice-print-view';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export default function InvoiceDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/invoices/${id}`);
      const data = await res.json();
      if (res.ok) {
        setInvoice(data.data);
      } else {
        setError(data.error?.message || 'Invoice not found');
      }
    } catch {
      setError('Network error loading invoice details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  return (
    <div className="space-y-6">
      <div className="no-print">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </Link>
      </div>

      {loading && (
        <div className="bg-white p-12 text-center text-slate-400 rounded-xl border border-slate-200">
          Loading invoice details...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {!loading && invoice && (
        <InvoicePrintView invoice={invoice} onStatusChange={fetchInvoice} />
      )}
    </div>
  );
}
