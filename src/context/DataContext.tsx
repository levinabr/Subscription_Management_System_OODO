'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Customer,
  Subscription,
  StagedBillingItem,
  Invoice,
  PaymentTransaction,
  Plan,
  Product,
  Quotation,
  BillingRunLog,
  AuditEvent
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_SUBSCRIPTIONS,
  INITIAL_STAGED_BILLING,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_PLANS,
  INITIAL_PRODUCTS,
  INITIAL_QUOTATIONS,
  INITIAL_BILLING_LOGS,
  INITIAL_AUDIT_EVENTS
} from '../data/mockData';

export type NavigationPage =
  | 'overview'
  | 'customers'
  | 'products-and-plans'
  | 'quotations'
  | 'subscriptions'
  | 'recurring-engine'
  | 'invoices'
  | 'payments'
  | 'reports-and-analytics'
  | 'audit-log'
  | 'settings'
  | 'help-and-documentation';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  unread: boolean;
}

interface DataContextType {
  currentPage: NavigationPage;
  setCurrentPage: (page: NavigationPage) => void;
  currency: string;
  setCurrency: (c: string) => void;

  customers: Customer[];
  addCustomer: (cust: Omit<Customer, 'id' | 'avatarInitials' | 'joinedDate' | 'outstandingBalance' | 'lifetimeValue' | 'currentArr'>) => Promise<Customer> | Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  selectedCustomerId: string;
  setSelectedCustomerId: (id: string) => void;

  subscriptions: Subscription[];
  addSubscription: (sub: Omit<Subscription, 'id' | 'startedDate' | 'tokenRef'>) => Promise<Subscription> | Subscription;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  pauseSubscription: (id: string) => void;
  resumeSubscription: (id: string) => void;
  cancelSubscription: (id: string) => void;
  upgradeSubscription: (id: string, newPlanName: string, newMrr: number, newSeats: number) => void;
  bulkUpdateSubscriptions: (operation: 'pause' | 'resume') => void;
  issueCreditNote: (customerId: string, amount: number) => void;
  selectedSubId: string;
  setSelectedSubId: (id: string) => void;

  stagedBilling: StagedBillingItem[];
  excludeStagedItem: (id: string) => void;
  recalculateProration: (id: string) => void;
  executeBatchBillingRun: (isDryRun: boolean) => Promise<{ success: boolean; count: number; total: number; message: string }>;

  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber'>) => Invoice;
  payInvoice: (id: string) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (inv: Invoice | null) => void;

  payments: PaymentTransaction[];
  recordPayment: (payment: { invoiceNumber: string; amount: number; method: string; customerName: string; invoiceId?: string }) => Promise<void> | void;

  plans: Plan[];
  addPlan: (p: Omit<Plan, 'id'>) => void;

  products: Product[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt'>) => void;

  quotations: Quotation[];
  addQuotation: (q: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>) => Quotation;
  convertQuotationToSubscription: (quoteId: string) => void;

  billingLogs: BillingRunLog[];
  auditEvents: AuditEvent[];

  notifications: NotificationItem[];
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;

  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // New Subscription modal
  isNewSubModalOpen: boolean;
  setIsNewSubModalOpen: (open: boolean) => void;

  // Add Customer modal
  isAddCustomerModalOpen: boolean;
  setIsAddCustomerModalOpen: (open: boolean) => void;

  // Record Payment modal
  isRecordPaymentModalOpen: boolean;
  setIsRecordPaymentModalOpen: (open: boolean) => void;

  // Bulk Subscriptions modal
  isBulkSubModalOpen: boolean;
  setIsBulkSubModalOpen: (open: boolean) => void;

  // Export utility
  exportDataToCsv: (filename: string, rows: object[]) => void;
}

const DataContext = createContext<DataContextType | null>(null);

function saveStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}


function mapDbCustomerToUi(dbCust: any): Customer {
  const name = dbCust.contactName || dbCust.name || dbCust.companyName || 'Valued Customer';
  const company = dbCust.companyName || dbCust.company || name;
  const initials = (name || company)
    .split(' ')
    .filter(Boolean)
    .map((w: string) => w[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'CU';

  return {
    id: dbCust.id,
    name: name,
    email: dbCust.email,
    company: company,
    avatarInitials: initials,
    status: dbCust.active === false ? 'paused' : 'active',
    tier: 'Enterprise',
    plansCount: dbCust._count?.subscriptions || dbCust.subscriptions?.length || 1,
    primaryPlan: 'Enterprise Core',
    outstandingBalance: 0,
    lifetimeValue: 12000,
    currentArr: 14400,
    joinedDate: new Date(dbCust.createdAt || Date.now()).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    }),
    taxId: dbCust.taxIdentifier || '12-3456789',
    currency: 'USD ($)',
    location: dbCust.city ? `${dbCust.city}, ${dbCust.country || 'IN'}` : 'San Francisco, CA',
    paymentMethod: {
      type: 'visa',
      last4: '4242',
      expiry: '12/28',
      verified: true,
      name: 'Corporate Card',
    },
  };
}

function mapDbSubscriptionToUi(dbSub: any): Subscription {
  const num = dbSub.subscriptionNo || `#SUB-${Math.floor(1000 + Math.random() * 9000)}`;
  const custName = dbSub.customer?.companyName || dbSub.customer?.name || 'Enterprise Client';
  const initials = custName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() || 'SB';
  const mrrVal = dbSub.totalPaise ? Math.round(dbSub.totalPaise / 100) : 1200;

  return {
    id: num,
    customerId: dbSub.customerId || `cust_${dbSub.id}`,
    customerName: custName,
    customerEmail: dbSub.customer?.email || 'billing@enterprise.com',
    customerInitials: initials,
    planName: dbSub.plan?.name || 'Enterprise Scale',
    planTier: 'Enterprise',
    seats: 25,
    maxSeats: 50,
    addons: ['Dedicated IP', 'Audit Logs'],
    mrr: mrrVal,
    billingCycle: 'monthly',
    status: dbSub.status?.toLowerCase() === 'active' ? 'active' : dbSub.status?.toLowerCase() === 'past_due' ? 'past_due' : 'active',
    health: 'Healthy',
    renewalDate: dbSub.currentPeriodEnd ? new Date(dbSub.currentPeriodEnd).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Nov 30, 2026',
    renewalDaysLeft: 30,
    startedDate: dbSub.startDate ? new Date(dbSub.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Jan 01, 2026',
    clearinghouse: 'Stripe US-ACQ',
    tokenRef: `tok_live_${Math.random().toString(36).substring(2, 8)}`,
  };
}

function mapDbInvoiceToUi(dbInv: any): Invoice {
  const num = dbInv.invoiceNo ? `INV-${dbInv.invoiceNo}` : `INV-2024-${Math.floor(9000 + Math.random() * 900)}`;
  const custName = dbInv.customer?.companyName || dbInv.customer?.name || 'Customer Account';
  const initials = custName.split(' ').filter(Boolean).map((w: string) => w[0]).join('').substring(0, 2).toUpperCase() || 'IN';
  const amt = dbInv.totalPaise ? dbInv.totalPaise / 100 : 1200;

  return {
    id: dbInv.id,
    invoiceNumber: num,
    customerId: dbInv.customerId,
    customerName: custName,
    customerInitials: initials,
    customerEmail: dbInv.customer?.email || 'billing@customer.com',
    customerTaxId: '12-9481920',
    customerAddress: 'San Francisco, CA',
    subId: dbInv.subscriptionId || '#SUB-4920',
    issueDate: dbInv.issuedAt ? new Date(dbInv.issuedAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Nov 01, 2026',
    dueDate: dbInv.dueAt ? new Date(dbInv.dueAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Nov 15, 2026',
    amount: amt,
    subtotal: dbInv.subtotalPaise ? dbInv.subtotalPaise / 100 : amt,
    taxAmount: dbInv.taxPaise ? dbInv.taxPaise / 100 : 0,
    discountAmount: dbInv.discountPaise ? dbInv.discountPaise / 100 : 0,
    status: dbInv.status?.toLowerCase() === 'paid' ? 'paid' : dbInv.status?.toLowerCase() === 'processing' ? 'processing' : 'draft',
    lineItems: [
      {
        description: 'Enterprise Platform Subscription',
        quantity: 1,
        unitPrice: amt,
        total: amt,
      },
    ],
  };
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('overview');
  const [currency, setCurrency] = useState<string>('USD');

  // Stored state with local storage persistence
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(INITIAL_SUBSCRIPTIONS);
  const [stagedBilling, setStagedBilling] = useState<StagedBillingItem[]>(INITIAL_STAGED_BILLING);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [payments, setPayments] = useState<PaymentTransaction[]>(INITIAL_PAYMENTS);
  const [plans, setPlans] = useState<Plan[]>(INITIAL_PLANS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [billingLogs, setBillingLogs] = useState<BillingRunLog[]>(INITIAL_BILLING_LOGS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(INITIAL_AUDIT_EVENTS);

  // Load from local storage and dynamic PostgreSQL APIs on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const c = localStorage.getItem('planzo_customers');
      if (c) setCustomers(JSON.parse(c));
      const s = localStorage.getItem('planzo_subscriptions');
      if (s) setSubscriptions(JSON.parse(s));
      const sb = localStorage.getItem('planzo_staged_billing');
      if (sb) setStagedBilling(JSON.parse(sb));
      const inv = localStorage.getItem('planzo_invoices');
      if (inv) setInvoices(JSON.parse(inv));
      const pay = localStorage.getItem('planzo_payments');
      if (pay) setPayments(JSON.parse(pay));
      const pl = localStorage.getItem('planzo_plans');
      if (pl) setPlans(JSON.parse(pl));
      const pr = localStorage.getItem('planzo_products');
      if (pr) setProducts(JSON.parse(pr));
      const q = localStorage.getItem('planzo_quotations');
      if (q) setQuotations(JSON.parse(q));
      const bl = localStorage.getItem('planzo_billing_logs');
      if (bl) setBillingLogs(JSON.parse(bl));
      const ae = localStorage.getItem('planzo_audit_events');
      if (ae) setAuditEvents(JSON.parse(ae));
    } catch (e) {
      console.error('Failed to parse cached local data', e);
    }

    // Dynamic Live Data Synchronization with PostgreSQL Backend
    async function syncBackendData() {
      try {
        // Fetch Customers from API
        const custRes = await fetch('/api/customers');
        if (custRes.ok) {
          const custJson = await custRes.json();
          const dbCusts = custJson.data || custJson.customers || [];
          if (Array.isArray(dbCusts) && dbCusts.length > 0) {
            setCustomers(prev => {
              const mapped = dbCusts.map(mapDbCustomerToUi);
              const mappedIds = new Set(mapped.map((m: Customer) => m.id));
              const remaining = prev.filter(p => !mappedIds.has(p.id));
              return [...mapped, ...remaining];
            });
          }
        }

        // Fetch Subscriptions from API
        const subRes = await fetch('/api/subscriptions');
        if (subRes.ok) {
          const subJson = await subRes.json();
          const items = subJson.data?.items || subJson.data || [];
          if (Array.isArray(items) && items.length > 0) {
            setSubscriptions(prev => {
              const mapped = items.map(mapDbSubscriptionToUi);
              const mappedIds = new Set(mapped.map((m: Subscription) => m.id));
              const remaining = prev.filter(p => !mappedIds.has(p.id));
              return [...mapped, ...remaining];
            });
          }
        }

        // Fetch Invoices from API
        const invRes = await fetch('/api/invoices');
        if (invRes.ok) {
          const invJson = await invRes.json();
          const invItems = invJson.data || [];
          if (Array.isArray(invItems) && invItems.length > 0) {
            setInvoices(prev => {
              const mapped = invItems.map(mapDbInvoiceToUi);
              const mappedIds = new Set(mapped.map((m: Invoice) => m.id));
              const remaining = prev.filter(p => !mappedIds.has(p.id));
              return [...mapped, ...remaining];
            });
          }
        }
      } catch (err) {
        console.warn('Live API sync fallback to local/cached data:', err);
      }
    }

    syncBackendData();
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif_1',
      title: 'Run #8493 - 3 Accounts in Grace',
      description: 'Expiring card limits detected on custom overage contracts.',
      time: '12m ago',
      type: 'warning',
      unread: true
    },
    {
      id: 'notif_2',
      title: 'Batch Billing Sweep Complete',
      description: 'Run #2024-10A ($318,420.00) settled with 0 discrepancies.',
      time: '1h ago',
      type: 'success',
      unread: true
    },
    {
      id: 'notif_3',
      title: 'TaxJar Nexus Rate Update',
      description: 'Automated sales tax rate recalculations updated for US-CA and US-NY.',
      time: '3h ago',
      type: 'info',
      unread: false
    }
  ]);

  // Selected drawers & modals
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_lin_94982a17f');
  const [selectedSubId, setSelectedSubId] = useState<string>('#SUB-4920');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isNewSubModalOpen, setIsNewSubModalOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isBulkSubModalOpen, setIsBulkSubModalOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    saveStored('planzo_customers', customers);
  }, [customers]);

  useEffect(() => {
    saveStored('planzo_subscriptions', subscriptions);
  }, [subscriptions]);

  useEffect(() => {
    saveStored('planzo_staged_billing', stagedBilling);
  }, [stagedBilling]);

  useEffect(() => {
    saveStored('planzo_invoices', invoices);
  }, [invoices]);

  useEffect(() => {
    saveStored('planzo_payments', payments);
  }, [payments]);

  // Customer actions
  const addCustomer = async (custData: Omit<Customer, 'id' | 'avatarInitials' | 'joinedDate' | 'outstandingBalance' | 'lifetimeValue' | 'currentArr'>): Promise<Customer> => {
    let newCustomer: Customer;

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: custData.company || custData.name,
          contactName: custData.name,
          email: custData.email.toLowerCase().trim(),
          phone: '+91 98765 43210',
          address: custData.location,
          country: 'IN',
          taxIdentifier: custData.taxId || undefined,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        const errObj = resJson.error || {};
        const fieldErrors: Record<string, string> = {};
        if (errObj.details) {
          for (const [key, msgs] of Object.entries(errObj.details)) {
            if (Array.isArray(msgs)) fieldErrors[key] = (msgs as string[])[0];
          }
        }
        if (errObj.code === 'DUPLICATE_ENTRY' || errObj.message?.toLowerCase().includes('already exists')) {
          fieldErrors.email = errObj.message || 'A customer with this email already exists.';
        }
        const error: any = new Error(errObj.message || 'Failed to create customer');
        error.fieldErrors = fieldErrors;
        throw error;
      }

      newCustomer = {
        ...mapDbCustomerToUi(resJson.data),
        tier: custData.tier || 'Enterprise',
        primaryPlan: custData.primaryPlan || 'Enterprise Core',
        paymentMethod: custData.paymentMethod,
        currency: custData.currency || 'USD ($)',
      };
    } catch (err: any) {
      if (err.fieldErrors || err.message?.includes('already exists') || err.message?.includes('Invalid request data') || err.message?.includes('DUPLICATE')) {
        throw err;
      }
      console.warn('API error, falling back to local creation:', err);
      const initials = custData.name
        .split(' ')
        .filter(Boolean)
        .map(n => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'CU';

      newCustomer = {
        ...custData,
        id: `cust_${Date.now().toString(36)}`,
        avatarInitials: initials,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        outstandingBalance: 0,
        lifetimeValue: 0,
        currentArr: 0
      };
    }

    setCustomers(prev => [newCustomer, ...prev]);
    setSelectedCustomerId(newCustomer.id);

    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'CUSTOMER_CREATED',
      target: `${newCustomer.name} (${newCustomer.id})`,
      category: 'SUBSCRIPTION',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);

    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
  };

  // Subscription actions
  const addSubscription = async (subData: Omit<Subscription, 'id' | 'startedDate' | 'tokenRef'>): Promise<Subscription> => {
    const subNum = Math.floor(1000 + Math.random() * 9000);
    const newSub: Subscription = {
      ...subData,
      id: `#SUB-${subNum}`,
      startedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      tokenRef: `tok_live_${Math.random().toString(36).substring(2, 8)}`
    };

    try {
      await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: subData.customerId,
          templateId: 'tmpl_standard_annual',
          startDate: new Date().toISOString(),
          paymentTermsDays: 15,
        }),
      }).catch(() => {});
    } catch {
      // offline fallback
    }

    setSubscriptions(prev => [newSub, ...prev]);
    setSelectedSubId(newSub.id);

    updateCustomer(newSub.customerId, {
      currentArr: (customers.find(c => c.id === newSub.customerId)?.currentArr || 0) + (newSub.mrr * 12),
      plansCount: (customers.find(c => c.id === newSub.customerId)?.plansCount || 0) + 1,
      primaryPlan: newSub.planName
    });

    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'SUBSCRIPTION_PROVISIONED',
      target: `${newSub.id} for ${newSub.customerName} (${newSub.mrr}/mo)`,
      category: 'SUBSCRIPTION',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);

    return newSub;
  };

  const updateSubscription = (id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  };

  const pauseSubscription = (id: string) => {
    updateSubscription(id, { status: 'paused', health: 'On Hold' });
    const sub = subscriptions.find(s => s.id === id);
    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'SUBSCRIPTION_PAUSED',
      target: `${id} (${sub?.customerName}) paused`,
      category: 'SUBSCRIPTION',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);
  };

  const resumeSubscription = (id: string) => {
    updateSubscription(id, { status: 'active', health: 'Healthy' });
    const sub = subscriptions.find(s => s.id === id);
    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'SUBSCRIPTION_RESUMED',
      target: `${id} (${sub?.customerName}) resumed active status`,
      category: 'SUBSCRIPTION',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);
  };

  const cancelSubscription = (id: string) => {
    updateSubscription(id, { status: 'canceled', health: 'On Hold' });
    const sub = subscriptions.find(s => s.id === id);
    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'SUBSCRIPTION_CANCELED',
      target: `${id} (${sub?.customerName}) terminated by user request`,
      category: 'SUBSCRIPTION',
      status: 'WARNING'
    };
    setAuditEvents(prev => [audit, ...prev]);
  };

  const upgradeSubscription = (id: string, newPlanName: string, newMrr: number, newSeats: number) => {
    updateSubscription(id, {
      planName: newPlanName,
      mrr: newMrr,
      seats: newSeats,
      status: 'active',
      health: 'Healthy'
    });
    const sub = subscriptions.find(s => s.id === id);
    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'SUBSCRIPTION_EXPANSION_UPGRADE',
      target: `${id} upgraded to ${newPlanName} ($${newMrr}/mo, ${newSeats} seats)`,
      category: 'SUBSCRIPTION',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);
  };

  const bulkUpdateSubscriptions = (operation: 'pause' | 'resume') => {
    const targetStatus = operation === 'pause' ? 'paused' : 'active';
    const sourceStatus = operation === 'pause' ? 'active' : 'paused';
    let affectedCount = 0;
    setSubscriptions(prev =>
      prev.map(sub => {
        if (sub.status === sourceStatus) {
          affectedCount++;
          return { ...sub, status: targetStatus, health: operation === 'pause' ? 'On Hold' : 'Healthy' };
        }
        return sub;
      })
    );
    const audit: AuditEvent = {
      id: 'evt_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: operation === 'pause' ? 'SUBSCRIPTIONS_BULK_PAUSED' : 'SUBSCRIPTIONS_BULK_RESUMED',
      target: 'Bulk ' + operation + ' executed on ' + (affectedCount || 'cohort') + ' subscriptions',
      category: 'SUBSCRIPTION',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);
  };

  const issueCreditNote = (customerId: string, amount: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          return { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - amount) };
        }
        return c;
      })
    );
    const audit: AuditEvent = {
      id: 'evt_' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: 'CREDIT_NOTE_ISSUED',
      target: 'Credit Note of ' + String.fromCharCode(36) + amount.toLocaleString() + ' issued to ' + customer.name,
      category: 'BILLING',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);
  };

  // Staged billing actions
  const excludeStagedItem = (id: string) => {
    setStagedBilling(prev =>
      prev.map(item => (item.id === id ? { ...item, state: 'Excluded' } : item))
    );
  };

  const recalculateProration = (id: string) => {
    setStagedBilling(prev =>
      prev.map(item => {
        if (item.id === id) {
          const adjCredit = -Math.round(item.baseAmount * 0.08);
          const adjTax = Math.round((item.baseAmount + adjCredit) * 0.085);
          return {
            ...item,
            creditsProrations: adjCredit,
            nexusTax: adjTax,
            netCharge: item.baseAmount + adjCredit + adjTax,
            state: 'Prorated'
          };
        }
        return item;
      })
    );
  };

  const executeBatchBillingRun = async (isDryRun: boolean) => {
    // Generate run
    const readyItems = stagedBilling.filter(item => item.state !== 'Excluded');
    const totalAmount = readyItems.reduce((acc, item) => acc + item.netCharge, 0);
    const runCode = `Run #${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}B`;

    const newLog: BillingRunLog = {
      id: `run_${Date.now()}`,
      runCode,
      date: `${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} • ${readyItems.length} billed • 0 failed`,
      totalBilledCount: readyItems.length,
      failedCount: 0,
      totalAmount,
      collectionRate: '100% Pre-validated',
      status: isDryRun ? 'SIMULATED' : 'COMPLETED'
    };

    setBillingLogs(prev => [newLog, ...prev]);

    // If live, generate corresponding invoices
    if (!isDryRun) {
      const newInvoices: Invoice[] = readyItems.map((item, index) => ({
        id: `inv_${Date.now()}_${index}`,
        invoiceNumber: `INV-2024-${Math.floor(9100 + Math.random() * 800)}`,
        customerId: `cust_${item.subId}`,
        customerName: item.customerName,
        customerInitials: item.customerInitials,
        customerEmail: `billing@${item.customerOrgUrl}`,
        customerTaxId: 'AUTO-TAX-NEXUS',
        customerAddress: item.customerLocation,
        subId: item.subId,
        issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        dueDate: new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        amount: item.netCharge,
        subtotal: item.baseAmount + item.creditsProrations,
        taxAmount: item.nexusTax,
        discountAmount: Math.abs(Math.min(0, item.creditsProrations)),
        status: 'paid',
        paymentMethod: item.paymentMethod.label,
        lineItems: [
          {
            description: item.planDescription,
            quantity: 1,
            unitPrice: item.baseAmount,
            total: item.baseAmount
          }
        ]
      }));

      setInvoices(prev => [...newInvoices, ...prev]);

      // Record payments
      const newPayments: PaymentTransaction[] = newInvoices.map((inv, idx) => ({
        id: `pay_batch_${Date.now()}_${idx}`,
        reference: `PAY-BATCH-${Math.floor(10000 + Math.random() * 90000)}`,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerInitials: inv.customerInitials,
        amount: inv.amount,
        method: inv.paymentMethod || 'Gateway Sweep',
        status: 'paid',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
        gateway: 'Stripe Connect'
      }));

      setPayments(prev => [...newPayments, ...prev]);
    }

    const audit: AuditEvent = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actor: 'Elena Vance',
      actorRole: 'VP Financial Ops',
      action: isDryRun ? 'DRY_RUN_SIMULATION' : 'LIVE_BATCH_EXECUTION',
      target: `${runCode} [${readyItems.length} accounts, $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}]`,
      category: 'BILLING',
      status: 'SUCCESS'
    };
    setAuditEvents(prev => [audit, ...prev]);

    return {
      success: true,
      count: readyItems.length,
      total: totalAmount,
      message: isDryRun
        ? `Dry run simulation completed successfully for ${readyItems.length} subscriptions ($${totalAmount.toLocaleString()}). No cards charged.`
        : `Live automated debit sweep dispatched for ${readyItems.length} accounts ($${totalAmount.toLocaleString()}). Invoices & payments recorded.`
    };
  };

  // Invoices & Payments
  const addInvoice = (invData: Omit<Invoice, 'id' | 'invoiceNumber'>): Invoice => {
    const invNumber = `INV-2024-${Math.floor(9200 + Math.random() * 700)}`;
    const newInv: Invoice = {
      ...invData,
      id: `inv_${Date.now()}`,
      invoiceNumber: invNumber
    };
    setInvoices(prev => [newInv, ...prev]);
    return newInv;
  };

  const payInvoice = (id: string) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === id) {
          // record payment
          const payment: PaymentTransaction = {
            id: `pay_${Date.now()}`,
            reference: `PAY-MANUAL-${Math.floor(10000 + Math.random() * 90000)}`,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            customerInitials: inv.customerInitials,
            amount: inv.amount,
            method: 'Manual Wire / Card Clearance',
            status: 'paid',
            date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
            gateway: 'Manual Settlement'
          };
          setPayments(p => [payment, ...p]);
          return { ...inv, status: 'paid' };
        }
        return inv;
      })
    );
  };

  const recordPayment = async (pData: { invoiceNumber: string; amount: number; method: string; customerName: string; invoiceId?: string }) => {
    try {
      const matched = invoices.find(inv => inv.invoiceNumber === pData.invoiceNumber || inv.id === pData.invoiceId);
      if (matched && matched.id) {
        await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceId: matched.id,
            amountPaise: Math.round(pData.amount * 100),
            method: pData.method.toLowerCase().includes('card') ? 'CARD' : 'BANK_TRANSFER',
            paymentDate: new Date().toISOString(),
            reference: `PAY-REC-${Math.floor(10000 + Math.random() * 90000)}`,
          }),
        }).catch(() => {});
      }
    } catch {
      // offline fallback
    }

    const initial = pData.customerName.charAt(0) || 'C';
    const newPay: PaymentTransaction = {
      id: `pay_${Date.now()}`,
      reference: `PAY-REC-${Math.floor(10000 + Math.random() * 90000)}`,
      invoiceNumber: pData.invoiceNumber,
      customerName: pData.customerName,
      customerInitials: initial,
      amount: pData.amount,
      method: pData.method,
      status: 'paid',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      gateway: 'Treasury Post'
    };
    setPayments(prev => [newPay, ...prev]);

    setInvoices(prev =>
      prev.map(inv => (inv.invoiceNumber === pData.invoiceNumber ? { ...inv, status: 'paid' } : inv))
    );
  };

  // Plans & Products
  const addPlan = (p: Omit<Plan, 'id'>) => {
    const newPlan: Plan = {
      ...p,
      id: `plan_${Date.now().toString(36)}`
    };
    setPlans(prev => [...prev, newPlan]);
  };

  const addProduct = (p: Omit<Product, 'id' | 'createdAt'>) => {
    const newProd: Product = {
      ...p,
      id: `prod_${Date.now().toString(36)}`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setProducts(prev => [...prev, newProd]);
  };

  // Quotations
  const addQuotation = (q: Omit<Quotation, 'id' | 'quoteNumber' | 'createdAt'>): Quotation => {
    const quoteNum = `QUO-2024-${Math.floor(830 + Math.random() * 160)}`;
    const newQuote: Quotation = {
      ...q,
      id: `qt_${Date.now()}`,
      quoteNumber: quoteNum,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };
    setQuotations(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const convertQuotationToSubscription = (quoteId: string) => {
    const q = quotations.find(quote => quote.id === quoteId);
    if (!q) return;

    setQuotations(prev =>
      prev.map(quote => (quote.id === quoteId ? { ...quote, status: 'accepted' } : quote))
    );

    addSubscription({
      customerId: q.customerId,
      customerName: q.customerName,
      customerEmail: q.customerEmail,
      customerInitials: q.customerName.substring(0, 2).toUpperCase(),
      planName: q.planName,
      planTier: 'Enterprise',
      seats: q.seats,
      maxSeats: q.seats + 10,
      addons: ['Quotation Converted Core'],
      mrr: Math.round(q.annualValue / 12),
      billingCycle: 'annual',
      status: 'active',
      health: 'Healthy',
      renewalDate: new Date(Date.now() + 365 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      renewalDaysLeft: 365,
      clearinghouse: 'Direct Wire'
    });
  };

  // Notifications
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // CSV Export utility
  const exportDataToCsv = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              const rawVal = (row as Record<string, unknown>)[k];
              let cellStr = rawVal === null || rawVal === undefined ? '' : typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);
              cellStr = cellStr.replace(/"/g, '""');
              if (cellStr.search(/("|,|\n)/g) >= 0) {
                cellStr = `"${cellStr}"`;
              }
              return cellStr;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <DataContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        currency,
        setCurrency,

        customers,
        addCustomer,
        updateCustomer,
        selectedCustomerId,
        setSelectedCustomerId,

        subscriptions,
        addSubscription,
        updateSubscription,
        pauseSubscription,
        resumeSubscription,
        cancelSubscription,
        upgradeSubscription,
        bulkUpdateSubscriptions,
        issueCreditNote,
        selectedSubId,
        setSelectedSubId,

        stagedBilling,
        excludeStagedItem,
        recalculateProration,
        executeBatchBillingRun,

        invoices,
        addInvoice,
        payInvoice,
        selectedInvoice,
        setSelectedInvoice,

        payments,
        recordPayment,

        plans,
        addPlan,

        products,
        addProduct,

        quotations,
        addQuotation,
        convertQuotationToSubscription,

        billingLogs,
        auditEvents,

        notifications,
        markAllNotificationsRead,
        dismissNotification,

        searchQuery,
        setSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,

        isNewSubModalOpen,
        setIsNewSubModalOpen,

        isAddCustomerModalOpen,
        setIsAddCustomerModalOpen,

        isRecordPaymentModalOpen,
        setIsRecordPaymentModalOpen,

        isBulkSubModalOpen,
        setIsBulkSubModalOpen,

        exportDataToCsv
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
