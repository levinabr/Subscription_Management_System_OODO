import './globals.css';
import Link from 'next/link';
import { LayoutDashboard, FileText, CreditCard, ShieldCheck, UserCheck } from 'lucide-react';

export const metadata = {
  title: 'Brightloop — Subscription Control Center',
  description: 'Manage subscriptions, invoices, payment recording, and financial visibility.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                  B
                </div>
                <div>
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">Brightloop</span>
                  <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                    Control Center
                  </span>
                </div>
              </Link>

              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Finance Dashboard
                </Link>
                <Link
                  href="/invoices"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition"
                >
                  <FileText className="w-4 h-4" />
                  Invoices
                </Link>
                <Link
                  href="/payments"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:text-emerald-600 hover:bg-slate-50 transition"
                >
                  <CreditCard className="w-4 h-4" />
                  Payments
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Staff Portal
              </div>

              <Link
                href="/portal/invoices"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg border border-slate-300 transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                Customer Portal Switcher
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            Brightloop Software — Recurring Revenue, Payment Recording & Financial Visibility Platform.
          </div>
        </footer>
      </body>
    </html>
  );
}
