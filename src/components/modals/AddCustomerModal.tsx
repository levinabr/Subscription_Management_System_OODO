'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const AddCustomerModal: React.FC = () => {
  const { isAddCustomerModalOpen, setIsAddCustomerModalOpen, addCustomer } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'Tier 1' | 'Tier 2' | 'Growth' | 'Enterprise'>('Tier 1');
  const [location, setLocation] = useState('San Francisco, CA');
  const [taxId, setTaxId] = useState('12-9847192');
  const [currency, setCurrency] = useState('USD ($)');
  const [paymentType, setPaymentType] = useState<'visa' | 'mastercard' | 'amex' | 'ach' | 'bacs' | 'sepa'>('visa');
  const [cardLast4, setCardLast4] = useState('4242');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAddCustomerModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    // Client-side quick check
    if (!name || name.trim().length < 2) {
      setFieldErrors(prev => ({ ...prev, companyName: 'Company name must be at least 2 characters' }));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email address (e.g. name@domain.com)' }));
      return;
    }

    try {
      setIsSubmitting(true);
      await addCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        company: name.trim(),
        status: 'active',
        tier,
        plansCount: 1,
        primaryPlan: tier === 'Enterprise' || tier === 'Tier 1' ? 'Enterprise Core' : 'Growth Scale',
        taxId: taxId.trim(),
        currency,
        location: location.trim(),
        paymentMethod: {
          type: paymentType as any,
          last4: cardLast4,
          expiry: '12/28',
          verified: true,
          name: `Corporate ${paymentType.toUpperCase()} Sweep`
        }
      });

      // Reset form state on success
      setName('');
      setEmail('');
      setErrorMessage(null);
      setFieldErrors({});
      setIsAddCustomerModalOpen(false);
    } catch (err: any) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length > 0) {
        setFieldErrors(err.fieldErrors);
      }
      setErrorMessage(err.message || 'Validation failed. Please verify the input values.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrorMessage(null);
    setFieldErrors({});
    setIsAddCustomerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">person_add</span>
            <h3 className="text-base font-semibold text-[#dee2f2]">Add Customer Account</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
            <span className="material-symbols-outlined text-[18px] text-red-400 shrink-0">error</span>
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
              Organization / Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.companyName) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.companyName;
                    return next;
                  });
                }
              }}
              className={`w-full px-3 py-2 rounded-lg bg-[#161b27] border ${
                fieldErrors.companyName ? 'border-red-500 text-red-200' : 'border-[#94a3b8]/20 text-[#dee2f2]'
              } outline-none transition-colors`}
            />
            {fieldErrors.companyName && (
              <span className="text-[11px] text-red-400 mt-1 block font-medium">{fieldErrors.companyName}</span>
            )}
          </div>

          <div>
            <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
              Billing Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="billing@acme.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors(prev => {
                    const next = { ...prev };
                    delete next.email;
                    return next;
                  });
                }
              }}
              className={`w-full px-3 py-2 rounded-lg bg-[#161b27] border ${
                fieldErrors.email ? 'border-red-500 text-red-200' : 'border-[#94a3b8]/20 text-[#dee2f2]'
              } outline-none transition-colors`}
            />
            {fieldErrors.email && (
              <span className="text-[11px] text-red-400 mt-1 block font-medium">{fieldErrors.email}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Account Tier
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              >
                <option value="Tier 1">Tier 1 (Enterprise)</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Growth">Growth</option>
                <option value="Tier 2">Tier 2</option>
              </select>
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Tax ID / EIN
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Headquarters Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              />
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Payment Type
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none uppercase"
              >
                <option value="visa">Visa</option>
                <option value="mastercard">Mastercard</option>
                <option value="amex">Amex</option>
                <option value="ach">ACH Transfer</option>
                <option value="bacs">BACS Direct</option>
                <option value="sepa">SEPA Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Card / Account Last 4
              </label>
              <input
                type="text"
                maxLength={4}
                value={cardLast4}
                onChange={(e) => setCardLast4(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#94a3b8]/15 mt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-semibold text-xs hover:bg-[#8ed5ff] transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Save Customer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
