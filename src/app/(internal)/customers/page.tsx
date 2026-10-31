"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
import { formatDate } from "@/lib/utils/format";

interface Customer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  taxIdentifier?: string | null;
  active: boolean;
  createdAt: string;
  _count?: {
    users: number;
    subscriptions: number;
    invoices: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    taxIdentifier: "",
    country: "IN",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const url = search
        ? `/api/customers?search=${encodeURIComponent(search)}`
        : "/api/customers";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        companyName: formData.companyName.trim(),
        contactName: formData.contactName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        taxIdentifier: formData.taxIdentifier.trim() || null,
        country: formData.country.trim() || "IN",
      };

      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create customer.");
      }

      setIsCreateOpen(false);
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        taxIdentifier: "",
        country: "IN",
      });
      fetchCustomers();
    } catch (err: any) {
      setFormError(err.message || "Failed to create customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Business Customers
          </h2>
          <p className="text-sm text-slate-500">
            Accounts, corporate tax identifiers, and enterprise subscription records.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Customer
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customers by company name, contact, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingState message="Loading customers..." />
      ) : customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description={
            search
              ? "No customers matched your search query."
              : "Register your first business customer account."
          }
          actionLabel={search ? undefined : "Add First Customer"}
          onAction={search ? undefined : () => setIsCreateOpen(true)}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company / Contact</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>Tax ID / GSTIN</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="font-semibold text-slate-900">
                    {c.companyName}
                  </div>
                  <div className="text-xs text-slate-500">{c.contactName}</div>
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-700">
                  {c.email}
                </TableCell>
                <TableCell className="text-xs text-slate-600 font-mono">
                  {c.taxIdentifier || "—"}
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {c._count?.users || 0} user(s)
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  {c._count?.subscriptions || 0} active
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDate(c.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={c.active ? "success" : "neutral"} size="sm">
                    {c.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create Customer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Business Customer"
        description="Register an enterprise customer account for recurring invoices"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Company Name"
              placeholder="e.g. Reliance Tech Corp"
              required
              value={formData.companyName}
              onChange={(e) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
            <Input
              label="Primary Contact Name"
              placeholder="e.g. Rajesh Kumar"
              required
              value={formData.contactName}
              onChange={(e) =>
                setFormData({ ...formData, contactName: e.target.value })
              }
            />
          </div>

          <Input
            label="Business Email"
            type="email"
            placeholder="billing@company.com"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 98765 00000"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <Input
              label="Tax ID / GSTIN"
              placeholder="27AAAAA0000A1Z5"
              value={formData.taxIdentifier}
              onChange={(e) =>
                setFormData({ ...formData, taxIdentifier: e.target.value })
              }
            />
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
              Create Customer Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
