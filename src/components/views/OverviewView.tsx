'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const OverviewView: React.FC = () => {
  const {
    subscriptions,
    invoices,
    setCurrentPage,
    setSelectedInvoice,
    currency,
    exportDataToCsv
  } = useData();

  const [activePeriod, setActivePeriod] = useState<'24h' | '7D' | '30D' | 'Quarter' | 'YTD'>('30D');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; mrr: string; gross: string; month: string } | null>({
    x: 680,
    y: 72,
    mrr: '$338.4k',
    gross: '$396.1k',
    month: 'NOV 2024'
  });
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);

  const activeSubCount = subscriptions.filter(s => s.status === 'active').length;
  const totalMrr = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.mrr, 0);

  // Overdue total
  const overdueTotal = subscriptions
    .filter(s => s.status === 'past_due')
    .reduce((sum, s) => sum + s.mrr, 0) + 47460;

  const currencySymbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'INR' ? '₹' : '$';

  const handleExport = () => {
    exportDataToCsv('executive_overview_metrics', [
      { Metric: 'Gross Revenue (YTD)', Value: '$1,842,950.00' },
      { Metric: 'MRR', Value: `$${totalMrr.toLocaleString()}` },
      { Metric: 'Active Subscriptions', Value: activeSubCount },
      { Metric: 'Retention Rate', Value: '98.6%' },
      { Metric: 'Overdue & Dunning', Value: `$${overdueTotal.toLocaleString()}` }
    ]);
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Executive Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Executive Financial Overview
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1f2b] text-[#4ee6aa] text-xs tracking-wider border border-[#4ee6aa]/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ee6aa] animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Real-time billing, recurring revenue expansion, and subscription cashflow metrics.
          </p>
        </div>

        {/* Period Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#161b27] border border-[#94a3b8]/15">
            {(['24h', '7D', '30D', 'Quarter', 'YTD'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  activePeriod === period
                    ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                    : 'text-[#bdc8d1] hover:text-[#dee2f2]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#161b27] hover:bg-[#1b1f2b] text-[#dee2f2] text-xs font-medium transition-all border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[16px] text-[#87929a]">download</span>
              <span>Export</span>
            </button>
            <button
              onClick={() => setCurrentPage('invoices')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#38bdf8] text-[#00354a] text-xs font-semibold hover:bg-[#8ed5ff] transition-all shadow-[0_0_12px_rgba(56,189,248,0.25)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>New Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top KPI Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between hover:bg-[#1b1f2b] transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
              Total Gross Revenue
            </span>
            <span className="p-2 rounded-lg bg-[#252a36] text-[#38bdf8]">
              <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-semibold text-[#dee2f2] tracking-tight font-mono">
              {currencySymbol}1,842,950<span className="text-[#87929a] text-base font-normal">.00</span>
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[#4ee6aa] font-mono text-xs font-medium">+18.4%</span>
              <span className="text-[#87929a] text-xs">vs prior month</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between hover:bg-[#1b1f2b] transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <span className="p-2 rounded-lg bg-[#252a36] text-[#4ee6aa]">
              <span className="material-symbols-outlined text-[18px]">sync</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-semibold text-[#dee2f2] tracking-tight font-mono">
              {currencySymbol}342,800<span className="text-[#87929a] text-base font-normal">.00</span>
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[#4ee6aa] font-mono text-xs font-medium">+8.2%</span>
              <span className="text-[#87929a] text-xs">+$26.4k net</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between hover:bg-[#1b1f2b] transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
              Active Subscriptions
            </span>
            <span className="p-2 rounded-lg bg-[#252a36] text-[#bdc2ff]">
              <span className="material-symbols-outlined text-[18px]">groups_3</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-semibold text-[#dee2f2] tracking-tight font-mono">
              1,428
            </span>
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[#4ee6aa] font-mono text-xs font-medium">98.6%</span>
              <span className="text-[#87929a] text-xs">retention rate</span>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between hover:bg-[#1b1f2b] transition-all shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
              Overdue & Dunning
            </span>
            <span className="p-2 rounded-lg bg-[#93000a]/20 text-[#ffb4ab]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-3xl font-semibold text-[#ffb4ab] tracking-tight font-mono">
              {currencySymbol}48,210<span className="text-[#ffb4ab]/70 text-base font-normal">.00</span>
            </span>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[#87929a] text-xs font-mono">14 invoices</span>
              <button
                onClick={() => setCurrentPage('invoices')}
                className="text-xs text-[#dee2f2] hover:text-[#38bdf8] transition-colors font-medium flex items-center gap-1"
              >
                Review →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Line Velocity + Donut Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart: Revenue & MRR Velocity (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold text-[#dee2f2] tracking-tight">
                Revenue & MRR Expansion Velocity
              </h2>
              <p className="text-xs text-[#bdc8d1] font-normal">
                Consolidated billing runs vs recognized deferred schedules
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
                <span className="text-xs text-[#bdc8d1] font-medium">MRR</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bdc2ff]" />
                <span className="text-xs text-[#bdc8d1] font-medium">Gross</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 py-3 px-5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 mb-6">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#87929a] uppercase tracking-wider">Current ARR</span>
              <span className="text-lg text-[#38bdf8] font-mono font-semibold mt-1">$4,113,600</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#87929a] uppercase tracking-wider">Net Expansion</span>
              <span className="text-lg text-[#4ee6aa] font-mono font-semibold mt-1">116.4%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-[#87929a] uppercase tracking-wider">Collection Rate</span>
              <span className="text-lg text-[#dee2f2] font-mono font-semibold mt-1">99.1%</span>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative w-full h-56">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 760 220"
            >
              <defs>
                <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <line opacity="0.15" stroke="#3e484f" strokeDasharray="3 3" x1="0" x2="760" y1="50" y2="50" />
              <line opacity="0.15" stroke="#3e484f" strokeDasharray="3 3" x1="0" x2="760" y1="120" y2="120" />
              <line stroke="#3e484f" strokeOpacity="0.2" x1="0" x2="760" y1="205" y2="205" />

              {/* Area fill for MRR */}
              <path
                d="M0,180 L68,174 L136,166 L204,159 L272,148 L340,138 L408,126 L476,114 L544,98 L612,88 L680,72 L760,56 L760,205 L0,205 Z"
                fill="url(#mrrGrad)"
              />

              {/* Gross Curve */}
              <path
                d="M0,165 L68,158 L136,150 L204,142 L272,130 L340,118 L408,105 L476,96 L544,78 L612,68 L680,48 L760,32"
                fill="none"
                stroke="#bdc2ff"
                strokeLinecap="round"
                strokeWidth="2"
              />

              {/* MRR Curve */}
              <path
                d="M0,180 L68,174 L136,166 L204,159 L272,148 L340,138 L408,126 L476,114 L544,98 L612,88 L680,72 L760,56"
                fill="none"
                stroke="#38bdf8"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              <circle cx="680" cy="48" fill="#0e131e" r="4" stroke="#bdc2ff" strokeWidth="2" />
              <circle cx="680" cy="72" fill="#38bdf8" r="4" stroke="#0e131e" strokeWidth="2" />
            </svg>

            {hoveredPoint && (
              <div className="absolute right-10 top-2 p-3 rounded-xl bg-[#252a36]/90 backdrop-blur-md border border-[#94a3b8]/20 flex flex-col gap-1 min-w-[130px] shadow-lg pointer-events-none">
                <span className="text-[10px] text-[#87929a] font-mono font-medium uppercase tracking-wider">
                  {hoveredPoint.month}
                </span>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#bdc8d1]">MRR</span>
                  <span className="text-[#38bdf8] font-semibold">{hoveredPoint.mrr}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#bdc8d1]">Gross</span>
                  <span className="text-[#bdc2ff] font-semibold">{hoveredPoint.gross}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 text-[#87929a] text-xs font-mono px-1">
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span className="text-[#38bdf8] font-semibold">Nov</span>
            <span>Dec</span>
          </div>
        </div>

        {/* Chart: Subscription Status Distribution (1 Col) */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold text-[#dee2f2] tracking-tight">Lifecycle Distribution</h2>
              <span className="text-xs text-[#bdc8d1] font-normal">Subscription retention breakdown</span>
            </div>
            <span className="material-symbols-outlined text-[#87929a] text-[18px]">pie_chart</span>
          </div>

          {/* Donut graphic */}
          <div className="relative flex items-center justify-center my-4">
            <div className="w-40 h-40 relative flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="42" stroke="#1b1f2b" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="42"
                  stroke="#38bdf8"
                  strokeDasharray="264"
                  strokeDashoffset="68"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="42"
                  stroke="#4ee6aa"
                  strokeDasharray="264"
                  strokeDashoffset="227"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="42"
                  stroke="#ffb4ab"
                  strokeDasharray="264"
                  strokeDashoffset="242"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="42"
                  stroke="#bdc2ff"
                  strokeDasharray="264"
                  strokeDashoffset="253"
                  strokeLinecap="round"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-medium text-[#87929a] uppercase tracking-wider">Active</span>
                <span className="text-2xl font-bold font-mono text-[#dee2f2] mt-0.5">1,428</span>
                <span className="text-xs text-[#4ee6aa] font-mono">98.6%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <div className="p-2.5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8]" />
                <span className="text-xs text-[#dee2f2]">Active</span>
              </div>
              <span className="text-xs font-mono font-medium text-[#dee2f2]">74%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#4ee6aa]" />
                <span className="text-xs text-[#dee2f2]">Trialing</span>
              </div>
              <span className="text-xs font-mono font-medium text-[#dee2f2]">14%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ffb4ab]" />
                <span className="text-xs text-[#dee2f2]">Past Due</span>
              </div>
              <span className="text-xs font-mono font-medium text-[#ffb4ab]">8%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#bdc2ff]" />
                <span className="text-xs text-[#dee2f2]">Paused</span>
              </div>
              <span className="text-xs font-mono font-medium text-[#dee2f2]">4%</span>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between border-t border-[#94a3b8]/15 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#87929a] uppercase tracking-wider">LTV:CAC</span>
              <span className="font-mono font-medium text-[#dee2f2]">4.6x</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#87929a] uppercase tracking-wider">Churn</span>
              <span className="font-mono font-medium text-[#4ee6aa]">-0.8%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Operations Row: Auto-Renewal Pipeline & Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Auto-Renewal Pipeline (72 Hours) */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-lg font-semibold text-[#dee2f2] tracking-tight">Auto-Renewal Pipeline</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#1b1f2b] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
                    Next 72 Hours
                  </span>
                </div>
                <span className="text-xs text-[#bdc8d1] font-normal">
                  $184,200 scheduled across 182 corporate accounts
                </span>
              </div>
              <button
                onClick={() => setCurrentPage('recurring-engine')}
                className="p-1.5 rounded-lg text-[#87929a] hover:text-[#dee2f2] transition-colors"
                title="Engine Settings"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {/* Pipeline item 1 */}
              <div className="p-4 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between hover:bg-[#1b1f2b] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#252a36] flex items-center justify-center text-[#38bdf8] flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#dee2f2]">Run #8491 - Tier-1 US Cluster</span>
                      <span className="px-2 py-0.5 rounded bg-[#1b1f2b] text-[#4ee6aa] text-xs font-mono">T-3h</span>
                    </div>
                    <span className="text-xs text-[#87929a] mt-0.5">64 Accounts • ACH & Wire sweep</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-mono text-sm font-semibold text-[#dee2f2]">$82,400.00</span>
                  <span className="font-mono text-xs text-[#4ee6aa] mt-0.5">Pre-validated</span>
                </div>
              </div>

              {/* Pipeline item 2 */}
              <div className="p-4 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between hover:bg-[#1b1f2b] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#252a36] flex items-center justify-center text-[#bdc2ff] flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#dee2f2]">Run #8492 - EU SaaS Mid-Market</span>
                      <span className="px-2 py-0.5 rounded bg-[#1b1f2b] text-[#87929a] text-xs font-mono">08:00</span>
                    </div>
                    <span className="text-xs text-[#87929a] mt-0.5">88 Accounts • SEPA Direct Debit</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-mono text-sm font-semibold text-[#dee2f2]">€61,150.00</span>
                  <span className="font-mono text-xs text-[#87929a] mt-0.5">Batch Ready</span>
                </div>
              </div>

              {/* Pipeline item 3 */}
              <div className="p-4 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between hover:bg-[#1b1f2b] transition-colors">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-[#93000a]/20 flex items-center justify-center text-[#ffb4ab] flex-shrink-0">
                    <span className="material-symbols-outlined text-[18px]">sync_problem</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#dee2f2]">Run #8493 - Custom Overages</span>
                      <span className="px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab] text-xs font-mono">Flagged</span>
                    </div>
                    <span className="text-xs text-[#87929a] mt-0.5">30 Accounts • Expirations pending</span>
                  </div>
                </div>
                <div className="flex flex-col text-right">
                  <span className="font-mono text-sm font-semibold text-[#dee2f2]">$40,650.00</span>
                  <span className="font-mono text-xs text-[#ffb4ab] mt-0.5">3 in Grace</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 text-xs text-[#bdc8d1]">
            <span>
              Engine status: <strong className="text-[#4ee6aa] font-medium">Nominal (0 errors)</strong>
            </span>
            <button
              onClick={() => setCurrentPage('recurring-engine')}
              className="flex items-center gap-1 text-[#38bdf8] hover:text-[#8ed5ff] transition-colors font-medium"
            >
              <span>Execution Logs</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* High-Value Transactions Ledger */}
        <div className="rounded-2xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-semibold text-[#dee2f2] tracking-tight">High-Value Transactions</h2>
                <span className="text-xs text-[#bdc8d1] font-normal">Enterprise billing activities settled & in-flight</span>
              </div>
              <button
                onClick={() => setCurrentPage('invoices')}
                className="px-3 py-1.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] text-xs transition-colors font-medium"
              >
                View All ({invoices.length})
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[#87929a] text-[11px] uppercase tracking-wider border-b border-[#94a3b8]/15">
                    <th className="pb-3 font-medium">Customer Account</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Amount</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#94a3b8]/10 text-sm font-body">
                  {invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#1b1f2b]/60 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded bg-[#252a36] flex items-center justify-center font-semibold text-xs text-[#38bdf8] font-mono">
                            {inv.customerInitials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-[#dee2f2] text-xs sm:text-sm truncate">
                              {inv.customerName}
                            </span>
                            <span className="font-mono text-[11px] text-[#87929a]">{inv.invoiceNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium ${
                            inv.status === 'paid'
                              ? 'bg-[#4ee6aa]/10 text-[#4ee6aa]'
                              : inv.status === 'processing'
                              ? 'bg-[#38bdf8]/10 text-[#38bdf8]'
                              : 'bg-[#93000a]/20 text-[#ffb4ab]'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              inv.status === 'paid'
                                ? 'bg-[#4ee6aa]'
                                : inv.status === 'processing'
                                ? 'bg-[#38bdf8]'
                                : 'bg-[#ffb4ab]'
                            }`}
                          />
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-medium text-[#dee2f2]">
                        ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1 text-[#87929a] hover:text-[#38bdf8] transition-colors"
                          title="View Invoice"
                        >
                          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 text-xs text-[#bdc8d1]">
            <span>
              Settlement provider: <strong className="text-[#dee2f2] font-mono">Stripe Connect v2024-11</strong>
            </span>
            <span className="font-mono text-[#4ee6aa]">Zero Discrepancies</span>
          </div>
        </div>
      </div>

      {/* Operational Telemetry Micro-Bar */}
      <div className="p-4 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ee6aa] animate-pulse" />
            <span className="font-mono text-xs text-[#dee2f2]">
              ENGINE_STATUS: <span className="text-[#4ee6aa]">OPTIMAL</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[#87929a]">
            <span className="opacity-40">|</span>
            <span className="font-mono text-xs">
              Latency: <span className="text-[#dee2f2]">14ms</span>
            </span>
            <span className="opacity-40">|</span>
            <span className="font-mono text-xs">
              Webhooks: <span className="text-[#dee2f2]">99.992%</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono text-xs text-[#87929a]">#89281-LIVE</span>
          <button
            onClick={() => {
              setIsLiveSyncing(true);
              setTimeout(() => setIsLiveSyncing(false), 2000);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
              isLiveSyncing
                ? 'bg-[#4ee6aa]/15 text-[#4ee6aa] border-[#4ee6aa]/30'
                : 'bg-[#252a36] text-[#dee2f2] hover:bg-[#303541] border-[#94a3b8]/15'
            }`}
          >
            {isLiveSyncing ? '✓ Verified (1,428)' : 'Sync'}
          </button>
        </div>
      </div>
    </div>
  );
};
