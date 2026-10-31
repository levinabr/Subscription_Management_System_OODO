'use client';
import React, { useState, useEffect } from 'react';
import { useData, NavigationPage } from '../../context/DataContext';

export const CommandPalette: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    setCurrentPage,
    customers,
    subscriptions,
    invoices,
    setSelectedCustomerId,
    setSelectedSubId,
    setSelectedInvoice
  } = useData();

  const [query, setQuery] = useState('');

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const q = query.toLowerCase();

  const pages: { id: NavigationPage; label: string; icon: string; category: string }[] = [
    { id: 'overview', label: 'Executive Financial Overview', icon: 'dashboard', category: 'Navigation' },
    { id: 'customers', label: 'Customer Accounts & Health', icon: 'group', category: 'Navigation' },
    { id: 'subscriptions', label: 'Subscription Lifecycle Management', icon: 'autorenew', category: 'Navigation' },
    { id: 'recurring-engine', label: 'Recurring Engine & Batch Execution', icon: 'sync_alt', category: 'Navigation' },
    { id: 'invoices', label: 'Invoices & Receivables Ledger', icon: 'receipt_long', category: 'Navigation' },
    { id: 'payments', label: 'Payment Gateway Settlements', icon: 'payments', category: 'Navigation' },
    { id: 'products-and-plans', label: 'Products & Pricing Plans', icon: 'inventory_2', category: 'Navigation' },
    { id: 'quotations', label: 'Quotations & Commercial Proposals', icon: 'request_quote', category: 'Navigation' },
    { id: 'reports-and-analytics', label: 'Financial Reports & Analytics', icon: 'insights', category: 'Navigation' },
    { id: 'audit-log', label: 'Immutable Audit Log & Event Stream', icon: 'verified_user', category: 'Navigation' },
    { id: 'settings', label: 'System Configuration & Tax Nexus', icon: 'settings', category: 'Navigation' },
    { id: 'help-and-documentation', label: 'Architecture & Developer Guide', icon: 'menu_book', category: 'Navigation' },
  ];

  const matchedPages = pages.filter(p => !q || p.label.toLowerCase().includes(q));

  const matchedCustomers = customers.filter(
    c => !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  );

  const matchedSubs = subscriptions.filter(
    s => !q || s.id.toLowerCase().includes(q) || s.customerName.toLowerCase().includes(q) || s.planName.toLowerCase().includes(q)
  );

  const matchedInvoices = invoices.filter(
    i => !q || i.invoiceNumber.toLowerCase().includes(q) || i.customerName.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-md p-4 pt-20">
      <div className="w-full max-w-2xl rounded-2xl bg-[#0e131e] border border-[#94a3b8]/25 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#94a3b8]/15 flex items-center gap-3 bg-[#161b27]/80">
          <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">search</span>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, page name, customer, invoice or subscription ID..."
            className="w-full bg-transparent border-0 outline-none text-[#dee2f2] placeholder:text-[#87929a] text-sm font-sans"
          />
          <kbd className="px-2 py-0.5 rounded bg-[#252a36] text-[10px] font-mono text-[#87929a]">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-4 text-xs">
          {/* Navigation Pages */}
          {matchedPages.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#87929a]">
                Navigation Pages
              </span>
              {matchedPages.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setCurrentPage(p.id);
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-[#1b1f2b] transition-colors text-[#dee2f2]"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#38bdf8]">{p.icon}</span>
                  <span className="font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Customers */}
          {matchedCustomers.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#87929a]">
                Customers
              </span>
              {matchedCustomers.slice(0, 4).map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setSelectedCustomerId(c.id);
                    setCurrentPage('customers');
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1b1f2b] transition-colors text-[#dee2f2]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded bg-[#252a36] text-[#38bdf8] font-mono text-[10px] font-bold flex items-center justify-center">
                      {c.avatarInitials}
                    </span>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-[11px] text-[#87929a] font-mono">{c.email}</span>
                  </div>
                  <span className="text-[11px] font-mono text-[#4ee6aa]">ARR: ${c.currentArr.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Subscriptions */}
          {matchedSubs.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#87929a]">
                Subscriptions
              </span>
              {matchedSubs.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSubId(s.id);
                    setCurrentPage('subscriptions');
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1b1f2b] transition-colors text-[#dee2f2]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#38bdf8] font-semibold">{s.id}</span>
                    <span className="text-[#87929a]">•</span>
                    <span>{s.customerName}</span>
                    <span className="text-[#87929a]">({s.planName})</span>
                  </div>
                  <span className="font-mono text-xs text-[#dee2f2]">${s.mrr}/mo</span>
                </button>
              ))}
            </div>
          )}

          {/* Matched Invoices */}
          {matchedInvoices.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[#87929a]">
                Invoices
              </span>
              {matchedInvoices.slice(0, 3).map((inv) => (
                <button
                  key={inv.id}
                  onClick={() => {
                    setSelectedInvoice(inv);
                    setIsSearchModalOpen(false);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-[#1b1f2b] transition-colors text-[#dee2f2]"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#38bdf8]">{inv.invoiceNumber}</span>
                    <span className="text-[#87929a]">•</span>
                    <span>{inv.customerName}</span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#dee2f2]">${inv.amount.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
