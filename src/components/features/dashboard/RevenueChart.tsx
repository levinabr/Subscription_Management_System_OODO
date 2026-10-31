'use client';

import React from 'react';
import { formatINR } from '../invoices/InvoiceStatusBadge';
import { BarChart3 } from 'lucide-react';

interface RevenueDataPoint {
  key: string;
  label: string;
  totalPaise: number;
  count: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  title?: string;
  subtitle?: string;
}

export function RevenueChart({
  data,
  title = 'Monthly Revenue Trend',
  subtitle = 'Revenue collected based on real payment recording dates',
}: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
        <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-700">No revenue data recorded</h4>
        <p className="text-xs text-slate-500 mt-1">
          Revenue is calculated from recorded invoice payments in the selected period.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.totalPaise), 1);

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
          Total: {formatINR(data.reduce((sum, d) => sum + d.totalPaise, 0))}
        </div>
      </div>

      <div className="pt-4 pb-2">
        <div className="h-48 flex items-end gap-3 sm:gap-6 border-b border-slate-200 px-2">
          {data.map((item) => {
            const heightPercent = Math.max(8, Math.round((item.totalPaise / maxVal) * 100));

            return (
              <div
                key={item.key}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] rounded px-2 py-1 shadow pointer-events-none whitespace-nowrap z-10 text-center">
                  <div className="font-bold">{formatINR(item.totalPaise)}</div>
                  <div className="text-slate-400">{item.count} payment{item.count !== 1 ? 's' : ''}</div>
                </div>

                {/* Bar */}
                <div
                  style={{ height: `${heightPercent}%` }}
                  className="w-full max-w-[48px] bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all cursor-pointer relative"
                />

                <div className="text-[11px] font-semibold text-slate-600 mt-2 truncate w-full text-center">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
