'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const NewSubscriptionModal: React.FC = () => {
  const {
    isNewSubModalOpen,
    setIsNewSubModalOpen,
    customers,
    plans,
    addSubscription,
    setCurrentPage
  } = useData();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[1]?.id || plans[0]?.id || '');
  const [seats, setSeats] = useState(15);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'quarterly'>('monthly');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['API Turbo Tier']);

  if (!isNewSubModalOpen) return null;

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const basePrice = billingCycle === 'annual' ? currentPlan.priceAnnual / 12 : currentPlan.priceMonthly;
  const seatOverage = Math.max(0, seats - (currentPlan.minSeats || 5)) * (currentPlan.overageRatePerSeat || 35);
  const addonsTotal = selectedAddons.length * 150;
  const calculatedMrr = Math.round(basePrice + seatOverage + addonsTotal);

  const toggleAddon = (name: string) => {
    setSelectedAddons(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer || !currentPlan) return;

    addSubscription({
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerEmail: currentCustomer.email,
      customerInitials: currentCustomer.avatarInitials,
      planName: currentPlan.name,
      planTier: (currentPlan.name.includes('Enterprise') ? 'Enterprise' : currentPlan.name.includes('Pro') ? 'Pro' : 'Starter') as any,
      seats,
      maxSeats: seats + 10,
      addons: selectedAddons,
      mrr: calculatedMrr,
      billingCycle,
      status: 'active',
      health: 'Healthy',
      renewalDate: new Date(Date.now() + 30 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      renewalDaysLeft: 30,
      clearinghouse: currentCustomer.paymentMethod.name || 'Stripe US-ACQ'
    });

    setIsNewSubModalOpen(false);
    setCurrentPage('subscriptions');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 sm:p-7 flex flex-col gap-5 shadow-2xl relative my-auto">
        <div className="flex items-center justify-between pb-3 border-b border-[#94a3b8]/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#38bdf8] text-[20px]">add_circle</span>
            <h3 className="text-base font-semibold text-[#dee2f2]">Provision New Subscription</h3>
          </div>
          <button
            onClick={() => setIsNewSubModalOpen(false)}
            className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
              Select Customer Account
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email}) • {c.tier}
                </option>
              ))}
            </select>
          </div>

          {/* Plan Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Plan Tier
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              >
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.priceMonthly}/mo)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
              >
                <option value="monthly">Monthly Recurring</option>
                <option value="annual">Annual Prepaid (Discounted)</option>
                <option value="quarterly">Quarterly</option>
              </select>
            </div>
          </div>

          {/* Seats Allocation */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[#87929a] uppercase font-semibold text-[10px]">
                Seat Allocation: <span className="font-mono text-[#dee2f2]">{seats} Seats</span>
              </label>
              <span className="text-[10px] text-[#38bdf8] font-mono">
                Base includes {currentPlan?.minSeats || 5} seats
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
              className="w-full accent-[#38bdf8] cursor-pointer"
            />
          </div>

          {/* Modular Add-ons */}
          <div>
            <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1.5">
              Modular Infrastructure Add-ons
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'API Turbo Tier',
                'Dedicated Egress Cluster',
                'HIPAA Audit Vault',
                'Priority 24/7 TAM'
              ].map((addon) => {
                const isSelected = selectedAddons.includes(addon);
                return (
                  <button
                    type="button"
                    key={addon}
                    onClick={() => toggleAddon(addon)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#38bdf8]/15 border-[#38bdf8] text-[#dee2f2]'
                        : 'bg-[#161b27] border-[#94a3b8]/15 text-[#87929a] hover:border-[#94a3b8]/30'
                    }`}
                  >
                    <span>{addon}</span>
                    <span className="material-symbols-outlined text-[16px]">
                      {isSelected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Projected MRR Summary */}
          <div className="p-3.5 rounded-xl bg-[#090e19] border border-[#94a3b8]/15 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-[#87929a]">
                Projected Monthly Run Rate (MRR)
              </span>
              <span className="text-xs text-[#bdc8d1] mt-0.5">
                Includes base plan, seat overages & add-ons
              </span>
            </div>
            <span className="text-xl font-mono font-bold text-[#38bdf8]">
              ${calculatedMrr.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
            <button
              type="button"
              onClick={() => setIsNewSubModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] font-semibold text-xs transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
            >
              Provision & Activate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
