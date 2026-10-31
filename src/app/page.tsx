import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { Sparkles, ArrowRight, ShieldCheck, Database, Layers } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  if (user) {
    if (user.role === UserRole.CUSTOMER) {
      redirect("/portal/dashboard");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">
            Brightloop
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button>
              Register Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>Make-A-Ton 9.0 · Production Foundation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Brightloop{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-200">
            Subscription Control Center
          </span>
        </h1>

        <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
          The unified engine for recurring contracts, multi-tier product catalog, basis-point tax rules, payment recording, and enterprise multi-tenant billing.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <Link href="/login">
            <Button size="lg" className="px-8 shadow-lg shadow-indigo-600/30">
              Launch Control Center
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800">
              Customer Registration
            </Button>
          </Link>
        </div>

        {/* Technical Architecture Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left w-full border-t border-slate-800/80 mt-12">
          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white text-sm">PostgreSQL & Prisma</h3>
            <p className="text-xs text-slate-400">
              Integer paise financial precision, snapshot integrity on contract lines, and robust relational indexing.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white text-sm">Strict RBAC & Multi-Tenant</h3>
            <p className="text-xs text-slate-400">
              Admin, Staff, and Customer boundary isolation with cryptographically hashed opaque session tokens.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <Layers className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white text-sm">Modular Foundation</h3>
            <p className="text-xs text-slate-400">
              Shared schema and validated API contracts coordinated for parallel multi-developer hackathon feature branches.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-6 text-center text-xs text-slate-500">
        Brightloop Software © 2026 · Foundation Architecture by Amal Shaji Michael
      </footer>
    </div>
  );
}
