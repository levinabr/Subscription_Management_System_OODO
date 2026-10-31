"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import {
  LayoutDashboard,
  Package,
  CalendarCheck,
  Receipt,
  UserCheck,
  Percent,
  FileText,
  Building2,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/format";
import { Badge } from "../ui/Badge";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles?: UserRole[];
  badge?: string;
}

const internalNav: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    name: "Products & Catalog",
    href: "/catalog/products",
    icon: Package,
    roles: [UserRole.ADMIN],
  },
  {
    name: "Subscription Plans",
    href: "/catalog/plans",
    icon: CalendarCheck,
    roles: [UserRole.ADMIN],
  },
  {
    name: "Tax Rules",
    href: "/catalog/taxes",
    icon: Percent,
    roles: [UserRole.ADMIN],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Building2,
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    name: "Staff Accounts",
    href: "/staff",
    icon: UserCheck,
    roles: [UserRole.ADMIN],
  },
  {
    name: "Subscriptions",
    href: "/subscriptions",
    icon: FileText,
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
  {
    name: "Invoices & Billing",
    href: "/invoices",
    icon: Receipt,
    roles: [UserRole.ADMIN, UserRole.STAFF],
  },
];

const customerNav: NavItem[] = [
  {
    name: "Overview",
    href: "/portal/dashboard",
    icon: LayoutDashboard,
    roles: [UserRole.CUSTOMER],
  },
  {
    name: "My Subscriptions",
    href: "/portal/subscriptions",
    icon: CalendarCheck,
    roles: [UserRole.CUSTOMER],
  },
  {
    name: "Invoices & Receipts",
    href: "/portal/invoices",
    icon: Receipt,
    roles: [UserRole.CUSTOMER],
  },
];

interface SidebarProps {
  role: UserRole;
  userEmail: string;
}

export function Sidebar({ role, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const items = role === UserRole.CUSTOMER ? customerNav : internalNav;

  return (
    <aside className="w-64 shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col min-h-screen text-slate-300">
      {/* Brand Logo & System Identifier */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-white tracking-tight text-base">
            PLANZO
          </span>
          <span className="block text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
            Control Center
          </span>
        </div>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 py-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Workspace
          </span>
          <Badge
            variant={
              role === UserRole.ADMIN
                ? "purple"
                : role === UserRole.STAFF
                ? "primary"
                : "success"
            }
            size="sm"
          >
            {role}
          </Badge>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] bg-indigo-500/30 text-indigo-200 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer User Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <p className="text-xs font-medium text-slate-300 truncate">{userEmail}</p>
        <p className="text-[11px] text-slate-500 capitalize">{role.toLowerCase()} Account</p>
      </div>
    </aside>
  );
}
