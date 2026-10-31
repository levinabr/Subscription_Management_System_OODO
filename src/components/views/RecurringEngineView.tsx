'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const RecurringEngineView: React.FC = () => {
  const {
    stagedBilling,
    excludeStagedItem,
    recalculateProration,
    executeBatchBillingRun,
    billingLogs,
    exportDataToCsv,
    setCurrentPage
  } = useData();

  const [ledgerSynced, setLedgerSynced] = useState(false);

  const [isDryRun, setIsDryRun] = useState(true);
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [filterQuery, setFilterQuery] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);

  const filteredQueue = stagedBilling.filter((item) => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      item.customerName.toLowerCase().includes(q) ||
      item.subId.toLowerCase().includes(q) ||
      item.customerLocation.toLowerCase().includes(q) ||
      item.state.toLowerCase().includes(q)
    );
  });

  const dueCount = 384;
  const readyCount = stagedBilling.filter(i => i.state !== 'Excluded').length + 357;
  const readyTotal = stagedBilling
    .filter(i => i.state !== 'Excluded')
    .reduce((sum, i) => sum + i.netCharge, 0) + 207490.5;

  const handleExecute = async () => {
    setIsExecuting(true);
    setExecutionResult(null);
    try {
      const res = await executeBatchBillingRun(isDryRun);
      setExecutionResult(res.message);
    } catch {
      setExecutionResult('Batch execution failed. Please verify clearinghouse status.');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportStaged = () => {
    exportDataToCsv(
      'staged_billing_queue',
      filteredQueue.map(i => ({
        SubID: i.subId,
        Customer: i.customerName,
        Location: i.customerLocation,
        BaseAmount: i.baseAmount,
        CreditsProrations: i.creditsProrations,
        NexusTax: i.nexusTax,
        NetCharge: i.netCharge,
        PaymentVector: i.paymentMethod.label,
        State: i.state
      }))
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Top Control Ribbon & Page Metadata */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 max-w-3xl">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#38bdf8]/15 text-[#38bdf8] font-mono text-[11px] uppercase tracking-wider border border-[#38bdf8]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
              Autonomous Ledger V4.2
            </span>
            <span className="text-[#87929a] font-mono text-xs">CYCLE #2024-10B</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
            Recurring Billing Engine & Auto-Invoice Execution
          </h1>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Automated billing cycle scheduler, dynamic mid-cycle proration, real-time tax nexus verification, and batch invoice reconciliation.
          </p>
        </div>

        {/* Filter & Operational Parameters Controls */}
        <div className="flex flex-wrap items-center gap-2 bg-[#161b27]/80 backdrop-blur-xl p-1.5 rounded-xl border border-[#94a3b8]/15 shadow-md">
          {/* Date Trigger */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252a36] text-[#dee2f2] text-xs font-mono">
            <span className="material-symbols-outlined text-[16px] text-[#38bdf8]">calendar_today</span>
            <span>Oct 24, 2024</span>
            <span className="text-[10px] px-1 py-0.5 rounded bg-[#303541] text-[#87929a] uppercase">UTC 00:00</span>
          </div>

          {/* Frequency Intervals */}
          <div className="flex items-center bg-[#090e19] p-0.5 rounded-lg border border-[#94a3b8]/10 text-xs">
            {(['monthly', 'quarterly', 'annual'] as const).map((freq) => (
              <button
                key={freq}
                onClick={() => setFrequency(freq)}
                className={`px-3 py-1 rounded capitalize font-medium transition-colors ${
                  frequency === freq
                    ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                    : 'text-[#bdc8d1] hover:text-[#dee2f2]'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>

          {/* Dry Run Toggle */}
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#252a36]/60 hover:bg-[#252a36] cursor-pointer transition-colors text-xs border border-[#94a3b8]/10">
            <input
              type="checkbox"
              checked={isDryRun}
              onChange={(e) => setIsDryRun(e.target.checked)}
              className="w-4 h-4 rounded bg-[#303541] text-[#38bdf8] focus:ring-0 cursor-pointer"
            />
            <span className="font-medium text-[#4ee6aa] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ee6aa]" />
              Dry Run Simulation
            </span>
          </label>
        </div>
      </div>

      {/* Hero Glass Container: Execution Command Center & Telemetry Pipeline */}
      <div className="relative overflow-hidden rounded-xl bg-[#161b27]/80 backdrop-blur-2xl border border-[#94a3b8]/15 shadow-xl p-6 sm:p-8 flex flex-col xl:flex-row gap-6 items-stretch">
        {/* Ambient directional glows */}
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#4ee6aa]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Pipeline Metric Telemetry Bento Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 z-10">
          {/* Metric 1 */}
          <div className="p-5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 hover:border-[#38bdf8]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#87929a] uppercase tracking-wider">
                  Due Subscriptions
                </span>
                <span className="p-1.5 rounded-md bg-[#252a36] text-[#38bdf8]">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-[#dee2f2]">{dueCount}</div>
                <div className="text-xs font-mono text-[#38bdf8] mt-1">$286,450.00 pipeline</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#94a3b8]/10 text-xs">
              <span className="text-[#87929a]">Scheduled auto-run</span>
              <span className="text-[#dee2f2] font-mono">100% load</span>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="p-5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 hover:border-[#4ee6aa]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#87929a] uppercase tracking-wider">
                  Ready to Invoice
                </span>
                <span className="p-1.5 rounded-md bg-[#252a36] text-[#4ee6aa]">
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-[#4ee6aa]">{readyCount}</div>
                <div className="text-xs font-mono text-[#4ee6aa] mt-1">${readyTotal.toLocaleString()} ready</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#94a3b8]/10 text-xs">
              <span className="text-[#87929a]">Pre-flight checks passed</span>
              <span className="text-[#4ee6aa] font-mono font-semibold">94.3%</span>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="p-5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 hover:border-[#bdc2ff]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#87929a] uppercase tracking-wider">
                  Already Invoiced
                </span>
                <span className="p-1.5 rounded-md bg-[#252a36] text-[#bdc2ff]">
                  <span className="material-symbols-outlined text-[16px]">done_all</span>
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-[#dee2f2]">18</div>
                <div className="text-xs font-mono text-[#bdc2ff] mt-1">$12,400.00 processed</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#94a3b8]/10 text-xs">
              <span className="text-[#87929a]">Cycle advance prep</span>
              <span className="text-[#bdc2ff] font-mono">4.7%</span>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="p-5 rounded-xl bg-[#090e19]/60 border border-[#94a3b8]/10 hover:border-[#ffb4ab]/30 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-semibold text-[#87929a] uppercase tracking-wider">
                  Excluded / On Hold
                </span>
                <span className="p-1.5 rounded-md bg-[#93000a]/20 text-[#ffb4ab]">
                  <span className="material-symbols-outlined text-[16px]">error_outline</span>
                </span>
              </div>
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-[#ffb4ab]">4</div>
                <div className="text-xs font-mono text-[#ffb4ab] mt-1">$2,250.00 pending tax</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-[#94a3b8]/10 text-xs">
              <span className="text-[#87929a]">Action required</span>
              <span className="text-[#ffb4ab] font-mono font-semibold">Tax Nexus</span>
            </div>
          </div>
        </div>

        {/* Prominent Obsidian Glass CTA Panel */}
        <div className="xl:w-[380px] p-6 rounded-xl bg-[#252a36]/60 backdrop-blur-xl border border-[#94a3b8]/20 shadow-lg flex flex-col justify-between z-10 gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#38bdf8]">
                BATCH EXECUTION PIPELINE
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#4ee6aa]/15 text-[#4ee6aa] font-mono text-xs font-medium flex items-center gap-1.5 border border-[#4ee6aa]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ee6aa]" />
                3/3 PASS
              </span>
            </div>

            <div>
              <div className="text-base font-semibold text-[#dee2f2] tracking-tight">
                Execute Batch Billing Run #2024-10B
              </div>
              <p className="text-xs text-[#bdc8d1] mt-1 leading-relaxed font-normal">
                Queued payload ready for asynchronous debit dispatch across primary settlement clearinghouses.
              </p>
            </div>

            {/* Pre-flight checklist */}
            <div className="flex flex-col gap-2 py-2 border-y border-[#94a3b8]/15 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#bdc8d1]">
                  <span className="material-symbols-outlined text-[#4ee6aa] text-[16px]">verified</span>
                  Stripe & Adyen Gateways
                </span>
                <span className="font-mono text-[#4ee6aa] text-[11px] font-medium">Connected</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#bdc8d1]">
                  <span className="material-symbols-outlined text-[#4ee6aa] text-[16px]">verified</span>
                  TaxJar Nexus Tables
                </span>
                <span className="font-mono text-[#4ee6aa] text-[11px] font-medium">Synchronized</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-[#bdc8d1]">
                  <span className="material-symbols-outlined text-[#4ee6aa] text-[16px]">verified</span>
                  ECB Spot FX Exchange Rates
                </span>
                <span className="font-mono text-[#4ee6aa] text-[11px] font-medium">Locked 1.082</span>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-xs transition-all shadow-[0_0_20px_rgba(56,189,248,0.35)] active:scale-[0.99] ${
                isDryRun
                  ? 'bg-[#38bdf8] text-[#00354a] hover:bg-[#8ed5ff]'
                  : 'bg-[#ffb4ab] text-[#690005] hover:bg-[#ffdad6]'
              } ${isExecuting ? 'opacity-70 cursor-wait' : ''}`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isExecuting ? 'sync' : isDryRun ? 'lock_open' : 'bolt'}
              </span>
              <span>
                {isExecuting
                  ? 'Dispatching Engine Subroutines...'
                  : isDryRun
                  ? `Execute Automated Billing (${readyCount} Subscriptions)`
                  : `CONFIRM LIVE DEBIT RUN (${readyCount} Subscriptions)`}
              </span>
            </button>
            <span className="text-center font-mono text-[10px] text-[#87929a]">
              Authorizing officer: Elena Vance (VP Financial Ops)
            </span>
          </div>

          {executionResult && (
            <div className="p-3 rounded-lg bg-[#090e19] border border-[#38bdf8]/30 text-xs text-[#38bdf8]">
              {executionResult}
            </div>
          )}
        </div>
      </div>

      {/* Interactive Data Engine Viewport: Table Filters & Live Ledger Queue */}
      <div className="flex flex-col bg-[#161b27]/80 backdrop-blur-xl border border-[#94a3b8]/15 rounded-xl shadow-lg overflow-hidden">
        {/* Subheader toolbar */}
        <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#090e19]/60 border-b border-[#94a3b8]/15">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#dee2f2]">Staged Subscription Queue</span>
            <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#252a36] text-[#bdc8d1]">
              Showing {filteredQueue.length} of {readyCount} Subscriptions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px]">
              <span className="material-symbols-outlined text-[16px] text-[#87929a] absolute left-2.5 top-2.5">
                filter_list
              </span>
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter subscriptions, IDs, tax status..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#161b27] border border-[#94a3b8]/15 text-[#dee2f2] text-xs placeholder:text-[#87929a] focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            <button
              onClick={() => setFilterQuery('')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#bdc8d1] hover:text-[#dee2f2] text-xs transition-colors border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filter Status</span>
            </button>

            <button
              onClick={handleExportStaged}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#bdc8d1] hover:text-[#dee2f2] text-xs transition-colors border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              <span>Export Staged Payload</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left font-mono text-xs text-[#dee2f2]">
            <thead className="bg-[#090e19]/80 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
              <tr>
                <th className="py-4 px-6 font-sans">Customer / Organization</th>
                <th className="py-4 px-4 font-sans">Sub ID & Plan</th>
                <th className="py-4 px-4 text-right font-sans">Base Amount</th>
                <th className="py-4 px-4 text-right font-sans">Credits & Prorations</th>
                <th className="py-4 px-4 text-right font-sans">Nexus Tax</th>
                <th className="py-4 px-4 text-right font-sans">Net Charge</th>
                <th className="py-4 px-4 font-sans">Settlement Vector</th>
                <th className="py-4 px-4 font-sans">Queue State</th>
                <th className="py-4 px-6 text-right font-sans">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94a3b8]/10 text-xs">
              {filteredQueue.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-[#1b1f2b]/50 transition-colors ${
                    item.state === 'Needs Review' ? 'bg-[#93000a]/5' : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#252a36] text-[#38bdf8] flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {item.customerInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[#dee2f2] font-sans truncate">
                          {item.customerName}
                        </span>
                        <span className="text-[11px] text-[#87929a] mt-0.5">
                          {item.customerOrgUrl} • {item.customerLocation}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#38bdf8] font-medium">{item.subId}</span>
                      <span className="text-[#bdc8d1] font-sans text-[11px]">{item.planDescription}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 text-right text-[#dee2f2]">
                    ${item.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-4 text-right text-[#4ee6aa]">
                    {item.creditsProrations < 0
                      ? `-$${Math.abs(item.creditsProrations).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : '$0.00'}
                  </td>

                  <td className="py-4 px-4 text-right text-[#bdc8d1]">
                    {item.nexusTax > 0
                      ? `$${item.nexusTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : '--'}
                  </td>

                  <td className="py-4 px-4 text-right font-semibold text-[#38bdf8]">
                    ${item.netCharge.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-[#bdc8d1]">
                      <span className="material-symbols-outlined text-[16px] text-[#87929a]">
                        {item.paymentMethod.type === 'bacs' || item.paymentMethod.type === 'sepa'
                          ? 'account_balance'
                          : 'credit_card'}
                      </span>
                      <span>{item.paymentMethod.label}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold uppercase ${
                        item.state === 'Ready'
                          ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                          : item.state === 'Prorated'
                          ? 'bg-[#2f3aa3]/30 text-[#bdc2ff]'
                          : item.state === 'Needs Review'
                          ? 'bg-[#93000a]/30 text-[#ffb4ab]'
                          : 'bg-[#252a36] text-[#87929a]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.state === 'Ready'
                            ? 'bg-[#4ee6aa]'
                            : item.state === 'Prorated'
                            ? 'bg-[#bdc2ff]'
                            : item.state === 'Needs Review'
                            ? 'bg-[#ffb4ab]'
                            : 'bg-[#87929a]'
                        }`}
                      />
                      {item.state}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => recalculateProration(item.id)}
                        className="p-1.5 rounded hover:bg-[#252a36] text-[#87929a] hover:text-[#38bdf8] transition-colors"
                        title="Recalculate Proration"
                      >
                        <span className="material-symbols-outlined text-[18px]">calculate</span>
                      </button>
                      <button
                        onClick={() => excludeStagedItem(item.id)}
                        className="p-1.5 rounded hover:bg-[#252a36] text-[#87929a] hover:text-[#ffb4ab] transition-colors"
                        title="Exclude from Run"
                      >
                        <span className="material-symbols-outlined text-[18px]">block</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 bg-[#090e19]/80 border-t border-[#94a3b8]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#bdc8d1]">
          <div className="flex items-center gap-3">
            <span>Rows per page: <strong>25</strong></span>
            <span className="text-[#87929a]">•</span>
            <span>
              Sum of Selected Net Total:{' '}
              <strong className="text-[#38bdf8] font-mono">${readyTotal.toLocaleString()}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <button className="px-3 py-1 rounded bg-[#252a36] text-[#87929a] opacity-50 cursor-not-allowed">
              Previous
            </button>
            <span className="px-2 text-[#dee2f2]">1 / 15</span>
            <button className="px-3 py-1 rounded bg-[#252a36] text-[#dee2f2] hover:bg-[#303541]">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Split Grid: Historic Execution Log + Engine Execution Parameters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Historic Execution Log & Reconciled Runs (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-7 rounded-xl bg-[#161b27]/80 backdrop-blur-xl border border-[#94a3b8]/15 shadow-lg flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#38bdf8]">history</span>
                <span className="text-base font-semibold text-[#dee2f2]">
                  Historic Execution Log & Reconciled Runs
                </span>
              </div>
              <button
                onClick={() => {
                  setLedgerSynced(true);
                  setTimeout(() => setLedgerSynced(false), 2500);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  ledgerSynced
                    ? 'bg-[#4ee6aa]/15 text-[#4ee6aa] border-[#4ee6aa]/30'
                    : 'bg-[#252a36] hover:bg-[#303541] text-[#38bdf8] border-[#94a3b8]/15'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {ledgerSynced ? 'check_circle' : 'sync'}
                </span>
                <span>{ledgerSynced ? 'SHA-256 Hashes Verified' : 'Trigger Ledger Sync'}</span>
              </button>
            </div>
            <p className="text-xs text-[#bdc8d1] mb-5 leading-relaxed">
              Immutable audit trails verifying post-run settlements, webhook triggers to Stripe Sigma, and downstream ERP postings.
            </p>

            {/* Run Items List */}
            <div className="flex flex-col gap-3">
              {billingLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-lg bg-[#090e19]/60 border border-[#94a3b8]/10 hover:border-[#38bdf8]/30 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="p-2.5 rounded-lg bg-[#4ee6aa]/15 text-[#4ee6aa]">
                      <span className="material-symbols-outlined text-[18px]">verified</span>
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#dee2f2]">{log.runCode}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4ee6aa]/15 text-[#4ee6aa]">
                          {log.status}
                        </span>
                      </div>
                      <span className="text-xs text-[#87929a]">{log.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right">
                      <span className="font-mono text-sm font-semibold text-[#dee2f2]">
                        ${log.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="font-mono text-xs text-[#4ee6aa]">{log.collectionRate}</span>
                    </div>
                    <button
                      onClick={() => {
                        exportDataToCsv(`reconciliation_${log.runCode}`, [{
                          RunCode: log.runCode,
                          Date: log.date,
                          TotalBilled: log.totalBilledCount,
                          Failed: log.failedCount,
                          Amount: log.totalAmount,
                          Status: log.status,
                          CollectionRate: log.collectionRate
                        }]);
                      }}
                      className="p-2 rounded hover:bg-[#252a36] text-[#87929a] hover:text-[#dee2f2]"
                      title="Download Reconciliation CSV"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-[#87929a]">
            <span className="font-mono">Last reconciled ledger audit: 12 minutes ago</span>
            <button
              onClick={() => setCurrentPage('audit-log')}
              className="text-[#38bdf8] hover:underline font-medium flex items-center gap-1"
            >
              <span>View All Historic Runs in Audit Log</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* Engine Settings & Auto-Dunning Rules Card (5 cols) */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-xl bg-[#161b27]/80 backdrop-blur-xl border border-[#94a3b8]/15 shadow-lg flex flex-col justify-between gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#4ee6aa]">tune</span>
                <span className="text-base font-semibold text-[#dee2f2]">Active Run Parameters</span>
              </div>
              <span className="font-mono text-[10px] px-2.5 py-0.5 rounded bg-[#252a36] text-[#87929a]">
                SYS CONFIG
              </span>
            </div>
            <p className="text-xs text-[#bdc8d1] mb-5 leading-relaxed">
              Autonomous safety limits and smart retry sequencing applied to all invoice triggers in this window.
            </p>

            <div className="flex flex-col gap-3">
              <div className="p-3.5 rounded-lg bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#dee2f2]">Proration Engine</span>
                  <span className="text-[11px] text-[#87929a]">Second-precision calendar time slice</span>
                </div>
                <span className="font-mono text-xs text-[#4ee6aa] font-semibold">ACTIVE</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#dee2f2]">Smart Dunning Schedule</span>
                  <span className="text-[11px] text-[#87929a]">Retry at T+24h, T+72h, T+120h</span>
                </div>
                <span className="font-mono text-xs text-[#38bdf8] font-semibold">3 ATTEMPTS</span>
              </div>

              <div className="p-3.5 rounded-lg bg-[#090e19]/60 border border-[#94a3b8]/10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[#dee2f2]">Discrepancy Threshold Guard</span>
                  <span className="text-[11px] text-[#87929a]">Halt batch if variance &gt; 5.0%</span>
                </div>
                <span className="font-mono text-xs text-[#bdc2ff] font-semibold">ENABLED (5%)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setCurrentPage('settings')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15 w-full"
          >
            <span className="material-symbols-outlined text-[16px]">settings_input_component</span>
            <span>Configure Engine Architecture</span>
          </button>
        </div>
      </div>
    </div>
  );
};
