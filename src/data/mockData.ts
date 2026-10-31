import { Customer, Subscription, Plan, Product, Quotation, StagedBillingItem, Invoice, PaymentTransaction, BillingRunLog, AuditEvent } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_lin_94982a17f',
    name: 'Linear Systems Inc',
    email: 'billing@linear.app',
    company: 'Linear Systems Inc',
    avatarInitials: 'LS',
    status: 'active',
    tier: 'Tier 1',
    plansCount: 2,
    primaryPlan: 'Enterprise Core',
    outstandingBalance: 0,
    lifetimeValue: 38400,
    currentArr: 18200,
    joinedDate: 'Jan 14, 2023',
    taxId: '12-3456789',
    currency: 'USD ($)',
    location: 'San Francisco, CA',
    paymentMethod: {
      type: 'visa',
      last4: '4242',
      expiry: '09/28',
      verified: true,
      name: 'Corporate Visa Signature'
    }
  },
  {
    id: 'cust_vox_72841b92c',
    name: 'Voxel Media Group',
    email: 'ap@voxelmedia.co.uk',
    company: 'Voxel Media Group',
    avatarInitials: 'VM',
    status: 'past_due',
    tier: 'Growth',
    plansCount: 1,
    primaryPlan: 'Growth Scale',
    outstandingBalance: 4200,
    lifetimeValue: 16800,
    currentArr: 9600,
    joinedDate: 'Aug 22, 2023',
    taxId: 'GB982183921',
    currency: 'USD ($)',
    location: 'London, UK',
    paymentMethod: {
      type: 'bacs',
      last4: '1902',
      expiry: '04/26',
      verified: true,
      name: 'BACS Direct Debit'
    }
  },
  {
    id: 'cust_ql_38491c10d',
    name: 'Quantum Logic Corp',
    email: 'finance@quantumlogic.de',
    company: 'Quantum Logic Corp',
    avatarInitials: 'QL',
    status: 'active',
    tier: 'Enterprise',
    plansCount: 3,
    primaryPlan: 'Enterprise Max',
    outstandingBalance: 0,
    lifetimeValue: 54200,
    currentArr: 26400,
    joinedDate: 'Nov 03, 2022',
    taxId: 'DE839201948',
    currency: 'USD ($)',
    location: 'Munich, DE',
    paymentMethod: {
      type: 'sepa',
      last4: '8821',
      expiry: '12/29',
      verified: true,
      name: 'SEPA Corporate Sweep'
    }
  },
  {
    id: 'cust_hc_59281d44e',
    name: 'Horizon Cloud Studio',
    email: 'marcus@horizoncloud.io',
    company: 'Horizon Cloud Studio',
    avatarInitials: 'HC',
    status: 'trialing',
    tier: 'Growth',
    plansCount: 1,
    primaryPlan: 'Team Pro Trial',
    outstandingBalance: 0,
    lifetimeValue: 0,
    currentArr: 0,
    joinedDate: 'May 02, 2024',
    taxId: '94-8192841',
    currency: 'USD ($)',
    location: 'Austin, TX',
    paymentMethod: {
      type: 'mastercard',
      last4: '6102',
      expiry: '11/27',
      verified: true,
      name: 'Corporate MC'
    }
  },
  {
    id: 'cust_syn_88492e88f',
    name: 'Synthetix Labs',
    email: 'ops@synthetixlabs.jp',
    company: 'Synthetix Labs',
    avatarInitials: 'SL',
    status: 'paused',
    tier: 'Growth',
    plansCount: 1,
    primaryPlan: 'Growth Custom',
    outstandingBalance: 0,
    lifetimeValue: 22150,
    currentArr: 14200,
    joinedDate: 'Feb 19, 2023',
    taxId: 'JP-901847192',
    currency: 'USD ($)',
    location: 'Tokyo, JP',
    paymentMethod: {
      type: 'visa',
      last4: '9214',
      expiry: '08/27',
      verified: true,
      name: 'Corporate Visa'
    }
  },
  {
    id: 'cust_data_10293f77a',
    name: 'Datadog Core Inc',
    email: 'billing@datadog.com',
    company: 'Datadog Core Inc',
    avatarInitials: 'DC',
    status: 'active',
    tier: 'Enterprise',
    plansCount: 4,
    primaryPlan: 'Enterprise Cluster',
    outstandingBalance: 0,
    lifetimeValue: 92400,
    currentArr: 34800,
    joinedDate: 'Mar 11, 2022',
    taxId: '13-8829103',
    currency: 'USD ($)',
    location: 'New York, NY',
    paymentMethod: {
      type: 'ach',
      last4: '0091',
      expiry: '10/30',
      verified: true,
      name: 'JPMorgan Treasury ACH'
    }
  },
  {
    id: 'cust_ver_99214a11b',
    name: 'Vercel Enterprise',
    email: 'accounts@vercel.com',
    company: 'Vercel Enterprise',
    avatarInitials: 'VE',
    status: 'active',
    tier: 'Tier 1',
    plansCount: 2,
    primaryPlan: 'Enterprise Platinum',
    outstandingBalance: 0,
    lifetimeValue: 64500,
    currentArr: 28200,
    joinedDate: 'Jun 19, 2022',
    taxId: '47-2910294',
    currency: 'USD ($)',
    location: 'San Francisco, CA',
    paymentMethod: {
      type: 'wire',
      last4: '7721',
      expiry: '12/32',
      verified: true,
      name: 'Wire Settlement Direct'
    }
  },
  {
    id: 'cust_fig_33849b22c',
    name: 'Figma Org Suite',
    email: 'procurement@figma.com',
    company: 'Figma Org Suite',
    avatarInitials: 'FO',
    status: 'past_due',
    tier: 'Enterprise',
    plansCount: 2,
    primaryPlan: 'Custom Global',
    outstandingBalance: 12250,
    lifetimeValue: 48900,
    currentArr: 24500,
    joinedDate: 'Sep 08, 2023',
    taxId: '82-9018291',
    currency: 'USD ($)',
    location: 'San Francisco, CA',
    paymentMethod: {
      type: 'amex',
      last4: '3009',
      expiry: '09/26',
      verified: false,
      name: 'Amex Business Card'
    }
  }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  {
    id: '#SUB-4920',
    customerId: 'cust_syn_88492e88f',
    customerName: 'Synthetix AI Inc.',
    customerEmail: 'billing@synthetix.io',
    customerInitials: 'SA',
    planName: 'Enterprise Growth',
    planTier: 'Enterprise',
    seats: 45,
    maxSeats: 50,
    addons: ['Dedicated Cluster', 'API Turbo Tier'],
    mrr: 2450.00,
    billingCycle: 'monthly',
    status: 'active',
    health: 'Healthy',
    renewalDate: 'Nov 14, 2024',
    renewalDaysLeft: 21,
    startedDate: 'Oct 14, 2023',
    clearinghouse: 'Stripe US-ACQ',
    tokenRef: 'tok_live_09x84k'
  },
  {
    id: '#SUB-4921',
    customerId: 'cust_kroma_88291',
    customerName: 'Kroma Logic Ltd.',
    customerEmail: 'ops@kromalogic.dev',
    customerInitials: 'KL',
    planName: 'Pro Platform',
    planTier: 'Pro',
    seats: 12,
    maxSeats: 15,
    addons: ['Dedicated IP'],
    mrr: 750.00,
    billingCycle: 'monthly',
    status: 'past_due',
    health: 'Card Expired',
    renewalDate: 'Oct 21, 2024',
    renewalDaysLeft: -3,
    startedDate: 'May 21, 2024',
    clearinghouse: 'Stripe EU',
    dunningPhase: 2,
    tokenRef: 'tok_live_44m29q'
  },
  {
    id: '#SUB-4922',
    customerId: 'cust_nova_19283',
    customerName: 'NovaWave Dynamics',
    customerEmail: 'cto@novawave.co',
    customerInitials: 'NV',
    planName: 'Pro Platform Trial',
    planTier: 'Pro',
    seats: 8,
    maxSeats: 10,
    addons: ['Standard Limits'],
    mrr: 0.00,
    billingCycle: 'monthly',
    status: 'trialing',
    health: 'Active',
    renewalDate: 'Nov 02, 2024',
    renewalDaysLeft: 8,
    startedDate: 'Oct 18, 2024',
    clearinghouse: 'Stripe US-ACQ',
    tokenRef: 'tok_live_77z10k'
  },
  {
    id: '#SUB-4923',
    customerId: 'cust_apex_39201',
    customerName: 'Apex Systems UK',
    customerEmail: 'finance@apexsys.co.uk',
    customerInitials: 'AS',
    planName: 'Enterprise Custom',
    planTier: 'Enterprise',
    seats: 25,
    maxSeats: 25,
    addons: ['Paused Save Offer'],
    mrr: 0.00,
    billingCycle: 'monthly',
    status: 'paused',
    health: 'On Hold',
    renewalDate: 'Dec 01, 2024',
    renewalDaysLeft: 38,
    startedDate: 'Dec 01, 2023',
    clearinghouse: 'Adyen UK',
    tokenRef: 'tok_live_12k99p'
  },
  {
    id: '#SUB-4924',
    customerId: 'cust_bio_90129',
    customerName: 'Biolink Analytics Corp',
    customerEmail: 'accounting@biolink.org',
    customerInitials: 'BL',
    planName: 'Enterprise Annual',
    planTier: 'Enterprise',
    seats: 100,
    maxSeats: 120,
    addons: ['HIPAA Vault', '24/7 Dedicated TAM'],
    mrr: 5200.00,
    billingCycle: 'annual',
    status: 'active',
    health: 'Net30 OK',
    renewalDate: 'Aug 18, 2025',
    renewalDaysLeft: 290,
    startedDate: 'Aug 18, 2024',
    clearinghouse: 'Wire Transfer ACH',
    tokenRef: 'tok_live_88x22w'
  },
  {
    id: '#SUB-4925',
    customerId: 'cust_lin_94982a17f',
    customerName: 'Linear Systems Inc',
    customerEmail: 'billing@linear.app',
    customerInitials: 'LS',
    planName: 'Enterprise Core',
    planTier: 'Enterprise',
    seats: 60,
    maxSeats: 80,
    addons: ['AI Workflows Metered', 'Priority Support'],
    mrr: 1200.00,
    billingCycle: 'monthly',
    status: 'active',
    health: 'Healthy',
    renewalDate: 'Nov 10, 2024',
    renewalDaysLeft: 17,
    startedDate: 'Jan 14, 2023',
    clearinghouse: 'Stripe US-ACQ',
    tokenRef: 'tok_live_99p01a'
  }
];

export const INITIAL_STAGED_BILLING: StagedBillingItem[] = [
  {
    id: 'stg_1',
    subId: '#SUB-8842',
    customerName: 'Synthetix AI',
    customerOrgUrl: 'synthetix.corp',
    customerLocation: 'US-CA',
    customerInitials: 'SA',
    planDescription: 'Enterprise Scale (120 Seats)',
    baseAmount: 14400.00,
    creditsProrations: -1200.00,
    nexusTax: 957.00,
    netCharge: 14157.00,
    paymentMethod: {
      type: 'visa',
      label: 'Visa •••• 4242'
    },
    state: 'Ready'
  },
  {
    id: 'stg_2',
    subId: '#SUB-8843',
    customerName: 'Linear Labs',
    customerOrgUrl: 'linearlabs.dev',
    customerLocation: 'UK-LON',
    customerInitials: 'LL',
    planDescription: 'Pro Annual + Cluster Add-on',
    baseAmount: 28500.00,
    creditsProrations: 0.00,
    nexusTax: 5700.00,
    netCharge: 34200.00,
    paymentMethod: {
      type: 'bacs',
      label: 'Bacs Direct Debit'
    },
    state: 'Prorated'
  },
  {
    id: 'stg_3',
    subId: '#SUB-8844',
    customerName: 'Retool Inc',
    customerOrgUrl: 'internal.retool.io',
    customerLocation: 'US-NY',
    customerInitials: 'RI',
    planDescription: 'Enterprise Usage Ledger (Tier 3)',
    baseAmount: 9200.00,
    creditsProrations: -450.00,
    nexusTax: 776.50,
    netCharge: 9526.50,
    paymentMethod: {
      type: 'mastercard',
      label: 'Mastercard •••• 9921'
    },
    state: 'Ready'
  },
  {
    id: 'stg_4',
    subId: '#SUB-8845',
    customerName: 'Nexora Quantum',
    customerOrgUrl: 'nexora.ai',
    customerLocation: 'Missing Tax Jurisdiction',
    customerInitials: 'NX',
    planDescription: 'Dedicated Cluster Plan',
    baseAmount: 2250.00,
    creditsProrations: 0.00,
    nexusTax: 0.00,
    netCharge: 2250.00,
    paymentMethod: {
      type: 'amex',
      label: 'Amex •••• 1004'
    },
    state: 'Needs Review',
    flagReason: 'Missing Tax Jurisdiction: State Nexus table required'
  },
  {
    id: 'stg_5',
    subId: '#SUB-8846',
    customerName: 'CloudLogic Global',
    customerOrgUrl: 'cloudlogic.net',
    customerLocation: 'DE-BER',
    customerInitials: 'CL',
    planDescription: 'Usage Add-on (Network Egress)',
    baseAmount: 5610.00,
    creditsProrations: -210.00,
    nexusTax: 1026.00,
    netCharge: 6426.00,
    paymentMethod: {
      type: 'sepa',
      label: 'SEPA Direct Debit'
    },
    state: 'Ready'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_9042',
    invoiceNumber: 'INV-2024-9042',
    customerId: 'cust_str_100',
    customerName: 'Stripe Atlas Corp',
    customerInitials: 'S',
    customerEmail: 'billing@stripeatlas.corp',
    customerTaxId: 'US-8492019',
    customerAddress: '510 Townsend St, San Francisco, CA',
    subId: '#SUB-7719',
    issueDate: 'Oct 24, 2024',
    dueDate: 'Nov 07, 2024',
    amount: 44500.00,
    subtotal: 42000.00,
    taxAmount: 2500.00,
    discountAmount: 0.00,
    status: 'paid',
    paymentMethod: 'ACH Direct Sweep',
    lineItems: [
      { description: 'Enterprise Platform - Annual Core Tier', quantity: 1, unitPrice: 38000.00, total: 38000.00 },
      { description: 'Dedicated Global Routing Clusters', quantity: 2, unitPrice: 2000.00, total: 4000.00 }
    ]
  },
  {
    id: 'inv_9041',
    invoiceNumber: 'INV-2024-9041',
    customerId: 'cust_data_10293f77a',
    customerName: 'Datadog Core Inc',
    customerInitials: 'D',
    customerEmail: 'billing@datadog.com',
    customerTaxId: '13-8829103',
    customerAddress: '620 8th Ave, New York, NY',
    subId: '#SUB-7720',
    issueDate: 'Oct 23, 2024',
    dueDate: 'Nov 06, 2024',
    amount: 28900.00,
    subtotal: 26800.00,
    taxAmount: 2100.00,
    discountAmount: 0.00,
    status: 'processing',
    paymentMethod: 'JPMorgan Chase ACH',
    lineItems: [
      { description: 'Telemetry Streaming Connectors (Tier 4)', quantity: 1, unitPrice: 26800.00, total: 26800.00 }
    ]
  },
  {
    id: 'inv_9040',
    invoiceNumber: 'INV-2024-9040',
    customerId: 'cust_ver_99214a11b',
    customerName: 'Vercel Enterprise',
    customerInitials: 'V',
    customerEmail: 'accounts@vercel.com',
    customerTaxId: '47-2910294',
    customerAddress: '440 N Barranca Ave, Covina, CA',
    subId: '#SUB-7721',
    issueDate: 'Oct 22, 2024',
    dueDate: 'Nov 05, 2024',
    amount: 18400.00,
    subtotal: 17200.00,
    taxAmount: 1200.00,
    discountAmount: 0.00,
    status: 'paid',
    paymentMethod: 'Wire Settlement Direct',
    lineItems: [
      { description: 'Pro Edge CDN & Acceleration Seats', quantity: 40, unitPrice: 430.00, total: 17200.00 }
    ]
  },
  {
    id: 'inv_9039',
    invoiceNumber: 'INV-2024-9039',
    customerId: 'cust_fig_33849b22c',
    customerName: 'Figma Org Suite',
    customerInitials: 'F',
    customerEmail: 'procurement@figma.com',
    customerTaxId: '82-9018291',
    customerAddress: '760 Market St, San Francisco, CA',
    subId: '#SUB-7722',
    issueDate: 'Oct 19, 2024',
    dueDate: 'Oct 24, 2024',
    amount: 12250.00,
    subtotal: 11500.00,
    taxAmount: 750.00,
    discountAmount: 0.00,
    status: 'retrying',
    paymentMethod: 'Amex Business (Retry 2/3)',
    lineItems: [
      { description: 'Collaborative Canvas Engine License', quantity: 1, unitPrice: 11500.00, total: 11500.00 }
    ]
  },
  {
    id: 'inv_9038',
    invoiceNumber: 'INV-2024-9038',
    customerId: 'cust_lin_94982a17f',
    customerName: 'Linear Systems Inc',
    customerInitials: 'LS',
    customerEmail: 'billing@linear.app',
    customerTaxId: '12-3456789',
    customerAddress: 'San Francisco, CA',
    subId: '#SUB-4925',
    issueDate: 'Oct 14, 2024',
    dueDate: 'Oct 28, 2024',
    amount: 2450.00,
    subtotal: 2450.00,
    taxAmount: 0.00,
    discountAmount: 0.00,
    status: 'paid',
    paymentMethod: 'Visa •••• 9214',
    lineItems: [
      { description: 'Enterprise Core Monthly Tier', quantity: 1, unitPrice: 1200.00, total: 1200.00 },
      { description: 'AI Workflows (Metered Invocations)', quantity: 1, unitPrice: 316.00, total: 316.00 },
      { description: 'Additional Seat Licenses (25 seats)', quantity: 25, unitPrice: 37.36, total: 934.00 }
    ]
  }
];

export const INITIAL_PLANS: Plan[] = [
  {
    id: 'plan_starter',
    code: 'PLN-START',
    name: 'Starter Platform',
    priceMonthly: 290.00,
    priceAnnual: 2900.00,
    interval: 'monthly',
    minSeats: 5,
    overageRatePerSeat: 45.00,
    features: [
      'Up to 10 Team Seats',
      'Standard API Billing Webhooks',
      'Automated Invoicing (USD only)',
      'Basic Dunning Retries (3x)',
      'Email Support'
    ]
  },
  {
    id: 'plan_pro',
    code: 'PLN-PRO',
    name: 'Pro Core',
    priceMonthly: 750.00,
    priceAnnual: 7500.00,
    interval: 'monthly',
    recommended: true,
    minSeats: 15,
    overageRatePerSeat: 35.00,
    features: [
      'Up to 35 Team Seats',
      'Multi-currency (USD, EUR, GBP)',
      'TaxJar Automated Nexus Sync',
      'Proration Second-Precision Slice',
      'Adyen, BACS & SEPA Direct Sweep',
      'Priority 24/7 Slack Connect'
    ]
  },
  {
    id: 'plan_enterprise',
    code: 'PLN-ENT',
    name: 'Enterprise Scale',
    priceMonthly: 2450.00,
    priceAnnual: 24500.00,
    interval: 'monthly',
    minSeats: 50,
    overageRatePerSeat: 25.00,
    features: [
      'Unlimited Team & Sub-accounts',
      'Custom ERP Postings (NetSuite, SAP)',
      'Autonomous Ledger V4.2 Execution',
      'Dedicated Private Cloud Cluster',
      'Custom SLA & 99.999% Guarantee',
      'Dedicated TAM & Financial Solutions Architect'
    ]
  },
  {
    id: 'plan_custom',
    code: 'PLN-CUST',
    name: 'Custom Milestone / OEM',
    priceMonthly: 5200.00,
    priceAnnual: 52000.00,
    interval: 'annual',
    minSeats: 100,
    features: [
      'Custom Contract Terms',
      'Whitelabel Payment Flows',
      'ACH Large-Sweep Direct Clearing',
      'Audit Compliance Vault (SOC2 / HIPAA)'
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    sku: 'SKU-CORE-ENT',
    name: 'Enterprise Platform Core',
    category: 'Platform',
    sellingPrice: 2450.00,
    costPrice: 420.00,
    taxRate: 8.5,
    taxName: 'State Tech Sales Tax',
    notes: 'Base monthly fee for enterprise infrastructure orchestration.',
    createdAt: '2023-01-10'
  },
  {
    id: 'prod_2',
    sku: 'SKU-SEAT-ADD',
    name: 'Additional Orchestration Seat',
    category: 'Add-on',
    sellingPrice: 35.00,
    costPrice: 2.10,
    taxRate: 8.5,
    taxName: 'State Tech Sales Tax',
    notes: 'Per user expansion seat license.',
    createdAt: '2023-01-15'
  },
  {
    id: 'prod_3',
    sku: 'SKU-AI-WORKFLOW',
    name: 'AI Workflows Engine',
    category: 'Usage',
    sellingPrice: 316.00,
    costPrice: 85.00,
    taxRate: 8.5,
    taxName: 'State Tech Sales Tax',
    notes: 'Metered token inference & webhook telemetry pipeline.',
    createdAt: '2023-06-20'
  },
  {
    id: 'prod_4',
    sku: 'SKU-DEDICATED-IP',
    name: 'Dedicated Private Egress IP & Cluster',
    category: 'Platform',
    sellingPrice: 450.00,
    costPrice: 120.00,
    taxRate: 0.0,
    taxName: 'Exempt Infrastructure',
    notes: 'Static IP pool for banking clearinghouses.',
    createdAt: '2023-09-01'
  },
  {
    id: 'prod_5',
    sku: 'SKU-HIPAA-VAULT',
    name: 'HIPAA & Financial Audit Vault',
    category: 'Enterprise Support',
    sellingPrice: 1200.00,
    costPrice: 190.00,
    taxRate: 0.0,
    taxName: 'Exempt Compliance',
    notes: 'Cold immutable log storage with SHA-256 signature sealing.',
    createdAt: '2023-11-12'
  }
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qt_101',
    quoteNumber: 'QUO-2024-819',
    customerId: 'cust_vox_72841b92c',
    customerName: 'Voxel Media Group',
    customerEmail: 'ap@voxelmedia.co.uk',
    planName: 'Enterprise Scale + 50 Seats',
    seats: 50,
    annualValue: 34200.00,
    discountPercent: 10,
    taxPercent: 5,
    totalAmount: 32319.00,
    status: 'pending_approval',
    createdAt: 'Oct 26, 2024',
    validUntil: 'Nov 26, 2024',
    lineItems: [
      { description: 'Enterprise Scale Annual Base', quantity: 1, unitPrice: 24500.00, amount: 24500.00 },
      { description: '50 Expansion Seats', quantity: 50, unitPrice: 194.00, amount: 9700.00 }
    ]
  },
  {
    id: 'qt_102',
    quoteNumber: 'QUO-2024-820',
    customerId: 'cust_hc_59281d44e',
    customerName: 'Horizon Cloud Studio',
    customerEmail: 'marcus@horizoncloud.io',
    planName: 'Pro Core Annual Migration',
    seats: 20,
    annualValue: 9200.00,
    discountPercent: 15,
    taxPercent: 8.5,
    totalAmount: 8484.70,
    status: 'sent',
    createdAt: 'Oct 28, 2024',
    validUntil: 'Nov 15, 2024',
    lineItems: [
      { description: 'Pro Core Annual Platform', quantity: 1, unitPrice: 7500.00, amount: 7500.00 },
      { description: 'Data Pipeline Add-on', quantity: 1, unitPrice: 1700.00, amount: 1700.00 }
    ]
  }
];

export const INITIAL_PAYMENTS: PaymentTransaction[] = [
  {
    id: 'pay_1',
    reference: 'PAY-ST-99120',
    invoiceNumber: 'INV-2024-9042',
    customerName: 'Stripe Atlas Corp',
    customerInitials: 'S',
    amount: 44500.00,
    method: 'ACH Direct',
    status: 'paid',
    date: 'Oct 24, 2024 14:32 UTC',
    gateway: 'Stripe Connect'
  },
  {
    id: 'pay_2',
    reference: 'PAY-ADY-88319',
    invoiceNumber: 'INV-2024-9040',
    customerName: 'Vercel Enterprise',
    customerInitials: 'V',
    amount: 18400.00,
    method: 'Wire Transfer',
    status: 'paid',
    date: 'Oct 22, 2024 09:15 UTC',
    gateway: 'Clearinghouse Direct'
  },
  {
    id: 'pay_3',
    reference: 'PAY-ST-99014',
    invoiceNumber: 'INV-2024-9038',
    customerName: 'Linear Systems Inc',
    customerInitials: 'LS',
    amount: 2450.00,
    method: 'Visa •••• 9214',
    status: 'paid',
    date: 'Oct 14, 2024 02:00 UTC',
    gateway: 'Stripe US-ACQ'
  },
  {
    id: 'pay_4',
    reference: 'PAY-ST-99009',
    invoiceNumber: 'INV-2024-9039',
    customerName: 'Figma Org Suite',
    customerInitials: 'F',
    amount: 12250.00,
    method: 'Amex •••• 3009',
    status: 'retrying',
    date: 'Oct 19, 2024 03:12 UTC',
    gateway: 'Stripe US-ACQ'
  }
];

export const INITIAL_BILLING_LOGS: BillingRunLog[] = [
  {
    id: 'run_10a',
    runCode: 'Run #2024-10A',
    date: 'Oct 10, 2024 • 412 billed • 0 failed',
    totalBilledCount: 412,
    failedCount: 0,
    totalAmount: 318420.00,
    collectionRate: '100% Collected',
    status: 'COMPLETED'
  },
  {
    id: 'run_09b',
    runCode: 'Run #2024-09B',
    date: 'Sep 24, 2024 • 398 billed • 1 retry cleared',
    totalBilledCount: 398,
    failedCount: 0,
    totalAmount: 294110.00,
    collectionRate: '100% Collected',
    status: 'COMPLETED'
  },
  {
    id: 'run_09a',
    runCode: 'Run #2024-09A',
    date: 'Sep 10, 2024 • 392 billed • 0 failed',
    totalBilledCount: 392,
    failedCount: 0,
    totalAmount: 288950.00,
    collectionRate: '100% Collected',
    status: 'COMPLETED'
  }
];

export const INITIAL_AUDIT_EVENTS: AuditEvent[] = [
  {
    id: 'evt_1',
    timestamp: '2026-10-31 00:48:12 UTC',
    actor: 'Elena Vance',
    actorRole: 'VP Financial Ops',
    action: 'DISPATCH_BATCH_RUN',
    target: 'Run #2024-10B [362 Subscriptions]',
    category: 'BILLING',
    status: 'SUCCESS'
  },
  {
    id: 'evt_2',
    timestamp: '2026-10-30 22:15:00 UTC',
    actor: 'Autonomous Engine V4.2',
    actorRole: 'SYSTEM_DAEMON',
    action: 'TAX_NEXUS_SYNC',
    target: 'TaxJar California & New York nexus rate cache refreshed',
    category: 'BILLING',
    status: 'SUCCESS'
  },
  {
    id: 'evt_3',
    timestamp: '2026-10-30 18:32:41 UTC',
    actor: 'Stripe Webhook',
    actorRole: 'GATEWAY_HOOK',
    action: 'CHARGE_FAILED_DUNNING_STAGE_2',
    target: 'Kroma Logic Ltd. (#SUB-4921) card declined (expired)',
    category: 'WEBHOOK',
    status: 'FLAGGED'
  },
  {
    id: 'evt_4',
    timestamp: '2026-10-30 14:10:02 UTC',
    actor: 'Elena Vance',
    actorRole: 'VP Financial Ops',
    action: 'PAUSE_SUBSCRIPTION_OFFER',
    target: 'Apex Systems UK (#SUB-4923) paused till Dec 01, 2024',
    category: 'SUBSCRIPTION',
    status: 'SUCCESS'
  },
  {
    id: 'evt_5',
    timestamp: '2026-10-29 09:04:19 UTC',
    actor: 'Autonomous Engine V4.2',
    actorRole: 'SYSTEM_DAEMON',
    action: 'FX_SPOT_RATE_LOCK',
    target: 'ECB EUR/USD spot lock 1.0820 confirmed',
    category: 'SECURITY',
    status: 'SUCCESS'
  }
];
