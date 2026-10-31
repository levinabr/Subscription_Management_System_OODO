"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "@prisma/client";
import { LogOut } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";

interface HeaderProps {
  userName: string;
  userEmail: string;
  role: UserRole;
  companyName?: string | null;
}

export function Header({ userName, userEmail, role, companyName }: HeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-slate-800">
          {companyName ? `${companyName} · ` : ""}
          <span className="text-slate-500 font-normal">Subscription Management</span>
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* User Pill */}
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/60 flex items-center justify-center text-indigo-700 font-semibold text-xs shadow-xs">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight">
              {userName}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight">
              {userEmail}
            </div>
          </div>
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

        {/* Logout action */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          isLoading={isLoggingOut}
          className="text-slate-600 hover:text-rose-600 hover:border-rose-300"
          title="Sign out of your account"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Sign out</span>
        </Button>
      </div>
    </header>
  );
}
