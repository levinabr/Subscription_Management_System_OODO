'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { Invoice } from '../../types';

export const InvoicesView: React.FC = () => {
  const {
    invoices,
    setSelectedInvoice,
    payInvoice,
    addInvoice,
    customers,
    exportDataToCsv
  } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New manual invoice form state
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [invItemDesc, setInvItemDesc] = useState('Enterprise Consulting & Custom Integration');
  const [invItemAmount, setInvItemAmount] = useState(5000);

  const filteredInvoices = invoices.filter((inv) => {
    const q = search.toLowerCase();
    const matches =
      !search ||
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.customerName.toLowerCase().includes(q) ||
      inv.customerEmail.toLowerCase().includes(q);

    if (!matches) return false;
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  const totalCollected = invoices
    .filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalPending = invoices
    .filter(i => i.status === 'processing' || i.status === 'retrying')
    .reduce((sum, i) => sum + i.amount, 0);

  const handleExport = () => {
    exportDataToCsv(
      'invoices_ledger',
      filteredInvoices.map(i => ({
        InvoiceNumber: i.invoiceNumber,
        Customer: i.customerName,
        Email: i.customerEmail,
        IssueDate: i.issueDate,
        DueDate: i.dueDate,
        Subtotal: i.subtotal,
        Tax: i.taxAmount,
        TotalAmount: i.amount,
        Status: i.status,
        PaymentMethod: i.paymentMethod || 'N/A'
      }))
    );
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === selectedCustId) || customers[0];
    const tax = Math.round(invItemAmount * 0.085);
    const total = invItemAmount + tax;

    addInvoice({
      customerId: cust.id,
      customerName: cust.name,
      customerInitials: cust.avatarInitials,
      customerEmail: cust.email,
      customerTaxId: cust.taxId,
      customerAddress: cust.location,
      subId: '#SUB-MANUAL',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      amount: total,
      subtotal: invItemAmount,
      taxAmount: tax,
      discountAmount: 0,
      status: 'processing',
      paymentMethod: cust.paymentMethod.name,
      lineItems: [
        {
          description: invItemDesc,
          quantity: 1,
          unitPrice: invItemAmount,
          total: invItemAmount
        }
      ]
    });

    setIsCreateModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Invoices & Accounts Receivable
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
              {invoices.length} Invoices
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Tax-compliant invoices, automated tax calculations, payment status receipts, and printable ledger documents.
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
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-xs font-semibold transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm">
          <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">Total Invoiced</span>
          <div className="text-2xl font-bold font-mono text-[#dee2f2] mt-2">
            ${(totalCollected + totalPending).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#bdc8d1] mt-1 block">Across all historical & active cycles</span>
        </div>

        <div className="p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm">
          <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">Settled & Collected</span>
          <div className="text-2xl font-bold font-mono text-[#4ee6aa] mt-2">
            ${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#4ee6aa] mt-1 block">98.2% on-time settlement</span>
        </div>

        <div className="p-5 rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 shadow-sm">
          <span className="text-xs font-semibold text-[#87929a] uppercase tracking-wider">Pending / Retrying</span>
          <div className="text-2xl font-bold font-mono text-[#ffb4ab] mt-2">
            ${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#ffb4ab] mt-1 block">Smart dunning active</span>
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
            placeholder="Search invoice number, client name, or email..."
            className="bg-transparent border-0 outline-none text-[#dee2f2] placeholder:text-[#87929a] text-xs w-full"
          />
          {search && (
            <button onClick={() => setSearch('')} className="text-[#87929a] hover:text-[#dee2f2]">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#252a36] text-[#dee2f2] text-xs rounded-lg px-3 py-1.5 outline-none border border-[#94a3b8]/15 cursor-pointer"
          >
            <option value="all">Status: All</option>
            <option value="paid">Status: Paid</option>
            <option value="processing">Status: Processing</option>
            <option value="retrying">Status: Retrying</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#090e19]/90 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
                <th className="py-4 px-6">Invoice #</th>
                <th className="py-4 px-6">Customer Account</th>
                <th className="py-4 px-6">Issue / Due Date</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6">Payment Vector</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#94a3b8]/10 text-xs">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#1b1f2b]/60 transition-colors">
                  <td className="py-4 px-6 font-mono font-medium text-[#38bdf8]">
                    {inv.invoiceNumber}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#252a36] text-[#38bdf8] flex items-center justify-center font-bold text-xs">
                        {inv.customerInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-[#dee2f2] truncate">{inv.customerName}</span>
                        <span className="text-[11px] text-[#87929a] truncate font-mono">{inv.customerEmail}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[#dee2f2] font-mono">{inv.issueDate}</span>
                      <span className="text-[10px] text-[#87929a] font-mono">Due: {inv.dueDate}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6 text-right font-mono font-bold text-[#dee2f2] text-sm">
                    ${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-6 text-[#bdc8d1]">
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#87929a]">payment</span>
                      <span>{inv.paymentMethod || 'Card on file'}</span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium ${
                        inv.status === 'paid'
                          ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                          : inv.status === 'processing'
                          ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                          : 'bg-[#93000a]/20 text-[#ffb4ab]'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          inv.status === 'paid'
                            ? 'bg-[#4ee6aa]'
                            : inv.status === 'processing'
                            ? 'bg-[#38bdf8]'
                            : 'bg-[#ffb4ab]'
                        }`}
                      />
                      {inv.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-2.5 py-1 rounded bg-[#252a36] hover:bg-[#38bdf8] hover:text-[#00354a] text-[#dee2f2] text-xs transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">visibility</span>
                        <span>View / Print</span>
                      </button>

                      {inv.status !== 'paid' && (
                        <button
                          onClick={() => payInvoice(inv.id)}
                          className="px-2.5 py-1 rounded bg-[#4ee6aa]/20 hover:bg-[#4ee6aa]/30 text-[#4ee6aa] text-xs transition-colors font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Manual Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateInvoice}
            className="w-full max-w-lg rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
              <h3 className="text-base font-semibold text-[#dee2f2]">Create Manual Invoice</h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Customer
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
                  Line Item Description
                </label>
                <input
                  type="text"
                  required
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Amount ($ USD)
                </label>
                <input
                  type="number"
                  required
                  value={invItemAmount}
                  onChange={(e) => setInvItemAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-semibold text-xs hover:bg-[#8ed5ff]"
              >
                Generate & Queue Invoice
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
