import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPaise, formatBasisPoints } from "@/lib/utils/format";
import {
  Package,
  CalendarCheck,
  Percent,
  Building2,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [
    customerCount,
    productCount,
    planCount,
    taxCount,
    recentProducts,
    recentPlans,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.product.count({ where: { active: true } }),
    prisma.plan.count({ where: { active: true } }),
    prisma.taxRule.count({ where: { active: true } }),
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { variants: true, taxRule: true },
    }),
    prisma.plan.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: { taxRule: true },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role: {user?.role}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-sm text-slate-300">
            Brightloop Subscription Control Center is active. Catalog configuration, customer isolation, and RBAC policies are enforced across all operations.
          </p>
        </div>
      </div>

      {/* KPI metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Active Products
            </CardTitle>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{productCount}</div>
            <p className="text-xs text-slate-500 mt-1">Catalog items ready for sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Subscription Plans
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{planCount}</div>
            <p className="text-xs text-slate-500 mt-1">Active recurring cadences</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Tax Rules
            </CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{taxCount}</div>
            <p className="text-xs text-slate-500 mt-1">Configured basis-point rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-slate-500">
              Customers
            </CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{customerCount}</div>
            <p className="text-xs text-slate-500 mt-1">Registered business accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Catalog Products</CardTitle>
              <CardDescription>Recently configured products in catalog</CardDescription>
            </div>
            {user?.role === UserRole.ADMIN && (
              <Link href="/catalog/products">
                <Button variant="outline" size="sm">
                  Manage Catalog
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentProducts.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No products in catalog yet.
                </p>
              ) : (
                recentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        SKU: {p.sku} · {p.productType} · {p.variants.length} variant(s)
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {formatPaise(p.salesPrice)}
                      </div>
                      <Badge variant={p.active ? "success" : "neutral"} size="sm">
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plans overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Available recurring billing intervals</CardDescription>
            </div>
            {user?.role === UserRole.ADMIN && (
              <Link href="/catalog/plans">
                <Button variant="outline" size="sm">
                  Manage Plans
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPlans.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  No plans configured yet.
                </p>
              ) : (
                recentPlans.map((pl) => (
                  <div
                    key={pl.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-sm text-slate-900">
                        {pl.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Code: {pl.code} · {pl.billingInterval}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">
                        {formatPaise(pl.basePrice)}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        /{pl.billingInterval.toLowerCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
