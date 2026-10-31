'use client';
import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export const ProductsPlansView: React.FC = () => {
  const { plans, products, addPlan, addProduct, exportDataToCsv } = useData();

  const [activeTab, setActiveTab] = useState<'plans' | 'products'>('plans');
  const [isAddPlanModal, setIsAddPlanModal] = useState(false);
  const [isAddProductModal, setIsAddProductModal] = useState(false);

  // New plan state
  const [planCode, setPlanCode] = useState('PLN-CUSTOM');
  const [planName, setPlanName] = useState('Growth Turbo Tier');
  const [planPriceMonthly, setPlanPriceMonthly] = useState(1450);
  const [planPriceAnnual, setPlanPriceAnnual] = useState(14500);
  const [planSeats, setPlanSeats] = useState(25);
  const [planFeatures, setPlanFeatures] = useState('25 Team Seats, Adyen Gateway Sweep, Real-time Webhooks');

  // New product state
  const [prodSku, setProdSku] = useState('SKU-CLUSTER-ADD');
  const [prodName, setProdName] = useState('Dedicated Kubernetes Egress Pool');
  const [prodCat, setProdCat] = useState<'Platform' | 'Add-on' | 'Usage' | 'Enterprise Support'>('Add-on');
  const [prodPrice, setProdPrice] = useState(650);
  const [prodCost, setProdCost] = useState(110);
  const [prodTaxRate, setProdTaxRate] = useState(8.5);

  const handleAddPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlan({
      code: planCode,
      name: planName,
      priceMonthly: planPriceMonthly,
      priceAnnual: planPriceAnnual,
      interval: 'monthly',
      minSeats: planSeats,
      features: planFeatures.split(',').map(s => s.trim())
    });
    setIsAddPlanModal(false);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      sku: prodSku,
      name: prodName,
      category: prodCat,
      sellingPrice: prodPrice,
      costPrice: prodCost,
      taxRate: prodTaxRate,
      taxName: 'State Tech Sales Tax',
      notes: 'Added via catalog console'
    });
    setIsAddProductModal(false);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#dee2f2]">
              Products, Plans & Subscription Tiers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#161b27] text-[#38bdf8] font-mono text-xs border border-[#38bdf8]/20">
              {plans.length} Plans • {products.length} Products
            </span>
          </div>
          <p className="text-sm text-[#bdc8d1] font-normal">
            Configure subscription tiers, modular add-on SKUs, seat overage matrices, and recurring service line items.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeTab === 'plans' ? (
            <button
              onClick={() => setIsAddPlanModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-xs font-semibold transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              <span>+ Add Plan Tier</span>
            </button>
          ) : (
            <button
              onClick={() => setIsAddProductModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#38bdf8] hover:bg-[#8ed5ff] text-[#00354a] text-xs font-semibold transition-all shadow-[0_0_16px_rgba(56,189,248,0.3)]"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>+ Add Product SKU</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#94a3b8]/15 pb-2">
        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'plans'
              ? 'bg-[#252a36] text-[#38bdf8] border border-[#38bdf8]/30 shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#161b27]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">layers</span>
          <span>Subscription Plans & Tiers ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'products'
              ? 'bg-[#252a36] text-[#38bdf8] border border-[#38bdf8]/30 shadow-sm'
              : 'text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#161b27]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">inventory_2</span>
          <span>Products & Modular SKUs ({products.length})</span>
        </button>
      </div>

      {/* Tab 1: Plans */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl bg-[#161b27]/80 backdrop-blur-md border p-6 flex flex-col justify-between transition-all relative ${
                plan.recommended
                  ? 'border-[#38bdf8]/50 shadow-[0_0_24px_rgba(56,189,248,0.15)] bg-[#1b1f2b]'
                  : 'border-[#94a3b8]/15 hover:border-[#94a3b8]/30'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#38bdf8] text-[#00354a] font-mono text-[10px] font-bold uppercase tracking-wider shadow-md">
                  MOST POPULAR
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-[#87929a]">{plan.code}</span>
                  <span className="text-[11px] font-mono text-[#38bdf8]">{plan.minSeats} Seats base</span>
                </div>

                <h3 className="text-lg font-bold text-[#dee2f2]">{plan.name}</h3>

                <div className="mt-4 mb-6">
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-[#dee2f2]">${plan.priceMonthly}</span>
                    <span className="text-xs text-[#87929a]">/ month</span>
                  </div>
                  <span className="text-[11px] text-[#4ee6aa] font-mono mt-1 block">
                    or ${plan.priceAnnual}/yr (Save 17%)
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 pt-4 border-t border-[#94a3b8]/15 text-xs text-[#bdc8d1]">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-[16px] text-[#4ee6aa] flex-shrink-0">
                        check
                      </span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#94a3b8]/15">
                <button
                  onClick={() => alert(`Selected ${plan.name} for configuration.`)}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    plan.recommended
                      ? 'bg-[#38bdf8] text-[#00354a] hover:bg-[#8ed5ff]'
                      : 'bg-[#252a36] text-[#dee2f2] hover:bg-[#303541]'
                  }`}
                >
                  Configure Contract
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Products */}
      {activeTab === 'products' && (
        <div className="rounded-xl bg-[#161b27]/80 backdrop-blur-md border border-[#94a3b8]/15 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#090e19]/90 text-[#87929a] text-[11px] uppercase tracking-wider font-semibold border-b border-[#94a3b8]/15">
                  <th className="py-4 px-6">SKU</th>
                  <th className="py-4 px-6">Product / Add-on Name</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6 text-right">Selling Price</th>
                  <th className="py-4 px-6 text-right">Cost Price</th>
                  <th className="py-4 px-6 text-right">Tax Nexus Rate</th>
                  <th className="py-4 px-6">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#94a3b8]/10 text-xs">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1b1f2b]/60 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-[#38bdf8]">{p.sku}</td>
                    <td className="py-4 px-6 font-semibold text-[#dee2f2]">{p.name}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#252a36] text-[#bdc2ff]">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-mono font-bold text-[#dee2f2]">
                      ${p.sellingPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#87929a]">
                      ${p.costPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-[#4ee6aa]">
                      {p.taxRate > 0 ? `${p.taxRate}% (${p.taxName})` : 'Exempt'}
                    </td>
                    <td className="py-4 px-6 font-mono text-[#87929a]">{p.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Plan Modal */}
      {isAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddPlanSubmit}
            className="w-full max-w-md rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
              <h3 className="text-base font-semibold text-[#dee2f2]">Add New Subscription Plan</h3>
              <button
                type="button"
                onClick={() => setIsAddPlanModal(false)}
                className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Plan Code (SKU)
                </label>
                <input
                  type="text"
                  required
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                    Monthly Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={planPriceMonthly}
                    onChange={(e) => setPlanPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                    Annual Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={planPriceAnnual}
                    onChange={(e) => setPlanPriceAnnual(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Features (comma separated)
                </label>
                <textarea
                  rows={2}
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
              <button
                type="button"
                onClick={() => setIsAddPlanModal(false)}
                className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-semibold text-xs hover:bg-[#8ed5ff]"
              >
                Save Plan Tier
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddProductSubmit}
            className="w-full max-w-md rounded-2xl bg-[#0e131e] border border-[#94a3b8]/20 p-6 flex flex-col gap-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
              <h3 className="text-base font-semibold text-[#dee2f2]">Add Modular Product SKU</h3>
              <button
                type="button"
                onClick={() => setIsAddProductModal(false)}
                className="p-1 rounded text-[#87929a] hover:text-[#dee2f2]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  SKU Identifier
                </label>
                <input
                  type="text"
                  required
                  value={prodSku}
                  onChange={(e) => setProdSku(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                    Selling Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[#87929a] uppercase font-semibold text-[10px] mb-1">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    required
                    value={prodCost}
                    onChange={(e) => setProdCost(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#161b27] border border-[#94a3b8]/20 text-[#dee2f2] outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#94a3b8]/15">
              <button
                type="button"
                onClick={() => setIsAddProductModal(false)}
                className="px-4 py-2 rounded-lg bg-[#161b27] text-[#bdc8d1] hover:text-[#dee2f2] text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#38bdf8] text-[#00354a] font-semibold text-xs hover:bg-[#8ed5ff]"
              >
                Add SKU to Catalog
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
