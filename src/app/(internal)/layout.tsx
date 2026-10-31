import React from 'react';
import Link from 'next/link';

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navigation Bar */}
      <header className="no-print bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/billing" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
              <span className="bg-indigo-600 text-white rounded-md p-1.5 text-sm font-black">BL</span>
              Brightloop
            </Link>
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                href="/invoices"
                className="px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Invoices
              </Link>
              <Link
                href="/billing"
                className="px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Recurring Billing
              </Link>
              <Link
                href="/discounts"
                className="px-3 py-2 rounded-md hover:text-slate-900 hover:bg-slate-100 transition-colors"
              >
                Discount Rules
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
              Admin Mode
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
