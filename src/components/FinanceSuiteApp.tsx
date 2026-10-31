'use client';

import React, { useState } from 'react';
import { DataProvider, useData } from '@/context/DataContext';
import { Sidebar } from '@/components/layout/PlanzoSidebar';
import { Header } from '@/components/layout/PlanzoHeader';

import { OverviewView } from '@/components/views/OverviewView';
import { CustomersView } from '@/components/views/CustomersView';
import { ProductsPlansView } from '@/components/views/ProductsPlansView';
import { QuotationsView } from '@/components/views/QuotationsView';
import { SubscriptionsView } from '@/components/views/SubscriptionsView';
import { RecurringEngineView } from '@/components/views/RecurringEngineView';
import { InvoicesView } from '@/components/views/InvoicesView';
import { PaymentsView } from '@/components/views/PaymentsView';
import { ReportsView } from '@/components/views/ReportsView';
import { AuditLogView } from '@/components/views/AuditLogView';
import { SettingsView } from '@/components/views/SettingsView';
import { HelpDocsView } from '@/components/views/HelpDocsView';

import { InvoiceDetailModal } from '@/components/modals/InvoiceDetailModal';
import { NewSubscriptionModal } from '@/components/modals/NewSubscriptionModal';
import { AddCustomerModal } from '@/components/modals/AddCustomerModal';
import { BulkSubscriptionModal } from '@/components/modals/BulkSubscriptionModal';
import { CommandPalette } from '@/components/modals/CommandPalette';

const MainContent: React.FC = () => {
  const { currentPage } = useData();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderCurrentView = () => {
    switch (currentPage) {
      case 'overview':
        return <OverviewView />;
      case 'customers':
        return <CustomersView />;
      case 'products-and-plans':
        return <ProductsPlansView />;
      case 'quotations':
        return <QuotationsView />;
      case 'subscriptions':
        return <SubscriptionsView />;
      case 'recurring-engine':
        return <RecurringEngineView />;
      case 'invoices':
        return <InvoicesView />;
      case 'payments':
        return <PaymentsView />;
      case 'reports-and-analytics':
        return <ReportsView />;
      case 'audit-log':
        return <AuditLogView />;
      case 'settings':
        return <SettingsView />;
      case 'help-and-documentation':
        return <HelpDocsView />;
      default:
        return <OverviewView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#080D18] text-[#dee2f2] relative antialiased selection:bg-[#38bdf8] selection:text-[#00354a]">
      {/* Ambient background directional glow */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(56,189,248,0.08),transparent_70%)]" />

      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="lg:pl-[260px] relative z-10 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Content Container */}
        <main className="flex-1 w-full pt-20 px-4 sm:px-8 max-w-7xl mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <InvoiceDetailModal />
      <NewSubscriptionModal />
      <AddCustomerModal />
      <BulkSubscriptionModal />
      <CommandPalette />
    </div>
  );
};

export default function FinanceSuiteApp() {
  return (
    <DataProvider>
      <MainContent />
    </DataProvider>
  );
}

