'use client';

import React, { useState } from 'react';
import { formatINR } from '../invoices/InvoiceStatusBadge';
import { CreditCard, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  invoice: {
    id: string;
    invoiceNo: string;
    totalPaise: number;
    totalPaidPaise: number;
    outstandingPaise: number;
    status: string;
    customer?: {
      businessName: string;
    };
  };
  onPaymentSuccess?: (result: any) => void;
  onCancel?: () => void;
}

export function PaymentForm({ invoice, onPaymentSuccess, onCancel }: PaymentFormProps) {
  const [amountRupees, setAmountRupees] = useState<string>(
    (invoice.outstandingPaise / 100).toString()
  );
  const [method, setMethod] = useState<string>('UPI');
  const [paidAt, setPaidAt] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState<string>('');
  const [note, setNote] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Compute live amount in paise
  const enteredAmountPaise = Math.round((parseFloat(amountRupees) || 0) * 100);
  const remainingPaise = invoice.outstandingPaise - enteredAmountPaise;

  const isOverpayment = enteredAmountPaise > invoice.outstandingPaise;
  const isZeroOrNegative = enteredAmountPaise <= 0;
  const isValid = !isOverpayment && !isZeroOrNegative && !isNaN(enteredAmountPaise);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || loading) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/invoices/${invoice.id}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amountPaise: enteredAmountPaise,
          method,
          paidAt: new Date(paidAt).toISOString(),
          reference: reference.trim() || undefined,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to record payment');
      }

      setSuccessMsg(
        `Payment of ${formatINR(enteredAmountPaise)} successfully recorded! Invoice status is now ${data.invoice.status}.`
      );
      if (onPaymentSuccess) {
        onPaymentSuccess(data);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-lg">Record Payment</h3>
            <p className="text-sm text-slate-500">
              Apply a received payment to invoice #{invoice.invoiceNo}
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          {invoice.customer?.businessName || 'Customer'}
        </span>
      </div>

      {/* Invoice Balance Snapshot */}
      <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200/60">
        <div>
          <div className="text-xs text-slate-500 font-medium">Invoice Total</div>
          <div className="text-base font-bold text-slate-900">
            {formatINR(invoice.totalPaise)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium">Previously Paid</div>
          <div className="text-base font-bold text-emerald-700">
            {formatINR(invoice.totalPaidPaise)}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 font-medium">Outstanding Balance</div>
          <div className="text-base font-bold text-rose-700">
            {formatINR(invoice.outstandingPaise)}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-start gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div>{successMsg}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Payment Amount (₹) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-slate-400 font-semibold">₹</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={(invoice.outstandingPaise / 100).toFixed(2)}
              value={amountRupees}
              onChange={(e) => setAmountRupees(e.target.value)}
              required
              className={`w-full pl-8 pr-4 py-2 border rounded-lg text-slate-900 font-medium focus:ring-2 focus:outline-none transition ${
                isOverpayment
                  ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
                  : 'border-slate-300 focus:ring-emerald-200 focus:border-emerald-600'
              }`}
              placeholder="0.00"
            />
          </div>
          {/* Live Remaining Balance Calculation */}
          <div className="mt-1.5 text-xs flex justify-between items-center">
            {isOverpayment ? (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 inline" /> Cannot exceed outstanding balance of {formatINR(invoice.outstandingPaise)}
              </span>
            ) : isZeroOrNegative ? (
              <span className="text-rose-600">Amount must be greater than zero</span>
            ) : (
              <span className="text-slate-600">
                Remaining after payment:{' '}
                <strong className={remainingPaise === 0 ? 'text-emerald-700 font-bold' : 'text-slate-800'}>
                  {formatINR(Math.max(0, remainingPaise))} {remainingPaise === 0 && '(Invoice will be marked PAID)'}
                </strong>
              </span>
            )}
            <button
              type="button"
              onClick={() => setAmountRupees((invoice.outstandingPaise / 100).toString())}
              className="text-emerald-600 hover:text-emerald-800 font-semibold underline"
            >
              Pay Full
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
            >
              <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
              <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS/IMPS)</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash</option>
              <option value="OTHER">Other Method</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Transaction Reference / UTR
          </label>
          <input
            type="text"
            maxLength={100}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. UPI-REF-984719284 or NEFT-CITI-1234"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-800 mb-1">
            Optional Note
          </label>
          <textarea
            maxLength={500}
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Cheque received, verified in bank statement"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-600 text-sm"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm font-medium transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!isValid || loading}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-2 ${
              !isValid || loading
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Confirm Payment ({formatINR(enteredAmountPaise)})
          </button>
        </div>
      </form>
    </div>
  );
}
