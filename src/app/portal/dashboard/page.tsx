import React from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Building2, CalendarCheck, Receipt, ShieldCheck } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const user = await getCurrentUser();

  const customer: any = user?.customerId
    ? await prisma.customer.findUnique({
        where: { id: user.customerId },
        include: {
          subscriptions: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
          invoices: {
            take: 5,
            orderBy: { createdAt: "desc" },
          },
        },
      })
    : null;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-md border border-slate-800">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Customer Portal · Verified Account</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {customer?.companyName || customer?.company || customer?.name || "Organization Dashboard"}
          </h2>
          <p className="text-sm text-slate-300">
            Manage your active subscriptions, review billing runs, and access tax invoices.
          </p>
        </div>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Account Status
            </CardTitle>
            <Building2 className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                {customer?.companyName || customer?.company || customer?.name}
              </span>
              <Badge variant="success" size="sm">
                Active
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Primary: {customer?.contactName || customer?.name} ({customer?.email})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Active Subscriptions
            </CardTitle>
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {customer?.subscriptions.length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Contracted billing subscriptions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Tax ID / GSTIN
            </CardTitle>
            <Receipt className="w-4 h-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono font-semibold text-slate-900">
              {customer?.taxIdentifier || customer?.taxId || "Not registered"}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Applied automatically to invoice lines
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overview tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>My Subscriptions</CardTitle>
            <CardDescription>
              Current contracted plans and billing cycles
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer?.subscriptions.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No active subscriptions found for this account.
              </p>
            ) : (
              <div className="space-y-3">
                {customer?.subscriptions.map((s: any) => (
                  <div
                    key={s.id}
                    className="p-3 border rounded-lg border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {s.planSnapshotName || s.planNameSnapshot || "Subscription"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {s.subscriptionNo} · {s.planSnapshotBillingInterval || s.billingInterval}
                      </div>
                    </div>
                    <Badge variant="primary" size="sm">
                      {s.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Issued invoices and payment receipts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {customer?.invoices.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                No invoices have been issued yet.
              </p>
            ) : (
              <div className="space-y-3">
                {customer?.invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className="p-3 border rounded-lg border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {inv.invoiceNo}
                      </div>
                      <div className="text-xs text-slate-400">
                        Due: {formatDate(inv.dueDate || inv.dueAt)}
                      </div>
                    </div>
                    <Badge variant="neutral" size="sm">
                      {inv.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
