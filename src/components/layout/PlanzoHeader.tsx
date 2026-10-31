'use client';
import React, { useState } from 'react';
import { useData, NavigationPage } from '../../context/DataContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
}

const PAGE_NAMES: Record<NavigationPage, string> = {
  overview: 'Executive Overview',
  customers: 'Customer Accounts',
  'products-and-plans': 'Products & Plans',
  quotations: 'Quotations',
  subscriptions: 'Subscriptions',
  'recurring-engine': 'Recurring Engine',
  invoices: 'Invoices',
  payments: 'Payments',
  'reports-and-analytics': 'Reports & Analytics',
  'audit-log': 'Audit Log',
  settings: 'Settings',
  'help-and-documentation': 'Documentation'
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const {
    currentPage,
    currency,
    setCurrency,
    setIsSearchModalOpen,
    setIsNewSubModalOpen,
    notifications,
    markAllNotificationsRead,
    dismissNotification
  } = useData();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="fixed top-0 left-0 lg:left-[260px] right-0 h-16 bg-[#090e19]/80 backdrop-blur-md border-b border-[#94a3b8]/15 z-40 flex items-center justify-between px-4 sm:px-6">
      {/* Left section: Mobile toggle & Breadcrumb & Search */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#bdc8d1] hover:text-white hover:bg-[#1b1f2b] transition-colors"
          aria-label="Open navigation menu"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 text-xs text-[#87929a]">
          <span className="hover:text-[#dee2f2] cursor-pointer">Platform</span>
          <span>/</span>
          <span className="hover:text-[#dee2f2] cursor-pointer">Billing Core</span>
          <span>/</span>
          <span className="text-[#38bdf8] font-medium">{PAGE_NAMES[currentPage]}</span>
        </div>

        {/* Quick Search Button */}
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b27]/80 hover:bg-[#1b1f2b] text-[#bdc8d1] hover:text-[#dee2f2] text-xs transition-colors border border-[#94a3b8]/10 shadow-inner"
        >
          <span className="material-symbols-outlined text-[16px] text-[#87929a]">search</span>
          <span className="hidden sm:inline">Search accounts, invoices, telemetry...</span>
          <span className="sm:hidden">Search...</span>
          <span className="px-1.5 py-0.5 rounded bg-[#252a36] text-[#87929a] font-mono text-[10px]">
            ⌘K
          </span>
        </button>
      </div>

      {/* Right section: System Telemetry, Currency, New Subscription, Notifs, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Production Cluster status */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161b27] border border-[#94a3b8]/15">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ee6aa] animate-pulse shadow-[0_0_6px_rgba(78,230,170,0.8)]" />
          <span className="font-mono text-[11px] text-[#bdc8d1] tracking-wider uppercase">
            PROD • US-EAST-1 • LIVE
          </span>
        </div>

        {/* Currency Switcher */}
        <div className="relative inline-flex items-center">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="appearance-none bg-[#161b27] border border-[#94a3b8]/15 hover:border-[#38bdf8]/40 text-[#dee2f2] text-xs font-mono rounded-lg pl-2.5 pr-6 py-1.5 cursor-pointer outline-none transition-colors"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
          </select>
          <span className="material-symbols-outlined pointer-events-none absolute right-1 text-[#87929a] text-[16px]">
            arrow_drop_down
          </span>
        </div>

        {/* Action: + New Subscription */}
        <button
          onClick={() => setIsNewSubModalOpen(true)}
          className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-[#38bdf8] text-[#00354a] text-xs font-semibold hover:bg-[#8ed5ff] transition-all shadow-[0_0_14px_rgba(56,189,248,0.3)] active:scale-95"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          <span className="hidden sm:inline">New Subscription</span>
          <span className="sm:hidden">New</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg bg-[#161b27] hover:bg-[#1b1f2b] text-[#bdc8d1] hover:text-[#dee2f2] transition-colors border border-[#94a3b8]/10"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[18px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38bdf8] shadow-[0_0_8px_rgba(56,189,248,0.9)]" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0e131e]/95 backdrop-blur-2xl border border-[#94a3b8]/25 shadow-2xl p-4 z-50 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#94a3b8]/15">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#38bdf8]">
                    Alerts & Telemetry
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#38bdf8]/15 text-[#38bdf8]">
                    {notifications.length}
                  </span>
                </div>
                <button
                  onClick={markAllNotificationsRead}
                  className="text-[11px] text-[#87929a] hover:text-[#38bdf8] transition-colors"
                >
                  Mark read
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-lg border transition-colors flex items-start justify-between gap-2 ${
                      notif.unread
                        ? 'bg-[#1b1f2b] border-[#38bdf8]/30'
                        : 'bg-[#161b27]/60 border-transparent hover:border-[#94a3b8]/15'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${
                          notif.type === 'warning'
                            ? 'bg-[#fbbf24]'
                            : notif.type === 'success'
                            ? 'bg-[#4ee6aa]'
                            : 'bg-[#38bdf8]'
                        }`}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-[#dee2f2]">
                          {notif.title}
                        </span>
                        <span className="text-[11px] text-[#87929a] mt-0.5 leading-snug">
                          {notif.description}
                        </span>
                        <span className="text-[10px] font-mono text-[#87929a] mt-1">
                          {notif.time}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      className="text-[#87929a] hover:text-[#dee2f2] p-1"
                      title="Dismiss"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-[#1b1f2b] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#818cf8] flex items-center justify-center text-white text-xs font-semibold shadow-sm">
              EV
            </div>
            <span className="material-symbols-outlined text-[#87929a] text-[16px]">
              expand_more
            </span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0e131e]/95 backdrop-blur-2xl border border-[#94a3b8]/25 shadow-2xl p-2 z-50 flex flex-col gap-1">
              <div className="px-3 py-2 border-b border-[#94a3b8]/15 flex flex-col">
                <span className="text-xs font-semibold text-[#dee2f2]">Elena Vance</span>
                <span className="text-[11px] text-[#87929a]">amalshajimichael@gmail.com</span>
                <span className="text-[10px] font-mono text-[#38bdf8] mt-1">Role: Financial Admin</span>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setIsNewSubModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#1b1f2b] transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px]">add_card</span>
                New Subscription
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setIsSearchModalOpen(true);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-[#bdc8d1] hover:text-[#dee2f2] hover:bg-[#1b1f2b] transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Command Palette (⌘K)
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
