"use client";

import React, { useState, useEffect } from "react";
import { BillingInterval } from "@prisma/client";
import { Plus, Search, CalendarCheck, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table";
import { LoadingState } from "@/components/ui/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPaise, rupeesToPaise } from "@/lib/utils/format";

interface TaxRule {
  id: string;
  name: string;
  rate: number;
}

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  basePrice: number;
  billingInterval: BillingInterval;
  minimumQuantity: number;
  autoCloseAtEnd: boolean;
  canCloseEarly: boolean;
  canPause: boolean;
  canRenew: boolean;
  active: boolean;
  taxRule?: TaxRule | null;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    description: string;
    basePrice: string;
    billingInterval: BillingInterval;
    minimumQuantity: string;
    autoCloseAtEnd: boolean;
    canCloseEarly: boolean;
    canPause: boolean;
    canRenew: boolean;
    taxRuleId: string;
  }>({
    code: "",
    name: "",
    description: "",
    basePrice: "",
    billingInterval: BillingInterval.MONTHLY,
    minimumQuantity: "1",
    autoCloseAtEnd: false,
    canCloseEarly: true,
    canPause: true,
    canRenew: true,
    taxRuleId: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setIsLoading(true);
      const url = search
        ? `/api/plans?search=${encodeURIComponent(search)}`
        : "/api/plans";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaxes = async () => {
    try {
      const res = await fetch("/api/taxes?activeOnly=true");
      const data = await res.json();
      if (data.success) {
        setTaxes(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlans();
    fetchTaxes();
  }, [search]);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        code: formData.code.toUpperCase().trim(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        basePrice: rupeesToPaise(formData.basePrice),
        billingInterval: formData.billingInterval,
        minimumQuantity: parseInt(formData.minimumQuantity, 10) || 1,
        autoCloseAtEnd: formData.autoCloseAtEnd,
        canCloseEarly: formData.canCloseEarly,
        canPause: formData.canPause,
        canRenew: formData.canRenew,
        taxRuleId: formData.taxRuleId || null,
        active: true,
      };

      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create plan.");
      }

      setIsCreateOpen(false);
      setFormData({
        code: "",
        name: "",
        description: "",
        basePrice: "",
        billingInterval: BillingInterval.MONTHLY,
        minimumQuantity: "1",
        autoCloseAtEnd: false,
        canCloseEarly: true,
        canPause: true,
        canRenew: true,
        taxRuleId: "",
      });
      fetchPlans();
    } catch (err: any) {
      setFormError(err.message || "Failed to create plan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (plan: Plan) => {
    try {
      await fetch(`/api/plans/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !plan.active }),
      });
      fetchPlans();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Subscription Plans
          </h2>
          <p className="text-sm text-slate-500">
            Manage contract billing cadences, pause policies, and renewal behavior.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Subscription Plan
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by code, plan name, or terms..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Plans table */}
      {isLoading ? (
        <LoadingState message="Loading subscription plans..." />
      ) : plans.length === 0 ? (
        <EmptyState
          title="No subscription plans found"
          description={
            search
              ? "No plans matched your filter criteria."
              : "Create your first recurring subscription plan."
          }
          actionLabel={search ? undefined : "Create First Plan"}
          onAction={search ? undefined : () => setIsCreateOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code / Name</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead>Base Price</TableHead>
              <TableHead>Tax Rate</TableHead>
              <TableHead>Pause / Renew</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((pl) => (
              <TableRow key={pl.id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{pl.name}</div>
                  <div className="text-xs text-slate-400 font-mono tracking-wider">
                    {pl.code}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="primary" size="sm">
                    {pl.billingInterval}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-900">
                  {formatPaise(pl.basePrice)}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    /{pl.billingInterval.toLowerCase()}
                  </span>
                </TableCell>
                <TableCell>
                  {pl.taxRule ? (
                    <span className="text-xs text-slate-600">
                      {pl.taxRule.name} ({(pl.taxRule.rate / 100).toFixed(1)}%)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span title="Can pause">Pause: {pl.canPause ? "Yes" : "No"}</span> ·{" "}
                    <span title="Can renew">Renew: {pl.canRenew ? "Yes" : "No"}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={pl.active ? "success" : "neutral"} size="sm">
                    {pl.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(pl)}
                    className={pl.active ? "text-slate-500 hover:text-rose-600" : "text-emerald-600 hover:text-emerald-700"}
                  >
                    {pl.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Subscription Plan"
        description="Establish recurring billing interval, price snapshots, and lifecycle rules"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Plan Code"
              placeholder="e.g. ENTERPRISE-ANNUAL"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              label="Plan Name"
              placeholder="e.g. Enterprise Annual Commitment"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Billing Interval"
              value={formData.billingInterval}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  billingInterval: e.target.value as BillingInterval,
                })
              }
              options={[
                { value: BillingInterval.MONTHLY, label: "Monthly" },
                { value: BillingInterval.YEARLY, label: "Yearly" },
                { value: BillingInterval.WEEKLY, label: "Weekly" },
                { value: BillingInterval.DAILY, label: "Daily" },
              ]}
            />
            <Select
              label="Applicable Tax Rule"
              value={formData.taxRuleId}
              onChange={(e) => setFormData({ ...formData, taxRuleId: e.target.value })}
              options={[
                { value: "", label: "None (0%)" },
                ...taxes.map((t) => ({
                  value: t.id,
                  label: `${t.name} (${(t.rate / 100).toFixed(1)}%)`,
                })),
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Base Price (in ₹)"
              type="number"
              step="0.01"
              placeholder="9999.00"
              required
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              helperText="Saved in integer paise in database"
            />
            <Input
              label="Minimum Quantity"
              type="number"
              min="1"
              value={formData.minimumQuantity}
              onChange={(e) =>
                setFormData({ ...formData, minimumQuantity: e.target.value })
              }
            />
          </div>

          <Input
            label="Plan Description"
            placeholder="Key features and SLA inclusions..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          {/* Lifecycle checkboxes */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.canPause}
                onChange={(e) =>
                  setFormData({ ...formData, canPause: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Allow Customer to Pause</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.canRenew}
                onChange={(e) =>
                  setFormData({ ...formData, canRenew: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Allow Auto-Renewal</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.canCloseEarly}
                onChange={(e) =>
                  setFormData({ ...formData, canCloseEarly: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Allow Early Termination</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoCloseAtEnd}
                onChange={(e) =>
                  setFormData({ ...formData, autoCloseAtEnd: e.target.checked })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Auto-Close at Contract End</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
