'use client';

import React, { useState, useEffect } from 'react';
import { MetricCard } from '@/components/features/dashboard/MetricCard';
import { RevenueChart } from '@/components/features/dashboard/RevenueChart';
import { InvoiceStatusBadge, formatINR } from '@/components/features/invoices/InvoiceStatusBadge';
import {
  Users,
  TrendingUp,
  Receipt,
  AlertTriangle,
  FileCheck2,
  Clock,
  ArrowRight,
  Filter,
  RefreshCw,
  CreditCard,
  Package,
  CalendarCheck,
  Percent,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [period, setPeriod] = useState<string>('month');
  const [loading, setLoading] = useState<boolean>(true);
  const [summary, setSummary] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, revRes] = await Promise.all([
        fetch(`/api/dashboard/summary?period=${period}`),
        fetch(`/api/dashboard/revenue?period=${period}`),
      ]);

      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
      if (revRes.ok) {
        const revData = await revRes.json();
        setRevenueTrend(revData);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const metrics = summary?.metrics;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Control Center & Revenue Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time financial visibility into subscriptions, cash inflows, invoice balances, and catalog foundations.
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-1 shadow-sm text-xs font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            <span className="text-slate-500 mr-1">Period:</span>
            {[
              { id: 'month', label: 'This Month' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'quarter', label: 'This Quarter' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-2.5 py-1 rounded-md transition ${
                  period === p.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estimated MRR */}
        <MetricCard
          title="Estimated MRR"
          value={metrics ? formatINR(metrics.estimatedMrrPaise) : '₹0.00'}
          subtitle="Normalized monthly recurring revenue snapshot"
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          badge={{ text: 'Estimated MRR', variant: 'emerald' }}
        />

        {/* Payments Received in Period */}
        <MetricCard
          title="Payments Received"
          value={metrics ? formatINR(metrics.paymentsReceivedPeriodPaise) : '₹0.00'}
          subtitle={`${metrics?.paymentsReceivedCount || 0} recorded payments in ${summary?.period?.label || 'period'}`}
          icon={<Receipt className="w-5 h-5 text-blue-600" />}
          badge={{ text: summary?.period?.label || 'Period', variant: 'blue' }}
        />

        {/* Outstanding Invoice Balance */}
        <MetricCard
          title="Outstanding Balance"
          value={metrics ? formatINR(metrics.outstandingBalancePaise) : '₹0.00'}
          subtitle="Unpaid amount on active confirmed invoices"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          badge={{
            text: (metrics?.outstandingBalancePaise || 0) > 0 ? 'Pending' : 'Settled',
            variant: (metrics?.outstandingBalancePaise || 0) > 0 ? 'amber' : 'emerald',
          }}
        />

        {/* Overdue Invoices Count */}
        <MetricCard
          title="Overdue Invoices"
          value={metrics ? metrics.overdueInvoiceCount.toString() : '0'}
          subtitle="Confirmed invoices past due with unpaid balance"
          icon={<AlertTriangle className="w-5 h-5 text-rose-600" />}
          badge={{
            text: (metrics?.overdueInvoiceCount || 0) > 0 ? 'Action Needed' : 'All Clear',
            variant: (metrics?.overdueInvoiceCount || 0) > 0 ? 'rose' : 'emerald',
          }}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Active Subscriptions
            </div>
            <div className="text-xl font-bold text-slate-900">
              {metrics?.activeSubscriptions || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Confirmed Invoices
            </div>
            <div className="text-xl font-bold text-slate-900">
              {metrics?.totalConfirmedInvoices || 0}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0 sm:pl-4">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase text-slate-500">
              Fully Paid Invoices
            </div>
            <div className="text-xl font-bold text-slate-900">
              {metrics?.totalPaidInvoices || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Foundation Quick Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Catalog & Configuration Modules
            </h3>
            <p className="text-xs text-slate-500">
              Configure products, subscription intervals, basis-point tax rules, and customer accounts
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <Link
            href="/catalog/products"
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition group"
          >
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Products</div>
              <div className="text-[11px] text-slate-500">Catalog & SKUs</div>
            </div>
          </Link>

          <Link
            href="/catalog/plans"
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition group"
          >
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Plans</div>
              <div className="text-[11px] text-slate-500">Cadences & pricing</div>
            </div>
          </Link>

          <Link
            href="/catalog/taxes"
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 transition group"
          >
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Tax Rules</div>
              <div className="text-[11px] text-slate-500">Basis-point rates</div>
            </div>
          </Link>

          <Link
            href="/customers"
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-purple-300 hover:bg-purple-50/30 transition group"
          >
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Customers</div>
              <div className="text-[11px] text-slate-500">Business profiles</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Revenue Trend Chart & Invoice Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueTrend?.trend || []} />
        </div>

        {/* Invoice Status Breakdown */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Invoice Portfolio</h3>
            <p className="text-xs text-slate-500 mt-0.5">Status distribution across all invoices</p>

            <div className="mt-5 space-y-3">
              {summary?.invoiceBreakdown && summary.invoiceBreakdown.length > 0 ? (
                summary.invoiceBreakdown.map((item: any) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2">
                      <InvoiceStatusBadge status={item.status} />
                      <span className="text-xs font-semibold text-slate-500">
                        ({item.count})
                      </span>
                    </div>
                    <div className="font-bold text-sm text-slate-800">
                      {formatINR(item.totalPaise)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  No invoices created yet
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              href="/invoices"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 flex items-center justify-between"
            >
              <span>Explore all invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Overdue Invoices Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Overdue Invoices Awaiting Collection
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chase these customer balances immediately to protect monthly cash flow
            </p>
          </div>
          <Link
            href="/invoices?isOverdue=true"
            className="text-xs font-semibold text-rose-600 hover:text-rose-800 px-3 py-1 bg-rose-50 border border-rose-200 rounded-md"
          >
            View All Overdue ({metrics?.overdueInvoiceCount || 0})
          </Link>
        </div>

        {summary?.overdueInvoices && summary.overdueInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-rose-50/40 text-xs font-semibold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Overdue Days</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary.overdueInvoices.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="text-emerald-600 hover:underline"
                      >
                        #{inv.invoiceNo}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">
                      {inv.customerName}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {new Date(inv.dueAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        {inv.daysOverdue} day{inv.daysOverdue !== 1 ? 's' : ''} overdue
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-rose-700">
                      {formatINR(inv.outstandingPaise)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-800"
                      >
                        Record Payment <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 text-sm">
            🎉 Great job! There are currently no overdue invoices.
          </div>
        )}
      </div>

      {/* Recent Payments Feed */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Payments</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest receipts credited to client invoices</p>
          </div>
          <Link
            href="/payments"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            View all payments
          </Link>
        </div>

        {summary?.recentPayments && summary.recentPayments.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {summary.recentPayments.map((p: any) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 rounded px-2 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {p.customerName}
                    </div>
                    <div className="text-xs text-slate-400">
                      Invoice #{p.invoiceNo} • {p.method} • {new Date(p.paidAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-700">
                    +{formatINR(p.amountPaise)}
                  </div>
                  {p.reference && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      {p.reference}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-slate-400">
            No payments recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
