'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const PaymentsView: React.FC = () => {
  const {
    payments,
    recordPayment,
    invoices,
    exportDataToCsv
  } = useData();

  const [search, setSearch] = useState('');
  const [gatewayFilter, setGatewayFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state for Record Payment
  const [targetInvoice, setTargetInvoice] = useState(invoices[0]?.invoiceNumber || '');
  const [payAmount, setPayAmount] = useState(2500);
  const [payMethod, setPayMethod] = useState('ACH Direct Transfer');
  const [clientName, setClientName] = useState('Datadog Core Inc');

  const filteredPayments = payments.filter((pay) => {
    const q = search.toLowerCase();
    const matches =
      !search ||
      pay.reference.toLowerCase().includes(q) ||
      pay.invoiceNumber.toLowerCase().includes(q) ||
      pay.customerName.toLowerCase().includes(q);

    if (!matches) return false;
    if (gatewayFilter !== 'all' && !pay.gateway.toLowerCase().includes(gatewayFilter.toLowerCase())) return false;
    return true;
  });

  const totalCollected = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleExport = () => {
    exportDataToCsv(
      'payments_transactions_ledger',
      filteredPayments.map(p => ({
        Reference: p.reference,
        Invoice: p.invoiceNumber,
        Customer: p.customerName,
        Amount: p.amount,
        Method: p.method,
        Status: p.status,
        Date: p.date,
        Gateway: p.gateway
      }))
    );
  };

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordPayment({
      invoiceNumber: targetInvoice,
      amount: payAmount,
      method: payMethod,
      customerName: clientName
    });
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Payments & Gateway Settlements
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#4ee6aa] font-mono text-xs border border-[#4ee6aa]/20">
              {payments.length} Transactions
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Real-time clearinghouse reconciliation, automated ACH & SEPA sweeps, multi-currency settlement telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
          >
            <span className="material-symbols-outlined text-[16px] text-[#87929a]">download</span>
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-xs font-semibold transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">payments</span>
            <span>+ Record Payment</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm">
          <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
            Total Settled (30D)
          </span>
          <div className="text-2xl font-bold font-mono text-[#4ee6aa] mt-2">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#87929a] mt-1 block">ACH, BACS, SEPA & Cards</span>
        </div>

        <div className="p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm">
          <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
            Gateway Availability
          </span>
          <div className="text-2xl font-bold font-mono text-[#38bdf8] mt-2">
            99.998%
          </div>
          <span className="text-[11px] text-[#4ee6aa] mt-1 block">Stripe Connect & Adyen Nominal</span>
        </div>

        <div className="p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm">
          <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">
            Average Settlement Speed
          </span>
          <div className="text-2xl font-bold font-mono text-[#bdc2ff] mt-2">
            1.2 Days
          </div>
          <span className="text-[11px] text-[#87929a] mt-1 block">Instant ACH for Tier-1</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
        <div className="flex items-center flex-1 w-full sm:w-auto bg-[#090e19]/70 rounded-lg px-3 py-1.5 gap-2 border border-[#94a3b8]/10">
          <span className="material-symbols-outlined text-[#87929a] text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reference, invoice, or customer..."
            className="bg-transparent border-0 outline-none text-[#dee2f2] placeholder:text-[#87929a] text-xs w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#87929a] hover:text-[#dee2f2]">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="bg-[#252a36] text-[#dee2f2] text-xs rounded-lg px-3 py-1.5 outline-none border border-[#94a3b8]/15 cursor-pointer"
          >
            <option value="all">All Gateways</option>
            <option value="Stripe">Stripe Connect</option>
            <option value="Clearinghouse">Clearinghouse Direct</option>
            <option value="Manual">Manual Settlement</option>
          </select>
        </div>
      </div>

      {/* Payment Transactions Table */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090e19]/90 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
                <th className="py-4 px-6">Payment Ref</th>
                <th className="py-4 px-6">Customer & Account</th>
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Method</th>
                <th className="py-4 px-6">Date (UTC)</th>
                <th className="py-4 px-6">Gateway</th>
                <th className="py-4 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94a3b8]/10 text-xs font-mono">
              {filteredPayments.map((pay) => (
                <tr key={pay.id} className="hover:bg-[#1b1f2b]/60 transition-colors">
                  <td className="py-4 px-6 text-[#38bdf8] font-semibold">{pay.reference}</td>

                  <td className="py-4 px-6 font-sans">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-[#252a36] text-[#38bdf8] flex items-center justify-center font-bold text-xs font-mono">
                        {pay.customerInitials}
                      </div>
                      <span className="font-semibold text-[#dee2f2]">{pay.customerName}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-[#bdc8d1]">{pay.invoiceNumber}</td>

                  <td className="py-4 px-6 text-right font-bold text-[#dee2f2]">
                    ${pay.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-6 font-sans text-[#dee2f2]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#87929a]">
                        account_balance
                      </span>
                      <span>{pay.method}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-[#87929a]">{pay.date}</td>

                  <td className="py-4 px-6 font-sans text-[#bdc8d1]">{pay.gateway}</td>

                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                        pay.status === 'paid'
                          ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                          : pay.status === 'processing'
                          ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                          : 'bg-[#93000a]/20 text-[#ffb4ab]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          pay.status === 'paid' ? 'bg-[#4ee6aa]' : 'bg-[#ffb4ab]'
                        }`}
                      />
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleRecordSubmit}
            className="w-full max-w-md rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
              <h3 className="text-base font-semibold text-[#dee2f2]">Record Manual / External Payment</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Customer / Organization
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Target Invoice Number
                </label>
                <select
                  value={targetInvoice}
                  onChange={(e) => setTargetInvoice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                >
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.invoiceNumber}>
                      {inv.invoiceNumber} - ${inv.amount.toLocaleString()} ({inv.customerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Amount Received ($)
                </label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Payment Vector
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                >
                  <option value="ACH Direct Transfer">ACH Direct Transfer</option>
                  <option value="Wire Transfer Direct">Wire Transfer Direct</option>
                  <option value="Corporate Credit Card">Corporate Credit Card</option>
                  <option value="SEPA Bacs Sweep">SEPA / BACS Direct Sweep</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-semibold text-xs hover:bg-[#8ed5ff]"
              >
                Post Payment to Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
