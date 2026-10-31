'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const ReportsView: React.FC = () => {
  const { exportDataToCsv } = useData();
  const [reportTimeframe, setReportTimeframe] = useState<'30D' | 'Quarter' | 'YTD'>('30D');

  const cohorts = [
    { cohort: '2023 Q4', size: 120, m1: '100%', m3: '96%', m6: '94%', m12: '92%', nrr: '118%' },
    { cohort: '2024 Q1', size: 145, m1: '100%', m3: '97%', m6: '95%', m12: '94%', nrr: '122%' },
    { cohort: '2024 Q2', size: 180, m1: '100%', m3: '98%', m6: '96%', m12: '--', nrr: '124%' },
    { cohort: '2024 Q3', size: 210, m1: '100%', m3: '98%', m6: '--', m12: '--', nrr: '126%' },
  ];

  const handleExport = () => {
    exportDataToCsv('financial_reports_cohorts', cohorts);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Reports & Financial Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
              SaaS Intelligence
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Cohort retention matrix, Net Revenue Retention (NRR), churn velocity, and MRR expansion waterfall analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-[#161b27] border border-[#94a3b8]/15">
            {(['30D', 'Quarter', 'YTD'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setReportTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  reportTimeframe === t
                    ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                    : 'text-[#bdc8d1] hover:text-[#dee2f2]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
          >
            <span className="material-symbols-outlined text-[16px] text-[#87929a]">download</span>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* MRR Waterfall Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
          <span className="text-[10px] font-semibold text-[#87929a] uppercase">Starting MRR</span>
          <div className="text-xl font-mono font-bold text-[#dee2f2] mt-1">$316,400</div>
          <span className="text-[11px] text-[#87929a] mt-0.5 block">Baseline 1st of month</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
          <span className="text-[10px] font-semibold text-[#4ee6aa] uppercase">+ New Bookings</span>
          <div className="text-xl font-mono font-bold text-[#4ee6aa] mt-1">+$18,200</div>
          <span className="text-[11px] text-[#4ee6aa] mt-0.5 block">14 new enterprise accounts</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
          <span className="text-[10px] font-semibold text-[#38bdf8] uppercase">+ Expansions</span>
          <div className="text-xl font-mono font-bold text-[#38bdf8] mt-1">+$12,450</div>
          <span className="text-[11px] text-[#38bdf8] mt-0.5 block">Seat & add-on upgrades</span>
        </div>

        <div className="p-4 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
          <span className="text-[10px] font-semibold text-[#ffb4ab] uppercase">- Contraction & Churn</span>
          <div className="text-xl font-mono font-bold text-[#ffb4ab] mt-1">-$4,250</div>
          <span className="text-[11px] text-[#ffb4ab] mt-0.5 block">0.81% churn velocity</span>
        </div>

        <div className="col-span-2 md:col-span-1 p-4 rounded-xl bg-[#252a36] border border-[#38bdf8]/30 shadow-md">
          <span className="text-[10px] font-semibold text-[#38bdf8] uppercase">Net Active MRR</span>
          <div className="text-xl font-mono font-bold text-[#38bdf8] mt-1">$342,800</div>
          <span className="text-[11px] text-[#4ee6aa] font-mono mt-0.5 block">+8.2% expansion</span>
        </div>
      </div>

      {/* Cohort Matrix */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-[#dee2f2]">Cohort Retention & NRR Matrix</h3>
            <span className="text-xs text-[#87929a]">Logarithmic cohort retention across rolling quarters</span>
          </div>
          <span className="text-xs font-mono text-[#4ee6aa] font-semibold">118.2% Avg Net Retention</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-[#87929a] uppercase text-[10px] border-b border-[#94a3b8]/15">
                <th className="py-3 font-sans">Cohort Quarter</th>
                <th className="py-3 text-center font-sans">Size</th>
                <th className="py-3 text-center">Month 1</th>
                <th className="py-3 text-center">Month 3</th>
                <th className="py-3 text-center">Month 6</th>
                <th className="py-3 text-center">Month 12</th>
                <th className="py-3 text-right font-sans">Net Expansion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94a3b8]/10">
              {cohorts.map((row, i) => (
                <tr key={i} className="hover:bg-[#1b1f2b]/60 transition-colors">
                  <td className="py-3.5 font-sans font-semibold text-[#dee2f2]">{row.cohort}</td>
                  <td className="py-3.5 text-center text-[#87929a]">{row.size} accounts</td>
                  <td className="py-3.5 text-center text-[#4ee6aa] bg-[#4ee6aa]/5">{row.m1}</td>
                  <td className="py-3.5 text-center text-[#4ee6aa] bg-[#4ee6aa]/5">{row.m3}</td>
                  <td className="py-3.5 text-center text-[#4ee6aa] bg-[#4ee6aa]/5">{row.m6}</td>
                  <td className="py-3.5 text-center text-[#dee2f2]">{row.m12}</td>
                  <td className="py-3.5 text-right font-bold text-[#38bdf8]">{row.nrr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
