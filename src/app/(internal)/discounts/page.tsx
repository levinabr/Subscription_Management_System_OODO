'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Tag, Check, X, AlertCircle } from 'lucide-react';

interface DiscountRule {
  id: string;
  name: string;
  type: 'FIXED' | 'PERCENTAGE';
  scope: 'PRODUCT' | 'SUBSCRIPTION';
  value: number;
  minPurchasePaise: number;
  minQuantity: number;
  startsAt: string;
  endsAt: string;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  eligibleProducts: Array<{
    productId: string;
    product: {
      name: string;
      sku: string;
    };
  }>;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'FIXED' | 'PERCENTAGE'>('PERCENTAGE');
  const [scope, setScope] = useState<'PRODUCT' | 'SUBSCRIPTION'>('SUBSCRIPTION');
  const [value, setValue] = useState('1000'); // 1000 bps = 10% or 1000 paise
  const [minPurchasePaise, setMinPurchasePaise] = useState('0');
  const [minQuantity, setMinQuantity] = useState('0');
  const [startsAt, setStartsAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [endsAt, setEndsAt] = useState(() => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().slice(0, 10);
  });
  const [usageLimit, setUsageLimit] = useState('');
  const [productIdsInput, setProductIdsInput] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDiscounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/discounts');
      const data = await res.json();
      if (res.ok) {
        setDiscounts(data.data || []);
      } else {
        setError(data.error?.message || 'Failed to fetch discounts');
      }
    } catch {
      setError('Network error fetching discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        name,
        type,
        scope,
        value: parseInt(value, 10),
        minPurchasePaise: parseInt(minPurchasePaise, 10) || 0,
        minQuantity: parseInt(minQuantity, 10) || 0,
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt + 'T23:59:59.999Z').toISOString(),
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        isActive: true,
      };

      if (scope === 'PRODUCT') {
        const pids = productIdsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
        payload.productIds = pids;
      }

      const res = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setShowCreateModal(false);
        // Reset form
        setName('');
        setValue('1000');
        setMinPurchasePaise('0');
        setMinQuantity('0');
        setUsageLimit('');
        setProductIdsInput('');
        await fetchDiscounts();
      } else {
        setFormError(data.error?.message || JSON.stringify(data.error?.details) || 'Failed to create discount');
      }
    } catch {
      setFormError('Network error submitting discount');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleActive = async (discount: DiscountRule) => {
    try {
      const res = await fetch(`/api/discounts/${discount.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !discount.isActive }),
      });
      if (res.ok) {
        await fetchDiscounts();
      }
    } catch {
      alert('Failed to toggle discount status');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Discount Rules</h1>
          <p className="text-sm text-slate-500 mt-1">
            Configure automated percentage & fixed discount rules with product or subscription-wide eligibility.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Discount Rule
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Discounts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading discount rules...</div>
        ) : discounts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No discount rules configured yet. Click &quot;Create Discount Rule&quot; to set one up.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Rule Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Scope</th>
                  <th className="py-3 px-4 text-right">Value</th>
                  <th className="py-3 px-4 text-right">Min Purchase</th>
                  <th className="py-3 px-4 text-center">Min Qty</th>
                  <th className="py-3 px-4">Validity</th>
                  <th className="py-3 px-4 text-center">Usage</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                        {rule.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rule.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded ${
                          rule.scope === 'SUBSCRIPTION'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rule.scope}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {rule.type === 'PERCENTAGE'
                        ? `${(rule.value / 100).toFixed(1)}%`
                        : `₹${(rule.value / 100).toFixed(2)}`}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {rule.minPurchasePaise > 0 ? `₹${(rule.minPurchasePaise / 100).toFixed(2)}` : 'None'}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-600">
                      {rule.minQuantity > 0 ? rule.minQuantity : '—'}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600">
                      {formatDate(rule.startsAt)} – {formatDate(rule.endsAt)}
                    </td>
                    <td className="py-3 px-4 text-center text-xs">
                      <span className="font-semibold text-slate-900">{rule.usedCount}</span>
                      <span className="text-slate-400"> / {rule.usageLimit !== null ? rule.usageLimit : '∞'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(rule)}
                        className={`text-xs font-medium ${
                          rule.isActive
                            ? 'text-rose-600 hover:text-rose-800'
                            : 'text-emerald-600 hover:text-emerald-800'
                        }`}
                      >
                        {rule.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">Create New Discount Rule</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateDiscount} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Annual Festival 15% Off"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PERCENTAGE">PERCENTAGE (bps)</option>
                    <option value="FIXED">FIXED (paise)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Scope</label>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SUBSCRIPTION">SUBSCRIPTION (All Lines)</option>
                    <option value="PRODUCT">PRODUCT (Specific)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Value ({type === 'PERCENTAGE' ? 'Basis Points, e.g. 1500 = 15%' : 'Paise, e.g. 50000 = ₹500'})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={type === 'PERCENTAGE' ? 10000 : undefined}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {scope === 'PRODUCT' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Eligible Product IDs (comma-separated)
                  </label>
                  <input
                    type="text"
                    required
                    value={productIdsInput}
                    onChange={(e) => setProductIdsInput(e.target.value)}
                    placeholder="prod_1, prod_2"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Purchase (Paise)</label>
                  <input
                    type="number"
                    min="0"
                    value={minPurchasePaise}
                    onChange={(e) => setMinPurchasePaise(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={minQuantity}
                    onChange={(e) => setMinQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Starts At</label>
                  <input
                    type="date"
                    required
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ends At</label>
                  <input
                    type="date"
                    required
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usage Limit (Leave blank for unlimited)
                </label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {formSubmitting ? 'Creating...' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
