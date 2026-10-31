'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const SubscriptionsView: React.FC = () => {
  const {
    subscriptions,
    selectedSubId,
    setSelectedSubId,
    setIsNewSubModalOpen,
    setIsBulkSubModalOpen,
    pauseSubscription,
    resumeSubscription,
    cancelSubscription,
    upgradeSubscription,
    exportDataToCsv
  } = useData();

  const [subSearch, setSubSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [cycleFilter, setCycleFilter] = useState('all');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradePlanName, setUpgradePlanName] = useState('Enterprise Scale (Plus)');
  const [upgradeMrr, setUpgradeMrr] = useState(3200);
  const [upgradeSeats, setUpgradeSeats] = useState(65);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const trialCount = subscriptions.filter(s => s.status === 'trialing').length;
  const pastDueCount = subscriptions.filter(s => s.status === 'past_due').length;
  const pausedCount = subscriptions.filter(s => s.status === 'paused').length;
  const canceledCount = subscriptions.filter(s => s.status === 'canceled').length;

  const filteredSubs = subscriptions.filter((sub) => {
    const q = subSearch.toLowerCase();
    const matchesSearch =
      !subSearch ||
      sub.id.toLowerCase().includes(q) ||
      sub.customerName.toLowerCase().includes(q) ||
      sub.customerEmail.toLowerCase().includes(q) ||
      sub.planName.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'all' && sub.status !== statusFilter) return false;
    if (tierFilter !== 'all' && sub.planTier !== tierFilter) return false;
    if (cycleFilter !== 'all' && sub.billingCycle !== cycleFilter) return false;
    return true;
  });

  const selectedSub = subscriptions.find(s => s.id === selectedSubId) || subscriptions[0];

  const handleExport = () => {
    exportDataToCsv(
      'subscriptions_ledger',
      filteredSubs.map(s => ({
        SubscriptionID: s.id,
        Customer: s.customerName,
        Plan: s.planName,
        Tier: s.planTier,
        Seats: `${s.seats}/${s.maxSeats}`,
        MRR: s.mrr,
        BillingCycle: s.billingCycle,
        Status: s.status,
        Health: s.health,
        RenewalDate: s.renewalDate,
        Clearinghouse: s.clearinghouse
      }))
    );
  };

  const handleConfirmUpgrade = () => {
    if (selectedSub) {
      upgradeSubscription(selectedSub.id, upgradePlanName, upgradeMrr, upgradeSeats);
      setIsUpgradeModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Subscription Lifecycle Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] font-mono text-xs uppercase tracking-wider border border-[#38bdf8]/20">
              Engine v4.2
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Manage recurring agreements, tiers, seat add-ons, pauses, and automated retention renewals.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setIsBulkSubModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
          >
            <span className="material-symbols-outlined text-[16px] text-[#87929a]">tune</span>
            <span>Bulk Pause / Resume</span>
          </button>
          <button
            onClick={() => setIsNewSubModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#38bdf8] text-[#00354a] text-xs font-semibold hover:bg-[#8ed5ff] transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Create New Subscription</span>
          </button>
        </div>
      </div>

      {/* 5 Lifecycle Bento Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Active */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm hover:bg-[#1b1f2b] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#87929a]">
              Active Subscriptions
            </span>
            <span className="w-2 h-2 rounded-full bg-[#4ee6aa]" />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-mono text-[#dee2f2]">
              {activeCount ? `${activeCount + 1242}` : '1,248'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#4ee6aa]/15 text-[#4ee6aa]">
              Normal
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#94a3b8]/10 flex items-center justify-between text-[11px]">
            <span className="text-[#87929a]">ARR: $3.84M</span>
            <span className="font-mono text-[#4ee6aa]">+3.2% mo</span>
          </div>
        </div>

        {/* Card 2: In Trial */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm hover:bg-[#1b1f2b] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#87929a]">
              In Trial Mode
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">hourglass_top</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-mono text-[#dee2f2]">
              {trialCount ? `${trialCount + 93}` : '94'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#38bdf8]/15 text-[#38bdf8]">
              Conv 64%
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#94a3b8]/10 flex items-center justify-between text-[11px]">
            <span className="text-[#87929a]">14d Exp Avg</span>
            <span className="font-mono text-[#38bdf8]">+12 wk</span>
          </div>
        </div>

        {/* Card 3: Past Due */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm hover:bg-[#1b1f2b] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#87929a]">
              Past Due / Dunning
            </span>
            <span className="w-2 h-2 rounded-full bg-[#ffb4ab]" />
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-mono text-[#ffb4ab]">
              {pastDueCount ? `${pastDueCount + 37}` : '38'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#93000a]/30 text-[#ffb4ab]">
              Retry
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#94a3b8]/10 flex items-center justify-between text-[11px]">
            <span className="text-[#87929a]">$18.4k at risk</span>
            <span className="font-mono text-[#4ee6aa]">68% saved</span>
          </div>
        </div>

        {/* Card 4: Temporarily Paused */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm hover:bg-[#1b1f2b] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#87929a]">
              Temporarily Paused
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#bdc2ff]">pause_circle</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-mono text-[#bdc2ff]">
              {pausedCount ? `${pausedCount + 25}` : '26'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2f3aa3]/30 text-[#bdc2ff]">
              Active Save
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#94a3b8]/10 flex items-center justify-between text-[11px]">
            <span className="text-[#87929a]">Hold: 42d</span>
            <span className="font-mono text-[#87929a]">8 unpausing</span>
          </div>
        </div>

        {/* Card 5: Canceled */}
        <div className="col-span-2 md:col-span-1 flex flex-col justify-between p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm hover:bg-[#1b1f2b] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#87929a]">
              Canceled / Churned
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#87929a]">block</span>
          </div>
          <div className="flex items-baseline justify-between mt-3">
            <span className="text-2xl font-bold font-mono text-[#87929a]">
              {canceledCount ? `${canceledCount + 21}` : '22'}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#252a36] text-[#87929a]">
              Cycle
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#94a3b8]/10 flex items-center justify-between text-[11px]">
            <span className="text-[#87929a]">Churn: 0.81%</span>
            <span className="font-mono text-[#4ee6aa]">-0.14%</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-2 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15">
        <div className="flex items-center flex-1 min-w-[280px] bg-[#090e19]/70 rounded-lg px-3 py-1.5 gap-2 border border-[#94a3b8]/10 focus-within:border-[#38bdf8]/40 transition-all">
          <span className="material-symbols-outlined text-[#87929a] text-[18px]">search</span>
          <input
            type="text"
            value={subSearch}
            onChange={(e) => setSubSearch(e.target.value)}
            placeholder="Filter by customer, subscription ID (#SUB), email, plan..."
            className="bg-transparent border-0 outline-none text-[#dee2f2] placeholder:text-[#87929a] text-xs w-full font-sans"
          />
          {subSearch && (
            <button onClick={() => setSubSearch('')} className="text-[#87929a] hover:text-[#dee2f2]">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#252a36] text-[#dee2f2] text-xs rounded-lg px-3 py-2 outline-none border border-[#94a3b8]/15 cursor-pointer"
          >
            <option value="all">Status: All Accounts</option>
            <option value="active">Status: Active Only</option>
            <option value="past_due">Status: Past Due</option>
            <option value="paused">Status: Paused</option>
            <option value="trialing">Status: Trialing</option>
          </select>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="bg-[#252a36] text-[#dee2f2] text-xs rounded-lg px-3 py-2 outline-none border border-[#94a3b8]/15 cursor-pointer"
          >
            <option value="all">Plan Tier: All Tiers</option>
            <option value="Starter">Starter ($290/mo)</option>
            <option value="Pro">Pro Core ($750/mo)</option>
            <option value="Enterprise">Enterprise ($2,450/mo+)</option>
          </select>

          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="bg-[#252a36] text-[#dee2f2] text-xs rounded-lg px-3 py-2 outline-none border border-[#94a3b8]/15 cursor-pointer"
          >
            <option value="all">Cycle: All Terms</option>
            <option value="monthly">Monthly (Auto-renew)</option>
            <option value="annual">Annual Prepaid</option>
            <option value="quarterly">Quarterly</option>
          </select>

          <button
            onClick={() => {
              setSubSearch('');
              setStatusFilter('all');
              setTierFilter('all');
              setCycleFilter('all');
            }}
            className="p-2 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#87929a] hover:text-[#dee2f2] transition-colors border border-[#94a3b8]/15"
            title="Reset Filters"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#87929a] hover:text-[#dee2f2] transition-colors border border-[#94a3b8]/15"
            title="Export CSV"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
          </button>
        </div>
      </div>

      {/* Main Ledger & Detail Drawer Split Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Ledger Table (8 cols on XL) */}
        <div className="xl:col-span-8 flex flex-col rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-md overflow-hidden">
          <div className="px-5 py-3.5 bg-[#090e19]/90 border-b border-[#94a3b8]/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#dee2f2]">Active Ledger Records</span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] font-medium">
                {filteredSubs.length} Records
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#87929a]">
              <span>Sort: Next Renewal (Asc)</span>
              <span className="material-symbols-outlined text-[16px]">swap_vert</span>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#090e19]/70 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
                  <th className="py-3.5 px-5">Subscription & ID</th>
                  <th className="py-3.5 px-5">Customer Account</th>
                  <th className="py-3.5 px-5">Plan / Add-ons</th>
                  <th className="py-3.5 px-5 text-right">MRR Rate</th>
                  <th className="py-3.5 px-5">Renewal Window</th>
                  <th className="py-3.5 px-4">Health</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#94a3b8]/10 text-xs">
                {filteredSubs.map((sub) => {
                  const isSelected = selectedSub?.id === sub.id;
                  return (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubId(sub.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#1b1f2b] border-l-2 border-[#38bdf8]'
                          : 'hover:bg-[#1b1f2b]/60 border-l-2 border-transparent'
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium text-[#38bdf8]">{sub.id}</span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                                sub.status === 'active'
                                  ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                                  : sub.status === 'past_due'
                                  ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                                  : sub.status === 'trialing'
                                  ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                                  : 'bg-[#2f3aa3]/30 text-[#bdc2ff]'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  sub.status === 'active'
                                    ? 'bg-[#4ee6aa]'
                                    : sub.status === 'past_due'
                                    ? 'bg-[#ffb4ab]'
                                    : sub.status === 'trialing'
                                    ? 'bg-[#38bdf8]'
                                    : 'bg-[#bdc2ff]'
                                }`}
                              />
                              {sub.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="font-mono text-[#87929a] text-[10px]">
                            {sub.clearinghouse}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-[#252a36] text-[#38bdf8] flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {sub.customerInitials}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-[#dee2f2] truncate">
                              {sub.customerName}
                            </span>
                            <span className="text-[#87929a] text-[10px] truncate font-mono">
                              {sub.customerEmail}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#dee2f2] font-medium">{sub.planName}</span>
                          <span className="text-[#87929a] text-[10px]">
                            {sub.seats} Seats • {sub.addons.join(', ')}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right font-mono">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="font-semibold text-sm text-[#dee2f2]">
                            ${sub.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[#87929a] text-[10px]">USD / month</span>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[#dee2f2]">{sub.renewalDate}</span>
                          <span className="text-[#38bdf8] text-[10px] font-mono">
                            {sub.renewalDaysLeft > 0 ? `in ${sub.renewalDaysLeft} days` : 'Overdue'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              sub.health === 'Healthy' || sub.health === 'Active' || sub.health === 'Net30 OK'
                                ? 'bg-[#4ee6aa]'
                                : sub.health === 'Card Expired' || sub.health === 'Overdue'
                                ? 'bg-[#ffb4ab]'
                                : 'bg-[#87929a]'
                            }`}
                          />
                          <span className="text-[#bdc8d1] text-[11px]">{sub.health}</span>
                        </div>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSubId(sub.id)}
                            className="p-1.5 rounded-lg bg-[#252a36] hover:bg-[#38bdf8] hover:text-[#00354a] text-[#38bdf8] transition-colors"
                            title="Inspect"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 bg-[#090e19]/90 border-t border-[#94a3b8]/15 flex items-center justify-between text-xs text-[#87929a]">
            <span>Showing {filteredSubs.length} of {subscriptions.length} records</span>
            <span className="font-mono">Engine Latency: 28ms</span>
          </div>
        </div>

        {/* Detail Drawer (4 cols on XL) */}
        {selectedSub && (
          <div className="xl:col-span-4 flex flex-col rounded-xl bg-[#161b27]/90 backdrop-blur-2xl border border-[#94a3b8]/20 shadow-xl overflow-hidden sticky top-20">
            {/* Drawer Header */}
            <div className="p-5 bg-[#090e19]/60 border-b border-[#94a3b8]/15 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4ee6aa]" />
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm font-semibold text-[#dee2f2]">
                    {selectedSub.id}
                  </span>
                  <span className="text-xs text-[#87929a]">{selectedSub.customerName}</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${
                  selectedSub.status === 'active'
                    ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                    : selectedSub.status === 'past_due'
                    ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                    : 'bg-[#38bdf8]/15 text-[#38bdf8]'
                }`}
              >
                {selectedSub.status}
              </span>
            </div>

            {/* Drawer Body */}
            <div className="p-5 flex flex-col gap-5">
              {/* MRR & Credit strip */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#090e19]/70 border border-[#94a3b8]/10">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-[#87929a]">
                    Current Term MRR
                  </span>
                  <span className="text-xl font-mono font-bold text-[#38bdf8] mt-1">
                    ${selectedSub.mrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] font-mono text-[#4ee6aa] mt-0.5">
                    +$350 previous term
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold text-[#87929a]">
                    Credit Ledger
                  </span>
                  <span className="text-xl font-mono font-bold text-[#dee2f2] mt-1">$0.00</span>
                  <span className="text-[10px] text-[#87929a] mt-0.5">No balance due</span>
                </div>
              </div>

              {/* Contract Configuration */}
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-semibold tracking-wider text-[#87929a]">
                  Contract Configuration
                </span>
                <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[#090e19]/50 border border-[#94a3b8]/10 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#87929a]">Core Base Plan</span>
                    <span className="text-[#dee2f2] font-medium">{selectedSub.planName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#87929a]">Licensed Seats</span>
                    <span className="font-mono text-[#dee2f2]">
                      {selectedSub.seats} / {selectedSub.maxSeats} ({Math.round((selectedSub.seats / selectedSub.maxSeats) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#87929a]">Seat Overages</span>
                    <span className="font-mono text-[#dee2f2]">$35 / seat / mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#87929a]">Add-on Services</span>
                    <span className="text-[#4ee6aa] font-medium truncate max-w-[180px]">
                      {selectedSub.addons.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#87929a]">Billing Cycle</span>
                    <span className="font-mono text-[#dee2f2] capitalize">
                      {selectedSub.billingCycle} (Renews {selectedSub.renewalDate})
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Billing Events */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold tracking-wider text-[#87929a]">
                    Recent Billing Events
                  </span>
                  <span className="text-xs font-mono text-[#38bdf8] cursor-pointer hover:underline">
                    View all 14
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 border-l border-[#94a3b8]/20 pl-3 ml-1 text-xs">
                  <div className="flex flex-col gap-0.5 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ee6aa] absolute -left-[16px] top-1.5" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#dee2f2]">Invoice #INV-9821 Settled</span>
                      <span className="font-mono text-[#4ee6aa]">${selectedSub.mrr.toLocaleString()}</span>
                    </div>
                    <span className="text-[10px] text-[#87929a]">Oct 14, 2024 • Visa •••• 9214</span>
                  </div>

                  <div className="flex flex-col gap-0.5 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] absolute -left-[16px] top-1.5" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#dee2f2]">Seats Expanded (+5)</span>
                      <span className="font-mono text-[#38bdf8]">+$175.00/mo</span>
                    </div>
                    <span className="text-[10px] text-[#87929a]">Sep 29, 2024 • Admin: Elena Vance</span>
                  </div>

                  <div className="flex flex-col gap-0.5 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ee6aa] absolute -left-[16px] top-1.5" />
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#dee2f2]">Invoice #INV-8733 Settled</span>
                      <span className="font-mono text-[#4ee6aa]">$2,275.00</span>
                    </div>
                    <span className="text-[10px] text-[#87929a]">Sep 14, 2024 • Visa •••• 9214</span>
                  </div>
                </div>
              </div>

              {/* Lifecycle Actions */}
              <div className="flex flex-col gap-2">
                <span className="text-xs uppercase font-semibold tracking-wider text-[#87929a]">
                  Lifecycle Actions
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] font-medium transition-colors border border-[#94a3b8]/15"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">swap_vert</span>
                    <span>Upgrade Tier</span>
                  </button>

                  {selectedSub.status === 'paused' ? (
                    <button
                      onClick={() => resumeSubscription(selectedSub.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#4ee6aa]/20 hover:bg-[#4ee6aa]/30 text-[#4ee6aa] font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Resume Plan</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => pauseSubscription(selectedSub.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] font-medium transition-colors border border-[#94a3b8]/15"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#bdc2ff]">pause</span>
                      <span>Pause Plan</span>
                    </button>
                  )}

                  {syncFeedback && (
                    <div className="col-span-2 p-2 rounded-lg bg-[#4ee6aa]/15 border border-[#4ee6aa]/30 text-[#4ee6aa] text-[11px] font-medium flex items-center gap-1.5 animate-in fade-in">
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>{syncFeedback}</span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSyncFeedback(`Ledger sync completed for ${selectedSub.id}`);
                      setTimeout(() => setSyncFeedback(null), 3000);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] font-medium transition-colors border border-[#94a3b8]/15"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#4ee6aa]">replay</span>
                    <span>Trigger Sync</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to cancel subscription ${selectedSub.id}?`)) {
                        cancelSubscription(selectedSub.id);
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#93000a]/20 hover:bg-[#93000a]/40 text-[#ffb4ab] font-medium transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                    <span>Cancel Term</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Token footer */}
            <div className="p-3.5 bg-[#090e19]/90 border-t border-[#94a3b8]/15 flex items-center justify-between text-[#87929a] font-mono text-[10px]">
              <span>Token: {selectedSub.tokenRef}</span>
              <button
                onClick={() => {
                  setSyncFeedback(`Telemetry SHA-256 hash verified for ${selectedSub.id}`);
                  setTimeout(() => setSyncFeedback(null), 3000);
                }}
                className="hover:text-[#dee2f2] flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-[12px]">terminal</span> Telemetry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {isUpgradeModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
              <h3 className="text-base font-semibold text-[#dee2f2]">
                Upgrade Subscription {selectedSub.id}
              </h3>
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Target Tier Name
                </label>
                <input
                  type="text"
                  value={upgradePlanName}
                  onChange={(e) => setUpgradePlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  New Monthly MRR ($)
                </label>
                <input
                  type="number"
                  value={upgradeMrr}
                  onChange={(e) => setUpgradeMrr(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Seats Allocation
                </label>
                <input
                  type="number"
                  value={upgradeSeats}
                  onChange={(e) => setUpgradeSeats(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUpgrade}
                className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-semibold text-xs hover:bg-[#8ed5ff]"
              >
                Confirm Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
