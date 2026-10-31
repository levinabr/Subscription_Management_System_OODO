"use client";

import React, { useState, useEffect } from "react";
import { ProductType } from "@prisma/client";
import { Plus, Search, Tag, Settings2, CheckCircle2, XCircle } from "lucide-react";
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

interface Variant {
  id: string;
  optionName: string;
  value: string;
  priceAdjustment: number;
  active: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  productType: ProductType;
  notes?: string | null;
  salesPrice: number;
  costPrice?: number;
  active: boolean;
  taxRule?: TaxRule | null;
  variants: Variant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [taxes, setTaxes] = useState<TaxRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProductForVariants, setSelectedProductForVariants] = useState<Product | null>(null);

  // Form states
  const [formData, setFormData] = useState<{
    sku: string;
    name: string;
    productType: ProductType;
    salesPrice: string;
    costPrice: string;
    taxRuleId: string;
    notes: string;
  }>({
    sku: "",
    name: "",
    productType: ProductType.SOFTWARE,
    salesPrice: "",
    costPrice: "",
    taxRuleId: "",
    notes: "",
  });

  const [variantFormData, setVariantFormData] = useState({
    optionName: "",
    value: "",
    priceAdjustment: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const url = search
        ? `/api/products?search=${encodeURIComponent(search)}`
        : "/api/products";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
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
    fetchProducts();
    fetchTaxes();
  }, [search]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        sku: formData.sku.toUpperCase().trim(),
        name: formData.name.trim(),
        productType: formData.productType,
        salesPrice: rupeesToPaise(formData.salesPrice),
        costPrice: rupeesToPaise(formData.costPrice || "0"),
        taxRuleId: formData.taxRuleId || null,
        notes: formData.notes.trim() || null,
        active: true,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create product.");
      }

      setIsCreateOpen(false);
      setFormData({
        sku: "",
        name: "",
        productType: ProductType.SOFTWARE,
        salesPrice: "",
        costPrice: "",
        taxRuleId: "",
        notes: "",
      });
      fetchProducts();
    } catch (err: any) {
      setFormError(err.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !product.active }),
      });
      fetchProducts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForVariants) return;
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        optionName: variantFormData.optionName.trim(),
        value: variantFormData.value.trim(),
        priceAdjustment: rupeesToPaise(variantFormData.priceAdjustment || "0"),
        active: true,
      };

      const res = await fetch(`/api/products/${selectedProductForVariants.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to add variant.");
      }

      setVariantFormData({ optionName: "", value: "", priceAdjustment: "" });
      fetchProducts();
      // Update selected product locally
      setSelectedProductForVariants((prev) =>
        prev ? { ...prev, variants: [...prev.variants, data.data] } : null
      );
    } catch (err: any) {
      setFormError(err.message || "Failed to add variant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Products & Catalog
          </h2>
          <p className="text-sm text-slate-500">
            Define recurring software products, billable services, and customizable variants.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Product
        </Button>
      </div>

      {/* Filter toolbar */}
      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU, product name, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Product table */}
      {isLoading ? (
        <LoadingState message="Loading catalog products..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description={
            search
              ? "No catalog items matched your search filter."
              : "Get started by adding your first product to the catalog."
          }
          actionLabel={search ? undefined : "Add First Product"}
          onAction={search ? undefined : () => setIsCreateOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU / Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sales Price</TableHead>
              <TableHead>Cost Price</TableHead>
              <TableHead>Tax Rate</TableHead>
              <TableHead>Variants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-400 font-mono tracking-wider">
                    {p.sku}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="neutral" size="sm">
                    {p.productType}
                  </Badge>
                </TableCell>
                <TableCell className="font-semibold text-slate-900">
                  {formatPaise(p.salesPrice)}
                </TableCell>
                <TableCell className="text-slate-500 font-mono text-xs">
                  {p.costPrice !== undefined ? formatPaise(p.costPrice) : "—"}
                </TableCell>
                <TableCell>
                  {p.taxRule ? (
                    <span className="text-xs text-slate-600">
                      {p.taxRule.name} ({(p.taxRule.rate / 100).toFixed(1)}%)
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">None</span>
                  )}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => setSelectedProductForVariants(p)}
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    {p.variants.length} variant(s)
                  </button>
                </TableCell>
                <TableCell>
                  <Badge variant={p.active ? "success" : "neutral"} size="sm">
                    {p.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleActive(p)}
                    className={p.active ? "text-slate-500 hover:text-rose-600" : "text-emerald-600 hover:text-emerald-700"}
                  >
                    {p.active ? "Deactivate" : "Activate"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Product Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Catalog Product"
        description="Enter the commercial and financial properties of this item"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Product SKU"
              placeholder="e.g. PROD-CRM-BASE"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
            <Input
              label="Product Name"
              placeholder="e.g. Enterprise CRM License"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Product Type"
              value={formData.productType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  productType: e.target.value as ProductType,
                })
              }
              options={[
                { value: ProductType.SOFTWARE, label: "Software" },
                { value: ProductType.SERVICE, label: "Service" },
                { value: ProductType.ADD_ON, label: "Add-On" },
                { value: ProductType.OTHER, label: "Other" },
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
              label="Sales Price (in ₹)"
              type="number"
              step="0.01"
              placeholder="4999.00"
              required
              value={formData.salesPrice}
              onChange={(e) => setFormData({ ...formData, salesPrice: e.target.value })}
              helperText="Saved in integer paise in database"
            />
            <Input
              label="Cost Price (in ₹ - Admin Only)"
              type="number"
              step="0.01"
              placeholder="1500.00"
              required
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
              helperText="Masked from customer self-service"
            />
          </div>

          <Input
            label="Internal Notes / Description"
            placeholder="Commercial terms, provisioning details..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              Create Product
            </Button>
          </div>
        </form>
      </Modal>

      {/* Manage Variants Modal */}
      <Modal
        isOpen={!!selectedProductForVariants}
        onClose={() => setSelectedProductForVariants(null)}
        title={`Variants: ${selectedProductForVariants?.name}`}
        description="Configure tier options, storage sizes, and price adjustments"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <div className="space-y-6">
          {/* Add Variant Form */}
          <form
            onSubmit={handleAddVariant}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
          >
            <div className="text-xs font-semibold uppercase text-slate-700">
              Add New Variant
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Option Name"
                placeholder="e.g. Storage"
                required
                value={variantFormData.optionName}
                onChange={(e) =>
                  setVariantFormData({ ...variantFormData, optionName: e.target.value })
                }
              />
              <Input
                label="Value"
                placeholder="e.g. 500GB"
                required
                value={variantFormData.value}
                onChange={(e) =>
                  setVariantFormData({ ...variantFormData, value: e.target.value })
                }
              />
              <Input
                label="Price Adj (₹)"
                type="number"
                step="0.01"
                placeholder="500.00"
                value={variantFormData.priceAdjustment}
                onChange={(e) =>
                  setVariantFormData({
                    ...variantFormData,
                    priceAdjustment: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" size="sm" isLoading={isSubmitting}>
                Add Variant
              </Button>
            </div>
          </form>

          {/* Existing Variants List */}
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase text-slate-500">
              Configured Variants
            </div>
            {selectedProductForVariants?.variants.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">
                No variants added yet. Line items will use the standard base product.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white">
                {selectedProductForVariants?.variants.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 flex items-center justify-between text-sm"
                  >
                    <div>
                      <span className="font-semibold text-slate-900">
                        {v.optionName}: {v.value}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-semibold text-slate-700">
                        {v.priceAdjustment >= 0 ? "+" : ""}
                        {formatPaise(v.priceAdjustment)}
                      </span>
                      <Badge variant={v.active ? "success" : "neutral"} size="sm">
                        {v.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
