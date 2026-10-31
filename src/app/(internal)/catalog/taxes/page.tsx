"use client";

import React, { useState, useEffect } from "react";
import { Plus, Percent } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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
import { formatBasisPoints, percentageToBasisPoints } from "@/lib/utils/format";

interface TaxRule {
  id: string;
  name: string;
  rate: number;
  startDate?: string | null;
  endDate?: string | null;
  active: boolean;
  _count?: {
    products: number;
    plans: number;
  };
}

export default function TaxesPage() {
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    ratePercentage: "18.0",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/taxes");
      const data = await res.json();
      if (data.success) {
        setTaxes(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, []);

  const handleCreateTax = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        rate: percentageToBasisPoints(formData.ratePercentage),
        active: true,
      };

      const res = await fetch("/api/taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create tax rule.");
      }

      setIsCreateOpen(false);
      setFormData({ name: "", ratePercentage: "18.0" });
      fetchTaxes();
    } catch (err: any) {
      setFormError(err.message || "Failed to create tax rule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (tax: TaxRule) => {
    try {
      await fetch(`/api/taxes/${tax.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !tax.active }),
      });
      fetchTaxes();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Tax Rules & Rates
          </h2>
          <p className="text-sm text-slate-500">
            Configure statutory taxation rates stored precisely in basis points (18% = 1800 bps).
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Tax Rule
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading tax rules..." />
      ) : taxes.length === 0 ? (
        <EmptyState
          title="No tax rules found"
          description="Create your first statutory tax rule (e.g. GST, VAT)."
          actionLabel="Add Tax Rule"
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rule Name</TableHead>
              <TableHead>Rate (Percentage)</TableHead>
              <TableHead>Basis Points</TableHead>
              <TableHead>Referenced Products</TableHead>
              <TableHead>Referenced Plans</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taxes.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-semibold text-slate-900">
                  {t.name}
                </TableCell>
                <TableCell className="font-bold text-indigo-700">
                  {formatBasisPoints(t.rate)}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-500">
                  {t.rate} bps
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {t._count?.products || 0} product(s)
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {t._count?.plans || 0} plan(s)
                </TableCell>
                <TableCell>
                  <Badge variant={t.active ? "success" : "neutral"} size="sm">
                    {t.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(t)}
                    className={t.active ? "text-slate-500 hover:text-rose-600" : "text-emerald-600 hover:text-emerald-700"}
                  >
                    {t.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Tax Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Tax Rule"
        description="Statutory tax rate for automated invoice line calculation"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateTax} className="space-y-4">
          <Input
            label="Tax Rule Name"
            placeholder="e.g. GST Standard 18% or VAT 5%"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Rate Percentage (%)"
            type="number"
            step="0.01"
            placeholder="18.0"
            required
            value={formData.ratePercentage}
            onChange={(e) =>
              setFormData({ ...formData, ratePercentage: e.target.value })
            }
            helperText="Saved as basis points (e.g. 18.00% = 1800 bps)"
          />

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Create Tax Rule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
