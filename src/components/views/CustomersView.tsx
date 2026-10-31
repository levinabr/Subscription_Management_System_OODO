'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Customer } from '../../types';

export const CustomersView: React.FC = () => {
  const {
    customers,
    selectedCustomerId,
    setSelectedCustomerId,
    setIsAddCustomerModalOpen,
    setIsNewSubModalOpen,
    exportDataToCsv,
    setCurrentPage,
    subscriptions,
    issueCreditNote,
    updateCustomer
  } = useData();

  const [activeTab, setActiveTab] = useState<'all' | 'enterprise' | 'growth' | 'at_risk' | 'new'>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Filter customers by tab & search query
  const filteredCustomers = customers.filter((cust) => {
    // Search match
    const q = filterSearch.toLowerCase();
    const matchesSearch =
      !filterSearch ||
      cust.name.toLowerCase().includes(q) ||
      cust.email.toLowerCase().includes(q) ||
      cust.taxId.toLowerCase().includes(q) ||
      cust.id.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'enterprise') return cust.tier === 'Enterprise' || cust.tier === 'Tier 1';
    if (activeTab === 'growth') return cust.tier === 'Growth' || cust.tier === 'Tier 2';
    if (activeTab === 'at_risk') return cust.status === 'past_due' || cust.outstandingBalance > 0;
    if (activeTab === 'new') return cust.joinedDate.includes('2024');
    return true;
  });

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Related subscriptions for selected customer
  const customerSubs = subscriptions.filter((s) => s.customerId === selectedCustomer?.id);

  const handleExport = () => {
    exportDataToCsv(
      'customer_directory',
      filteredCustomers.map((c) => ({
        ID: c.id,
        Name: c.name,
        Email: c.email,
        Tier: c.tier,
        Status: c.status,
        ARR: c.currentArr,
        LTV: c.lifetimeValue,
        Outstanding: c.outstandingBalance,
        Joined: c.joinedDate
      }))
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Customer Accounts & Financial Health
            </h1>
            <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-[#161b27] text-[#38bdf8] font-medium border border-[#38bdf8]/20 tracking-wide">
              {customers.length.toLocaleString()} ACCOUNTS
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] max-w-2xl font-normal">
            Centralized directory of subscription accounts, payment orchestration telemetry, credit lines, and cohort LTV metrics.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
          >
            <span className="material-symbols-outlined text-[16px] text-[#87929a]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsAddCustomerModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-xs font-semibold transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Add Customer</span>
          </button>
        </div>
      </div>

      {/* High-Level Customer Health Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#87929a]">
              Total Accounts
            </span>
            <span className="p-2 rounded-lg bg-[#252a36] text-[#38bdf8]">
              <span className="material-symbols-outlined text-[18px]">corporate_fare</span>
            </span>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-[#dee2f2]">
              {customers.length.toLocaleString()}
            </span>
            <span className="text-xs font-mono font-medium text-[#4ee6aa] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+42 this mo
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#87929a]">
              Avg Revenue / Account
            </span>
            <span className="p-2 rounded-lg bg-[#252a36] text-[#4ee6aa]">
              <span className="material-symbols-outlined text-[18px]">monetization_on</span>
            </span>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-[#dee2f2]">$840.00</span>
            <span className="text-xs font-mono font-medium text-[#4ee6aa] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>+6.4%
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#87929a]">
              Accounts with Balances
            </span>
            <span className="p-2 rounded-lg bg-[#93000a]/20 text-[#ffb4ab]">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </span>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-[#ffb4ab]">
              {customers.filter((c) => c.outstandingBalance > 0).length || 2}
            </span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#93000a]/20 text-[#ffb4ab]">
              $24,800 due
            </span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#87929a]">
              Net Retention Rate
            </span>
            <span className="p-2 rounded-lg bg-[#252a36] text-[#bdc2ff]">
              <span className="material-symbols-outlined text-[18px]">all_inclusive</span>
            </span>
          </div>
          <div className="mt-6 flex items-baseline justify-between">
            <span className="text-3xl font-bold font-mono text-[#dee2f2]">118.2%</span>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#4ee6aa]/15 text-[#4ee6aa]">
              Top Quartile
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Controls, Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 py-2">
        {/* Tab list */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'all'
                ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#161b27]'
              }`}
          >
            All Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'enterprise'
                ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#161b27]'
              }`}
          >
            Enterprise Tier (420)
          </button>
          <button
            onClick={() => setActiveTab('growth')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'growth'
                ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#161b27]'
              }`}
          >
            Growth (890)
          </button>
          <button
            onClick={() => setActiveTab('at_risk')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'at_risk'
                ? 'bg-[#93000a]/30 text-[#ffb4ab] border border-[#ffb4ab]/30'
                : 'text-[#ffb4ab] hover:bg-[#161b27]'
              }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab] animate-pulse" />
            At-Risk (18)
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeTab === 'new'
                ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                : 'text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#161b27]'
              }`}
          >
            New Signups (64)
          </button>
        </div>

        {/* Search & tag filters */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[16px] text-[#87929a]">
              search
            </span>
            <input
              type="text"
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              placeholder="Filter by name, EIN..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-[#161b27]/80 text-[#dee2f2] placeholder:text-[#87929a] text-xs focus:outline-none focus:ring-1 focus:ring-[#38bdf8] border border-[#94a3b8]/15"
            />
            {filterSearch && (
              <button
                onClick={() => setFilterSearch('')}
                className="absolute right-2.5 top-2 text-[#87929a] hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterSearch('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#bdc8d1] hover:text-[#dee2f2] text-xs border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[14px]">public</span>
              <span>US, EU</span>
            </button>
            <button
              onClick={() => setFilterSearch('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#bdc8d1] hover:text-[#dee2f2] text-xs border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[14px]">attach_money</span>
              <span>USD</span>
            </button>
            <button
              onClick={() => {
                if (!isPanelVisible) setIsPanelVisible(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#bdc8d1] hover:text-[#dee2f2] text-xs border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[14px]">tune</span>
              <span>Focus Panel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Table with Integrated Customer Detail Side Sheet */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Customer Directory Table */}
        <div
          className={`${isPanelVisible && selectedCustomer ? 'xl:col-span-8' : 'xl:col-span-12'
            } flex flex-col rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg transition-all`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#090e19]/90 text-[#87929a] text-[11px] font-semibold uppercase tracking-wider border-b border-[#94a3b8]/15">
                  <th className="py-4 px-6">CUSTOMER</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6">PLANS</th>
                  <th className="py-4 px-6 text-right">OUTSTANDING</th>
                  <th className="py-4 px-6 text-right">LTV</th>
                  <th className="py-4 px-6">JOINED</th>
                  <th className="py-4 px-6 text-center">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#94a3b8]/10 text-xs font-normal">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#87929a]">
                      No customers found matching &quot;{filterSearch}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomerId(cust.id);
                          setIsPanelVisible(true);
                        }}
                        className={`cursor-pointer transition-colors ${isSelected
                            ? 'bg-[#1b1f2b] border-l-2 border-[#38bdf8]'
                            : 'hover:bg-[#1b1f2b]/60 border-l-2 border-transparent'
                          }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-9 h-9 rounded-lg bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {cust.avatarInitials}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-[#dee2f2] text-sm truncate">
                                {cust.name}
                              </span>
                              <span className="text-[11px] text-[#87929a] truncate font-mono">
                                {cust.email}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-medium ${cust.status === 'active'
                                ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                                : cust.status === 'past_due'
                                  ? 'bg-[#93000a]/20 text-[#ffb4ab]'
                                  : cust.status === 'trialing'
                                    ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                                    : 'bg-[#1b1f2b] text-[#87929a]'
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cust.status === 'active'
                                  ? 'bg-[#4ee6aa]'
                                  : cust.status === 'past_due'
                                    ? 'bg-[#ffb4ab]'
                                    : cust.status === 'trialing'
                                      ? 'bg-[#38bdf8]'
                                      : 'bg-[#87929a]'
                                }`}
                            />
                            {cust.status === 'active'
                              ? 'Active'
                              : cust.status === 'past_due'
                                ? 'Past Due'
                                : cust.status === 'trialing'
                                  ? 'Trial (12d)'
                                  : 'Paused'}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[#dee2f2] font-medium">{cust.primaryPlan}</span>
                            <span className="text-[#87929a] font-mono text-[10px]">
                              {cust.plansCount} {cust.plansCount === 1 ? 'Plan' : 'Plans'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap font-mono">
                          <span
                            className={
                              cust.outstandingBalance > 0
                                ? 'font-bold text-[#ffb4ab]'
                                : 'text-[#87929a]'
                            }
                          >
                            ${cust.outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-[#dee2f2]">
                          ${cust.lifetimeValue.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-[#87929a] font-mono text-[11px]">
                          {cust.joinedDate}
                        </td>
                        <td className="py-4 px-6 text-center whitespace-nowrap">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCustomerId(cust.id);
                              setIsPanelVisible(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-[#252a36] text-[#87929a] hover:text-[#dee2f2] transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table pagination bar */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-[#090e19]/90 border-t border-[#94a3b8]/15 text-xs text-[#87929a]">
            <div className="flex items-center gap-3">
              <span>
                Showing <strong className="text-[#dee2f2]">1 - {filteredCustomers.length}</strong> of{' '}
                {customers.length} customers
              </span>
              <span>|</span>
              <span>
                Sorted by: <span className="text-[#38bdf8] font-medium">LTV (Descending)</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <button
                disabled
                className="p-1 rounded bg-[#161b27] text-[#87929a] opacity-40 cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <span className="px-2.5 py-0.5 rounded bg-[#252a36] text-[#dee2f2]">1</span>
              <button className="px-2.5 py-0.5 rounded hover:bg-[#161b27] text-[#87929a]">2</button>
              <button className="p-1 rounded bg-[#161b27] text-[#dee2f2] hover:bg-[#252a36]">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Customer Detail Focus Panel / Side Sheet */}
        {isPanelVisible && selectedCustomer && (
          <div className="xl:col-span-4 flex flex-col gap-6 rounded-xl bg-[#161b27]/90 backdrop-blur-2xl border border-[#94a3b8]/20 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
            {/* Ambient Top Glow */}
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-[#38bdf8]/10 blur-3xl pointer-events-none" />

            {/* Panel Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-[#94a3b8]/15 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8]">
                  Customer Profile
                </span>
                <span className="w-2 h-2 rounded-full bg-[#4ee6aa]" />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsNewSubModalOpen(true)}
                  className="p-1.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#87929a] hover:text-[#dee2f2] transition-colors"
                  title="Add new subscription for this customer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                </button>
                <button
                  onClick={() => setIsPanelVisible(false)}
                  className="p-1.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#87929a] hover:text-[#dee2f2] transition-colors"
                  title="Close panel"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>

            {/* Company Identity */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#38bdf8]/15 text-[#38bdf8] flex items-center justify-center font-bold text-lg flex-shrink-0">
                {selectedCustomer.avatarInitials}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-base font-bold text-[#dee2f2] truncate">
                    {selectedCustomer.name}
                  </h2>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#4ee6aa]/15 text-[#4ee6aa] font-semibold flex-shrink-0">
                    {selectedCustomer.tier}
                  </span>
                </div>
                <span className="text-xs text-[#87929a] font-mono mt-0.5 truncate">
                  {selectedCustomer.id}
                </span>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 gap-4 py-3.5 px-4 rounded-xl bg-[#090e19]/70 border border-[#94a3b8]/10">
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#87929a] font-medium">
                  Lifetime Value
                </span>
                <span className="text-lg font-mono font-bold text-[#dee2f2] mt-1">
                  ${selectedCustomer.lifetimeValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] uppercase tracking-wider text-[#87929a] font-medium">
                  Current ARR
                </span>
                <span className="text-lg font-mono font-bold text-[#4ee6aa] mt-1">
                  ${selectedCustomer.currentArr.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Live Payment Method Summary */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#87929a]">
                  Payment Method
                </span>
                <span className="text-xs font-mono text-[#4ee6aa] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090e19]/50 border border-[#94a3b8]/10">
                <div className="flex items-center gap-3">
                  <div className="px-2 py-0.5 rounded bg-[#252a36] text-[#dee2f2] font-mono font-bold text-[11px] uppercase">
                    {selectedCustomer.paymentMethod.type}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-semibold text-[#dee2f2]">
                      •••• {selectedCustomer.paymentMethod.last4 || '4242'}
                    </span>
                    <span className="text-[10px] text-[#87929a]">
                      Exp {selectedCustomer.paymentMethod.expiry || '12/28'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActionFeedback(`Vault token tok_vault_${selectedCustomer.id.slice(-6)} verified with Stripe Connect`);
                    setTimeout(() => setActionFeedback(null), 3000);
                  }}
                  className="text-xs text-[#38bdf8] font-medium hover:underline"
                >
                  Manage
                </button>
              </div>
            </div>

            {/* Subscriptions */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#87929a]">
                  Subscriptions ({customerSubs.length || 1})
                </span>
                <button
                  onClick={() => setCurrentPage('subscriptions')}
                  className="text-xs text-[#38bdf8] font-medium hover:underline flex items-center gap-1"
                >
                  View All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {customerSubs.length > 0 ? (
                  customerSubs.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#090e19]/50 border border-[#94a3b8]/10 hover:border-[#38bdf8]/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">layers</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-[#dee2f2]">{sub.planName}</span>
                          <span className="text-[10px] text-[#87929a]">Renews {sub.renewalDate}</span>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#dee2f2]">
                        ${sub.mrr.toLocaleString()}/mo
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#090e19]/50 border border-[#94a3b8]/10">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">layers</span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#dee2f2]">{selectedCustomer.primaryPlan}</span>
                        <span className="text-[10px] text-[#87929a]">Annual Cycle</span>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-[#dee2f2]">
                      ${Math.round(selectedCustomer.currentArr / 12).toLocaleString()}/mo
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Account Settings & Tax Info */}
            <div className="p-3.5 rounded-xl bg-[#090e19]/50 border border-[#94a3b8]/10 flex flex-col gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#87929a]">Tax ID</span>
                <span className="font-mono text-[#dee2f2] font-medium">{selectedCustomer.taxId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#87929a]">Currency</span>
                <span className="font-mono text-[#dee2f2] font-medium">{selectedCustomer.currency}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#87929a]">Location</span>
                <span className="text-[#dee2f2] font-medium">{selectedCustomer.location}</span>
              </div>
            </div>

            {actionFeedback && (
              <div className="p-2.5 rounded-lg bg-[#4ee6aa]/15 border border-[#4ee6aa]/30 text-[#4ee6aa] text-xs font-medium flex items-center gap-2 animate-in fade-in">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* Action Footer */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  const nextStatus = selectedCustomer.status === 'active' ? 'paused' : 'active';
                  updateCustomer(selectedCustomer.id, { status: nextStatus });
                  setActionFeedback(`Account status switched to ${nextStatus.toUpperCase()}`);
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
              >
                <span className="material-symbols-outlined text-[16px]">toggle_on</span>
                <span>Toggle Status</span>
              </button>
              <button
                onClick={() => {
                  issueCreditNote(selectedCustomer.id, 500);
                  setActionFeedback(`Credit note of $500.00 applied to ${selectedCustomer.name}`);
                  setTimeout(() => setActionFeedback(null), 3000);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-xs font-semibold transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">note_add</span>
                <span>Credit Note ($500)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
