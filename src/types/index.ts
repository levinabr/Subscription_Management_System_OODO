export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled' | 'draft';

export type InvoiceStatus = 'paid' | 'processing' | 'retrying' | 'draft' | 'voided';

export type PaymentMethodType = 'visa' | 'mastercard' | 'amex' | 'ach' | 'bacs' | 'sepa' | 'wire';

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  avatarInitials: string;
  status: 'active' | 'past_due' | 'trialing' | 'paused';
  tier: 'Tier 1' | 'Tier 2' | 'Growth' | 'Enterprise';
  plansCount: number;
  primaryPlan: string;
  outstandingBalance: number; // in USD
  lifetimeValue: number; // in USD
  currentArr: number; // in USD
  joinedDate: string;
  taxId: string;
  currency: string;
  location: string;
  paymentMethod: {
    type: PaymentMethodType;
    last4?: string;
    expiry?: string;
    verified: boolean;
    name: string;
  };
}

export interface Subscription {
  id: string; // e.g. #SUB-4920
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerInitials: string;
  planName: string;
  planTier: 'Enterprise' | 'Pro' | 'Starter' | 'Custom';
  seats: number;
  maxSeats: number;
  addons: string[];
  mrr: number; // in USD
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  status: SubscriptionStatus;
  health: 'Healthy' | 'Card Expired' | 'Overdue' | 'Active' | 'On Hold' | 'Net30 OK';
  renewalDate: string;
  renewalDaysLeft: number;
  startedDate: string;
  clearinghouse: string; // e.g. Stripe US-ACQ
  dunningPhase?: number;
  tokenRef: string;
}

export interface Plan {
  id: string;
  code: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  interval: 'monthly' | 'annual' | 'quarterly';
  features: string[];
  recommended?: boolean;
  minSeats?: number;
  overageRatePerSeat?: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: 'Platform' | 'Add-on' | 'Usage' | 'Enterprise Support';
  sellingPrice: number;
  costPrice: number;
  taxRate: number; // e.g. 8.5%
  taxName: string;
  notes: string;
  createdAt: string;
}

export interface Quotation {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planName: string;
  seats: number;
  annualValue: number;
  discountPercent: number;
  taxPercent: number;
  totalAmount: number;
  status: 'draft' | 'pending_approval' | 'sent' | 'accepted' | 'expired';
  createdAt: string;
  validUntil: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
}

export interface StagedBillingItem {
  id: string;
  subId: string;
  customerName: string;
  customerOrgUrl: string;
  customerLocation: string;
  customerLogo?: string;
  customerInitials: string;
  planDescription: string;
  baseAmount: number;
  creditsProrations: number;
  nexusTax: number;
  netCharge: number;
  paymentMethod: {
    type: PaymentMethodType;
    label: string;
  };
  state: 'Ready' | 'Prorated' | 'Needs Review' | 'Excluded';
  flagReason?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. INV-2024-9042
  customerId: string;
  customerName: string;
  customerInitials: string;
  customerEmail: string;
  customerTaxId: string;
  customerAddress: string;
  subId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  status: InvoiceStatus;
  paymentMethod?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface PaymentTransaction {
  id: string;
  reference: string;
  invoiceNumber: string;
  customerName: string;
  customerInitials: string;
  amount: number;
  method: string;
  status: 'paid' | 'processing' | 'failed' | 'retrying';
  date: string;
  gateway: string;
}

export interface BillingRunLog {
  id: string;
  runCode: string; // e.g. Run #2024-10B
  date: string;
  totalBilledCount: number;
  failedCount: number;
  totalAmount: number;
  collectionRate: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'SIMULATED' | 'FAILED';
  reconciledCsvUrl?: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  target: string;
  category: 'BILLING' | 'SUBSCRIPTION' | 'SECURITY' | 'WEBHOOK';
  status: 'SUCCESS' | 'FLAGGED' | 'WARNING';
}
