"use client";

import React, { useState, useEffect } from "react";
import { UserCheck, Plus, Shield } from "lucide-react";
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
import { formatDate } from "@/lib/utils/format";

interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      // We can fetch staff list through auth/me or customer/staff queries
      const res = await fetch("/api/customers");
      // For staff list, we can list internal users or show initial staff
      setStaffList([
        {
          id: "seed-admin",
          name: "PLANZO Administrator",
          email: "admin@planzo.io",
          role: "ADMIN",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: "STAFF" as const,
      };

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to create staff account.");
      }

      setIsCreateOpen(false);
      setFormData({ name: "", email: "", password: "" });
      setStaffList((prev) => [...prev, data.data]);
    } catch (err: any) {
      setFormError(err.message || "Failed to create staff account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Internal Staff & Access Control
          </h2>
          <p className="text-sm text-slate-500">
            Administrators can provision staff accounts for customer servicing and billing management.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Provision Staff Account
        </Button>
      </div>

      <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900">
        <Shield className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <span className="font-semibold">Security Boundary: </span>
          Staff accounts have permissions to generate quotes, execute billing runs, and issue invoices. They cannot modify catalog pricing, tax rates, or create other staff members.
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Loading internal staff..." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Email Address</TableHead>
              <TableHead>System Role</TableHead>
              <TableHead>Provisioned</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-semibold text-slate-900">
                  {s.name}
                </TableCell>
                <TableCell className="font-mono text-xs text-slate-700">
                  {s.email}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={s.role === "ADMIN" ? "purple" : "primary"}
                    size="sm"
                  >
                    {s.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  {formatDate(s.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Provision Staff Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Internal Staff Account"
        description="Creates an authorized staff user with billing operations permissions"
        maxWidth="md"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Arun Nair"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Corporate Email Address"
            type="email"
            placeholder="arun@planzo.io"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Temporary Initial Password"
            type="password"
            placeholder="••••••••••••"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            helperText="Must be >8 characters with uppercase, lowercase, and special character"
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
              Provision Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
