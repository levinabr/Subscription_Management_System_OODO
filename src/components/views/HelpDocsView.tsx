'use client';
import React from 'react';

export const HelpDocsView: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 pb-12 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
            Help & Architectural Documentation
          </h1>
          <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
            Developer & Finance Guide
          </span>
        </div>
        <p className="text-sm text-[#bdc8d1] font-normal">
          Comprehensive mathematical specifications for second-precision proration, automated smart dunning sequencing, and multi-clearinghouse routing.
        </p>
      </div>

      {/* Doc Section 1: Proration Math */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">functions</span>
          <h3 className="text-base font-semibold text-[#dee2f2]">1. Second-Precision Proration Mathematics</h3>
        </div>
        <p className="text-xs text-[#bdc8d1] leading-relaxed">
          When a customer changes seat counts, upgrades tier, or adds modular platform add-ons mid-cycle, PLANZO applies an exact timestamp calculation:
        </p>
        <div className="p-4 rounded-lg bg-[#090e19] border border-[#94a3b8]/15 font-mono text-xs text-[#38bdf8]">
          <code>
            {`Proration Credit = -1 * (BasePrice * (RemainingSecondsInCycle / TotalCycleSeconds))`}
            <br />
            {`Proration Charge = NewPrice * (RemainingSecondsInCycle / TotalCycleSeconds)`}
            <br />
            {`Net Immediate Charge = max(0, ProrationCharge - ProrationCredit)`}
          </code>
        </div>
        <span className="text-[11px] text-[#87929a]">
          Any unapplied positive credit balance is automatically logged to the customer&apos;s credit ledger and decremented from the subsequent scheduled batch billing sweep.
        </span>
      </div>

      {/* Doc Section 2: Smart Dunning */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#ffb4ab] text-[20px]">sync_problem</span>
          <h3 className="text-base font-semibold text-[#dee2f2]">2. Autonomous Smart Dunning Architecture</h3>
        </div>
        <p className="text-xs text-[#bdc8d1] leading-relaxed">
          Failed card sweeps automatically trigger our three-phase smart dunning lifecycle:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-[#090e19] border border-[#94a3b8]/10 flex flex-col gap-1">
            <span className="text-[#38bdf8] font-mono font-semibold">Phase 1: T+24h</span>
            <span className="text-[#dee2f2] font-medium">Silent Network Retry</span>
            <span className="text-[11px] text-[#87929a]">Retries off-peak via alternative issuer network rails without disturbing customer.</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#090e19] border border-[#94a3b8]/10 flex flex-col gap-1">
            <span className="text-[#bdc2ff] font-mono font-semibold">Phase 2: T+72h</span>
            <span className="text-[#dee2f2] font-medium">Card Updater & Email</span>
            <span className="text-[11px] text-[#87929a]">Queries Visa/Mastercard auto-updater; dispatches secure 1-click update link.</span>
          </div>
          <div className="p-3.5 rounded-lg bg-[#090e19] border border-[#94a3b8]/10 flex flex-col gap-1">
            <span className="text-[#ffb4ab] font-mono font-semibold">Phase 3: T+120h</span>
            <span className="text-[#dee2f2] font-medium">Grace Hold & Escalation</span>
            <span className="text-[11px] text-[#87929a]">Flags account for manual review in Financial Ops before service restriction.</span>
          </div>
        </div>
      </div>

      {/* Doc Section 3: Webhook Spec */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 shadow-md flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#4ee6aa] text-[20px]">code</span>
          <h3 className="text-base font-semibold text-[#dee2f2]">3. Downstream Webhook Event Dispatcher</h3>
        </div>
        <p className="text-xs text-[#bdc8d1] leading-relaxed">
          PLANZO emits standard HMAC-SHA256 signed JSON webhook payloads for consumption by ERPs:
        </p>
        <div className="p-4 rounded-lg bg-[#090e19] border border-[#94a3b8]/15 font-mono text-xs text-[#dee2f2] overflow-x-auto">
          <pre>{`{
  "event_id": "evt_live_89102482",
  "event_type": "billing.batch_run.completed",
  "created_at": "2026-10-31T01:05:00Z",
  "data": {
    "batch_id": "run_2024_10b",
    "total_accounts": 362,
    "gross_settled_amount": 271800.00,
    "currency": "USD",
    "status": "COMPLETED",
    "reconciliation_hash": "sha256_88b19f0918c019..."
  }
}`}</pre>
        </div>
      </div>
    </div>
  );
};
