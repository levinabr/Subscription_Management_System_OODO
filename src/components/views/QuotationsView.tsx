'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const QuotationsView: React.FC = () => {
  const {
    quotations,
    addQuotation,
    convertQuotationToSubscription,
    customers,
    plans,
    setCurrentPage,
    exportDataToCsv
  } = useData();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [selectedPlanCode, setSelectedPlanCode] = useState(plans[0]?.code || '');
  const [quoteSeats, setQuoteSeats] = useState(25);
  const [quoteAnnualVal, setQuoteAnnualVal] = useState(18500);
  const [discountPct, setDiscountPct] = useState(10);

  const filteredQuotes = quotations.filter((q) => {
    const s = search.toLowerCase();
    return (
      !search ||
      q.quoteNumber.toLowerCase().includes(s) ||
      q.customerName.toLowerCase().includes(s) ||
      q.planName.toLowerCase().includes(s)
    );
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustId) || customers[0];
    const plan = plans.find(p => p.code === selectedPlanCode) || plans[0];

    const discounted = quoteAnnualVal * (1 - discountPct / 100);
    const tax = discounted * 0.085;
    const total = discounted + tax;

    addQuotation({
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      planName: `${plan.name} (${quoteSeats} Seats)`,
      seats: quoteSeats,
      annualValue: quoteAnnualVal,
      discountPercent: discountPct,
      taxPercent: 8.5,
      totalAmount: Math.round(total),
      status: 'pending_approval',
      validUntil: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      lineItems: [
        {
          description: `${plan.name} Annual Contract Base`,
          quantity: 1,
          unitPrice: quoteAnnualVal,
          amount: quoteAnnualVal
        }
      ]
    });

    setIsModalOpen(false);
  };

  const handleExport = () => {
    exportDataToCsv(
      'quotations_proposals',
      filteredQuotes.map(q => ({
        QuoteNumber: q.quoteNumber,
        Customer: q.customerName,
        Plan: q.planName,
        AnnualValue: q.annualValue,
        Discount: `${q.discountPercent}%`,
        TotalAmount: q.totalAmount,
        Status: q.status,
        ValidUntil: q.validUntil
      }))
    );
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Quotations & Commercial Proposals
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
              {quotations.length} Active Quotes
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Generate customized commercial proposals, volume discounts, proration terms, and convert approved quotes to active subscriptions.
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
            <span className="material-symbols-outlined text-[16px]">post_add</span>
            <span>+ Build Quotation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-xl bg-[#161b27]/80 border border-[#94a3b8]/15">
        <div className="flex items-center flex-1 w-full bg-[#090e19]/70 rounded-lg px-3 py-1.5 gap-2 border border-[#94a3b8]/10">
          <span className="material-symbols-outlined text-[#87929a] text-[18px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quotations by number, customer or plan..."
            className="bg-transparent border-0 outline-none text-[#dee2f2] placeholder:text-[#87929a] text-xs w-full"
          />
        </div>
      </div>

      {/* Quotations Table */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090e19]/90 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
                <th className="py-4 px-6">Quote #</th>
                <th className="py-4 px-6">Customer Organization</th>
                <th className="py-4 px-6">Proposed Plan & Seats</th>
                <th className="py-4 px-6 text-right">Annual Value</th>
                <th className="py-4 px-6 text-right">Discount</th>
                <th className="py-4 px-6 text-right">Net Contract</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94a3b8]/10 text-xs">
              {filteredQuotes.map((q) => (
                <tr key={q.id} className="hover:bg-[#1b1f2b]/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-medium text-[#38bdf8]">{q.quoteNumber}</td>
                  <td className="py-4 px-6 font-semibold text-[#dee2f2]">{q.customerName}</td>
                  <td className="py-4 px-6 text-[#bdc8d1]">{q.planName}</td>
                  <td className="py-4 px-6 text-right font-mono text-[#dee2f2]">
                    ${q.annualValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-[#4ee6aa]">
                    {q.discountPercent}%
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-bold text-[#38bdf8]">
                    ${q.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-semibold font-mono ${
                        q.status === 'accepted'
                          ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                          : q.status === 'sent'
                          ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                          : 'bg-[#252a36] text-[#bdc2ff]'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {q.status !== 'accepted' ? (
                        <button
                          onClick={() => {
                            convertQuotationToSubscription(q.id);
                            setCurrentPage('subscriptions');
                          }}
                          className="px-2.5 py-1 rounded bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] font-semibold text-xs transition-all shadow-sm"
                        >
                          Convert to Subscription
                        </button>
                      ) : (
                        <span className="text-xs font-mono text-[#4ee6aa]">Active in Ledger</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Build Quote Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
              <h3 className="text-base font-semibold text-[#dee2f2]">Build Commercial Quotation</h3>
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
                  Customer Organization
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Base Plan Tier
                </label>
                <select
                  value={selectedPlanCode}
                  onChange={(e) => setSelectedPlanCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.code}>
                      {p.name} - ${p.priceAnnual}/yr
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                    Seats Allocation
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteSeats}
                    onChange={(e) => setQuoteSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                    Annual Value ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteAnnualVal}
                    onChange={(e) => setQuoteAnnualVal(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Volume Discount (%)
                </label>
                <input
                  type="number"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
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
                Generate Proposal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
