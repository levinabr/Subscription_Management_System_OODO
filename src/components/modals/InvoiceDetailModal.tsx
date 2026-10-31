'use client';
import React from 'react';
import { useData } from '../../context/DataContext';

export const InvoiceDetailModal: React.FC = () => {
  const { selectedInvoice, setSelectedInvoice, payInvoice } = useData();

  if (!selectedInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl bg-[#0B1220] border border-[#94a3b8]/25 shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-[#dee2f2] relative my-auto">
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-[#94a3b8]/15 print:hidden">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">receipt_long</span>
            <span className="font-mono text-sm font-semibold">{selectedInvoice.invoiceNumber}</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                selectedInvoice.status === 'paid'
                  ? 'bg-[#4ee6aa]/15 text-[#4ee6aa]'
                  : selectedInvoice.status === 'processing'
                  ? 'bg-[#38bdf8]/15 text-[#38bdf8]'
                  : 'bg-[#93000a]/20 text-[#ffb4ab]'
              }`}
            >
              {selectedInvoice.status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedInvoice.status !== 'paid' && (
              <button
                onClick={() => {
                  payInvoice(selectedInvoice.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-[#4ee6aa] text-[#003825] font-semibold text-xs hover:bg-[#68fcbf] transition-colors"
              >
                Mark Paid
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252a36] hover:bg-[#303541] text-[#dee2f2] text-xs font-medium transition-colors border border-[#94a3b8]/15"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              <span>Print / PDF</span>
            </button>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="p-1.5 rounded-lg text-[#87929a] hover:text-[#dee2f2] hover:bg-[#252a36]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div className="flex flex-col gap-8 bg-[#080D18] p-6 sm:p-8 rounded-xl border border-[#94a3b8]/10 print:border-0 print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38bdf8] to-[#2f3aa3] flex items-center justify-center text-white font-bold text-sm">
                  P
                </div>
                <span className="text-xl font-bold tracking-tight text-[#dee2f2]">PLANZO Finance Inc.</span>
              </div>
              <span className="text-xs text-[#87929a] mt-1">
                500 Howard Street, Suite 400<br />
                San Francisco, CA 94105 • US<br />
                tax-nexus: US-CA-8921820
              </span>
            </div>

            <div className="flex flex-col items-end text-right font-mono">
              <span className="text-2xl font-bold text-[#38bdf8]">{selectedInvoice.invoiceNumber}</span>
              <span className="text-xs text-[#87929a] mt-1">Issue Date: {selectedInvoice.issueDate}</span>
              <span className="text-xs text-[#87929a]">Due Date: {selectedInvoice.dueDate}</span>
              <span className="text-xs text-[#87929a]">Sub Ref: {selectedInvoice.subId}</span>
            </div>
          </div>

          {/* Billed To / Account Info */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-[#161b27]/60 border border-[#94a3b8]/10 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-[#87929a] uppercase tracking-wider">
                Billed To:
              </span>
              <span className="text-sm font-semibold text-[#dee2f2]">{selectedInvoice.customerName}</span>
              <span className="text-[#bdc8d1]">{selectedInvoice.customerEmail}</span>
              <span className="text-[#87929a]">{selectedInvoice.customerAddress}</span>
              <span className="text-[#87929a] font-mono">Tax ID: {selectedInvoice.customerTaxId}</span>
            </div>

            <div className="flex flex-col gap-1 text-right">
              <span className="text-[10px] font-semibold text-[#87929a] uppercase tracking-wider">
                Payment Vector:
              </span>
              <span className="text-sm font-medium text-[#dee2f2]">
                {selectedInvoice.paymentMethod || 'Primary Gateway Sweep'}
              </span>
              <span className="text-[#4ee6aa] font-mono mt-1">
                Status: {selectedInvoice.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-[#94a3b8]/20 text-[#87929a] uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-2.5 font-sans">Item / Service Description</th>
                  <th className="py-2.5 text-center font-sans">Qty</th>
                  <th className="py-2.5 text-right font-sans">Unit Price</th>
                  <th className="py-2.5 text-right font-sans">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#94a3b8]/10">
                {selectedInvoice.lineItems.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3 font-sans text-[#dee2f2] font-medium">{item.description}</td>
                    <td className="py-3 text-center text-[#87929a]">{item.quantity}</td>
                    <td className="py-3 text-right text-[#bdc8d1]">
                      ${item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-right text-[#dee2f2] font-semibold">
                      ${item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="flex justify-end pt-2 border-t border-[#94a3b8]/15">
            <div className="w-64 flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex justify-between text-[#87929a]">
                <span>Subtotal:</span>
                <span>${selectedInvoice.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-[#87929a]">
                <span>Tax (Nexus 8.5%):</span>
                <span>${selectedInvoice.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              {selectedInvoice.discountAmount > 0 && (
                <div className="flex justify-between text-[#4ee6aa]">
                  <span>Discount / Proration:</span>
                  <span>-${selectedInvoice.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-[#dee2f2] pt-2 border-t border-[#94a3b8]/20">
                <span>Total Due:</span>
                <span className="text-[#38bdf8]">
                  ${selectedInvoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Wire details footer */}
          <div className="p-3.5 rounded-lg bg-[#161b27]/40 border border-[#94a3b8]/10 text-[11px] text-[#87929a] flex flex-col gap-1">
            <span className="font-semibold text-[#dee2f2]">Wire Settlement Instructions:</span>
            <span>JPMorgan Chase Bank, N.A. • Routing: 021000021 • Account: 9081294821</span>
            <span>Remittance note: Please reference {selectedInvoice.invoiceNumber} in transfer memo.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
