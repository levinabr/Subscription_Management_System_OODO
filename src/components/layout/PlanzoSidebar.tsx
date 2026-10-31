'use client';
import React from 'react';
import { useData, NavigationPage } from '../../context/DataContext';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const { currentPage, setCurrentPage, subscriptions, invoices, stagedBilling } = useData();

  const dueCount = stagedBilling.filter(s => s.state !== 'Excluded').length;
  const overdueCount = subscriptions.filter(s => s.status === 'past_due').length;

  const navGroups: NavGroup[] = [
    {
      label: 'GENERAL',
      items: [
        { id: 'overview', label: 'Overview', icon: 'dashboard' },
        { id: 'customers', label: 'Customers', icon: 'group' },
        { id: 'products-and-plans', label: 'Products & Plans', icon: 'inventory_2' },
        { id: 'quotations', label: 'Quotations', icon: 'request_quote' },
      ],
    },
    {
      label: 'BILLING & REVENUE',
      items: [
        { id: 'subscriptions', label: 'Subscriptions', icon: 'autorenew', badge: overdueCount > 0 ? `${overdueCount}` : undefined },
        { id: 'recurring-engine', label: 'Recurring Engine', icon: 'sync_alt', badge: dueCount > 0 ? `${dueCount}` : undefined },
        { id: 'invoices', label: 'Invoices', icon: 'receipt_long' },
        { id: 'payments', label: 'Payments', icon: 'payments' },
      ],
    },
    {
      label: 'INSIGHTS',
      items: [
        { id: 'reports-and-analytics', label: 'Reports & Analytics', icon: 'insights' },
        { id: 'audit-log', label: 'Audit Log', icon: 'verified_user' },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'settings', label: 'Settings', icon: 'settings' },
        { id: 'help-and-documentation', label: 'Help & Documentation', icon: 'menu_book' },
      ],
    },
  ];

  const handleNavClick = (pageId: NavigationPage) => {
    setCurrentPage(pageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-[#0B1220]/95 backdrop-blur-xl border-r border-[#94a3b8]/15 z-50 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-[calc(100%-80px)]">
          {/* Header & Logo */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-[#94a3b8]/15 bg-[#090e19]/40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#38bdf8] to-[#2f3aa3] flex items-center justify-center shadow-[0_0_12px_rgba(56,189,248,0.35)]">
                <span className="material-symbols-outlined text-white text-[18px]">account_balance</span>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-[16px] tracking-tight text-[#dee2f2]">PLANZO</span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#38bdf8]">
                  FINANCE SUITE
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#87929a] hover:text-[#dee2f2] hover:bg-[#1b1f2b]"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* Nav items scrollable area */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-6">
            {navGroups.map((group) => (
              <div key={group.label} className="flex flex-col gap-1">
                <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#87929a]">
                  {group.label}
                </span>
                {group.items.map((item) => {
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[13px] font-medium transition-colors text-left ${
                        isActive
                          ? 'bg-[#252a36] text-[#38bdf8] shadow-sm'
                          : 'text-[#bdc8d1] hover:bg-[#1b1f2b] hover:text-[#dee2f2]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-[#38bdf8]' : 'text-[#87929a]'}`}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          item.id === 'subscriptions' && overdueCount > 0
                            ? 'bg-[#93000a]/40 text-[#ffb4ab]'
                            : 'bg-[#38bdf8]/15 text-[#38bdf8]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-[#94a3b8]/15 bg-[#090e19]/90">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-[#161b27]/70 hover:bg-[#1b1f2b] transition-colors">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#818cf8] flex items-center justify-center text-white text-xs font-semibold">
                EV
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4ee6aa] ring-2 ring-[#0B1220] shadow-[0_0_8px_rgba(78,230,170,0.6)]" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-medium text-[#dee2f2] truncate">Elena Vance</span>
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8]">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-[#87929a] truncate">VP Financial Ops</span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-mono text-[#4ee6aa]">Live Sync</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
