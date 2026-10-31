'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Play,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FileCheck,
  ChevronRight,
} from 'lucide-react';

interface PreviewData {
  asOfDate: string;
  totalSubscriptionsChecked: number;
  dueCount: number;
  alreadyInvoicedCount: number;
  excludedByStatusCount: number;
  excludedByExpiryCount: number;
  expectedInvoiceCount: number;
  items: Array<{
    subscriptionId: string;
    subscriptionNo: string;
    customerName: string;
    customerEmail: string;
    status: string;
    periodStart: string;
    periodEnd: string;
    nextBillingAt: string;
    estimatedTotalPaise: number;
    eligible: boolean;
    exclusionReason?: string;
  }>;
}

interface RunResultData {
  asOfDate: string;
  processedCount: number;
  skippedCount: number;
  failedCount: number;
  totalCount: number;
  results: Array<{
    subscriptionId: string;
    subscriptionNo: string;
    status: 'PROCESSED' | 'SKIPPED' | 'FAILED';
    invoiceId?: string;
    invoiceNo?: string;
    totalPaise?: number;
    discountPaise?: number;
    message?: string;
  }>;
}

export default function BillingRunPage() {
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [runningBilling, setRunningBilling] = useState(false);
  const [runResult, setRunResult] = useState<RunResultData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPreview = async () => {
    setLoadingPreview(true);
    setError(null);
    try {
      const res = await fetch(`/api/billing/preview?asOfDate=${new Date(asOfDate).toISOString()}`);
      const data = await res.json();
      if (res.ok) {
        setPreview(data.data);
      } else {
        setError(data.error?.message || 'Failed to fetch billing preview');
      }
    } catch {
      setError('Network error fetching preview');
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    fetchPreview();
  }, [asOfDate]);

  const handleExecuteRun = async () => {
    if (
      !confirm(
        `Are you sure you want to execute billing for as-of date ${asOfDate}? This will generate invoices in DRAFT status for all eligible subscriptions.`
      )
    ) {
      return;
    }

    setRunningBilling(true);
    setError(null);
    setRunResult(null);
    try {
      const res = await fetch('/api/billing/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asOfDate: new Date(asOfDate).toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setRunResult(data.data);
        await fetchPreview(); // refresh preview
      } else {
        setError(data.error?.message || 'Billing run failed');
      }
    } catch {
      setError('Network error during billing execution');
    } finally {
      setRunningBilling(false);
    }
  };

  const formatCurrency = (paise: number) => {
    return '₹' + (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Recurring Billing Engine</h1>
          <p className="text-sm text-slate-500 mt-1">
            Preview due subscriptions, compute accurate discounts & taxes, and orchestrate idempotent billing runs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-slate-300 shadow-sm text-sm">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-xs font-medium">As-of:</span>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="text-slate-900 font-semibold focus:outline-none"
            />
          </div>

          <button
            onClick={fetchPreview}
            disabled={loadingPreview}
            className="p-2.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition-colors disabled:opacity-50"
            title="Refresh Preview"
          >
            <RefreshCw className={`w-4 h-4 ${loadingPreview ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExecuteRun}
            disabled={runningBilling || loadingPreview || Boolean(preview && preview.expectedInvoiceCount === 0)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-white" />
            {runningBilling ? 'Executing Billing...' : 'Execute Billing Run'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Subscriptions</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {preview ? preview.dueCount : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Due on or before {asOfDate}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ready to Invoice</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <FileCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 mt-2">
            {preview ? preview.expectedInvoiceCount : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Will generate DRAFT invoices</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Already Invoiced</span>
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {preview ? preview.alreadyInvoicedCount : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Protected against duplicate billing</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Excluded</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {preview ? preview.excludedByStatusCount + preview.excludedByExpiryCount : '—'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Status: {preview?.excludedByStatusCount || 0} | Expiry: {preview?.excludedByExpiryCount || 0}
          </p>
        </div>
      </div>

      {/* Execution Results Notification Banner */}
      {runResult && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Billing Run Complete</h3>
                <p className="text-xs text-slate-500">
                  {runResult.processedCount} processed, {runResult.skippedCount} skipped, {runResult.failedCount} failed
                </p>
              </div>
            </div>
            <Link
              href="/invoices"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              View Invoices <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
            {runResult.results.map((res, i) => (
              <div key={i} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                      res.status === 'PROCESSED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : res.status === 'SKIPPED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {res.status}
                  </span>
                  <span className="font-mono text-slate-700">{res.subscriptionNo}</span>
                  {res.invoiceNo && <span className="font-mono text-indigo-600">({res.invoiceNo})</span>}
                </div>
                <div className="text-slate-600">
                  {res.totalPaise !== undefined ? formatCurrency(res.totalPaise) : res.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Subscriptions List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Billing Preview Breakdown</h2>
          <span className="text-xs text-slate-500 font-medium">
            {preview ? `${preview.items.length} total subscriptions evaluated` : 'Loading...'}
          </span>
        </div>

        {loadingPreview ? (
          <div className="p-12 text-center text-slate-400 text-sm">Evaluating due subscriptions...</div>
        ) : !preview || preview.items.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">No subscriptions in system.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Subscription</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Billing Period</th>
                  <th className="py-3 px-4">Next Billing Date</th>
                  <th className="py-3 px-4 text-right">Estimated Total</th>
                  <th className="py-3 px-4 text-center">Eligibility</th>
                  <th className="py-3 px-4">Details / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.items.map((item) => (
                  <tr key={item.subscriptionId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-900">
                      {item.subscriptionNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{item.customerName}</div>
                      <div className="text-xs text-slate-500">{item.customerEmail}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {formatDate(item.periodStart)} – {formatDate(item.periodEnd)}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">{formatDate(item.nextBillingAt)}</td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-900">
                      {item.eligible ? formatCurrency(item.estimatedTotalPaise) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {item.eligible ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          Due & Eligible
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          Excluded
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {item.exclusionReason || 'Ready for invoice generation'}
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
