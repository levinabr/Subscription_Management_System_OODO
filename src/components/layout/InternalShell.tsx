import React from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AuthenticatedUser } from "@/lib/auth/session";

interface InternalShellProps {
  user: AuthenticatedUser;
  children: React.ReactNode;
}

export function InternalShell({ user, children }: InternalShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar role={user.role} userEmail={user.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={user.name}
          userEmail={user.email}
          role={user.role}
          companyName={user.customer?.companyName}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
}
