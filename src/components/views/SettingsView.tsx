'use client';
import React, { useState } from 'react';

export const SettingsView: React.FC = () => {
  const [orgName, setOrgName] = useState('PLANZO Finance Inc.');
  const [orgEmail, setOrgEmail] = useState('finance-ops@planzo.io');
  const [taxNexusEnabled, setTaxNexusEnabled] = useState(true);
  const [prorationPrecision, setProrationPrecision] = useState('second');
  const [dunningAttempts, setDunningAttempts] = useState('3');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              System Configuration & Clearinghouse Architecture
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
              SYS-ENV-V4.2
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Configure settlement gateways, state tax nexus rules, smart dunning parameters, and webhook event dispatchers.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1.5 rounded-lg bg-[#4ee6aa]/20 text-[#4ee6aa] font-mono text-xs font-semibold animate-fade-in">
            ✓ Configuration Persisted to Ledger
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Organization Information */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#94a3b8]/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">domain</span>
              <h3 className="text-base font-semibold text-[#dee2f2]">Corporate Entity & Billing Identity</h3>
            </div>
            <span className="text-xs text-[#87929a] font-mono">ID: org_planzo_live</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#090e19] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Billing Operations Contact Email
              </label>
              <input
                type="email"
                value={orgEmail}
                onChange={(e) => setOrgEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#090e19] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Gateways & Clearinghouses */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#94a3b8]/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ee6aa] text-[20px]">account_balance</span>
              <h3 className="text-base font-semibold text-[#dee2f2]">Connected Payment Clearinghouses</h3>
            </div>
            <span className="text-xs font-mono text-[#4ee6aa]">4 Connected</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-lg bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-[#252a36] text-[#38bdf8] font-bold text-xs font-mono">
                  STRIPE
                </span>
                <div>
                  <span className="font-semibold text-[#dee2f2] block">Stripe Connect v2024-11</span>
                  <span className="text-[10px] text-[#87929a]">Primary credit card & ACH gateway</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#4ee6aa]">ACTIVE</span>
            </div>

            <div className="p-4 rounded-lg bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded bg-[#252a36] text-[#bdc2ff] font-bold text-xs font-mono">
                  ADYEN
                </span>
                <div>
                  <span className="font-semibold text-[#dee2f2] block">Adyen EU & UK Direct</span>
                  <span className="text-[10px] text-[#87929a]">BACS & SEPA Direct sweeps</span>
                </div>
              </div>
              <span className="text-[11px] font-mono text-[#4ee6aa]">ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Autonomous Engine & Smart Dunning */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 shadow-md flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#94a3b8]/15">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#bdc2ff] text-[20px]">sync_alt</span>
              <h3 className="text-base font-semibold text-[#dee2f2]">Autonomous Engine & Dunning Rules</h3>
            </div>
            <span className="text-xs font-mono text-[#bdc2ff]">Proration V4.2</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Proration Precision
              </label>
              <select
                value={prorationPrecision}
                onChange={(e) => setProrationPrecision(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#090e19] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              >
                <option value="second">Second-Precision Calendar Slice</option>
                <option value="day">Day-Precision Proration</option>
                <option value="month">Full Month Lockout</option>
              </select>
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Smart Dunning Max Attempts
              </label>
              <select
                value={dunningAttempts}
                onChange={(e) => setDunningAttempts(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#090e19] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              >
                <option value="3">3 Attempts (T+24h, T+72h, T+120h)</option>
                <option value="4">4 Attempts (Extended Grace 14 Days)</option>
                <option value="2">2 Attempts (Aggressive Churn Freeze)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Automated Tax Nexus Sync
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={taxNexusEnabled}
                  onChange={(e) => setTaxNexusEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-[#38bdf8] focus:ring-0 cursor-pointer"
                />
                <span className="text-xs text-[#dee2f2]">Synchronize TaxJar API automatically</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] font-semibold text-xs transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            Save Engine Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
