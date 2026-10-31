import { PrismaClient, InvoiceStatus, PaymentMethod, Role, SubscriptionStatus, BillingInterval } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Brightloop database with realistic subscription and financial records...');

  // 1. Staff and Admin Users
  const staffJoe = await prisma.user.upsert({
    where: { email: 'joe.finance@brightloop.com' },
    update: {},
    create: {
      id: 'usr_staff_01',
      name: 'Joe Finance Lead',
      email: 'joe.finance@brightloop.com',
      role: 'STAFF',
    },
  });

  const adminLevin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.com' },
    update: {},
    create: {
      id: 'usr_admin_01',
      name: 'Levin Admin',
      email: 'admin@brightloop.com',
      role: 'ADMIN',
    },
  });

  // 2. Customers
  const customerAcme = await prisma.customer.upsert({
    where: { billingEmail: 'billing@acme.com' },
    update: {},
    create: {
      id: 'cust_acme_01',
      businessName: 'Acme Enterprise Solutions',
      billingEmail: 'billing@acme.com',
      phone: '+91 98765 43210',
      addressLine1: '401 Cyber City, Phase 2',
      city: 'Bangalore',
      state: 'Karnataka',
      postalCode: '560100',
      country: 'India',
      taxId: '29ABCDE1234F1Z5',
    },
  });

  const customerGlobex = await prisma.customer.upsert({
    where: { billingEmail: 'finance@globex.org' },
    update: {},
    create: {
      id: 'cust_globex_02',
      businessName: 'Globex Cloud Technologies',
      billingEmail: 'finance@globex.org',
      phone: '+91 91234 56789',
      addressLine1: 'Tech Park South Wing',
      city: 'Hyderabad',
      state: 'Telangana',
      postalCode: '500081',
      country: 'India',
      taxId: '36GHIJK5678L2Z8',
    },
  });

  const customerStark = await prisma.customer.upsert({
    where: { billingEmail: 'accounts@stark.io' },
    update: {},
    create: {
      id: 'cust_stark_03',
      businessName: 'Stark Logistics Pvt Ltd',
      billingEmail: 'accounts@stark.io',
      phone: '+91 98220 11223',
      addressLine1: 'Tower B, Nariman Point',
      city: 'Mumbai',
      state: 'Maharashtra',
      postalCode: '400021',
      country: 'India',
      taxId: '27MNOPQ9012R3Z1',
    },
  });

  // Link portal user to Acme
  await prisma.user.upsert({
    where: { email: 'billing@acme.com' },
    update: {},
    create: {
      id: 'usr_cust_01',
      name: 'Acme Billing Admin',
      email: 'billing@acme.com',
      role: 'CUSTOMER',
      customerId: customerAcme.id,
    },
  });

  // 3. Subscriptions (with various intervals to demonstrate Estimated MRR calculation)
  // Acme: Monthly plan (₹10,000/mo -> 1,000,000 paise)
  const subAcme = await prisma.subscription.upsert({
    where: { subscriptionNo: 'SUB-2026-001' },
    update: {},
    create: {
      subscriptionNo: 'SUB-2026-001',
      customerId: customerAcme.id,
      status: 'ACTIVE',
      planNameSnapshot: 'Enterprise Cloud Suite (Monthly)',
      billingInterval: 'MONTHLY',
      startDate: new Date('2026-01-01'),
      recurringTotalPaise: 1000000, // ₹10,000/mo
      nextBillingAt: new Date('2026-12-01'),
    },
  });

  // Globex: Yearly plan (₹120,000/yr -> 12,000,000 paise; normalized MRR is ₹10,000/mo)
  const subGlobex = await prisma.subscription.upsert({
    where: { subscriptionNo: 'SUB-2026-002' },
    update: {},
    create: {
      subscriptionNo: 'SUB-2026-002',
      customerId: customerGlobex.id,
      status: 'ACTIVE',
      planNameSnapshot: 'Annual Business Backbone',
      billingInterval: 'YEARLY',
      startDate: new Date('2026-06-01'),
      recurringTotalPaise: 12000000, // ₹120,000/yr
      nextBillingAt: new Date('2027-06-01'),
    },
  });

  // Stark: Weekly plan (₹2,500/wk -> 250,000 paise; normalized MRR is ₹2,500 * 52 / 12 = ₹10,833.33)
  const subStark = await prisma.subscription.upsert({
    where: { subscriptionNo: 'SUB-2026-003' },
    update: {},
    create: {
      subscriptionNo: 'SUB-2026-003',
      customerId: customerStark.id,
      status: 'ACTIVE',
      planNameSnapshot: 'Weekly High-Volume Sync',
      billingInterval: 'WEEKLY',
      startDate: new Date('2026-09-01'),
      recurringTotalPaise: 250000, // ₹2,500/week
      nextBillingAt: new Date('2026-11-07'),
    },
  });

  // 4. Invoices
  // Invoice 1: Acme - CONFIRMED with Partial Payment
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2026-001' },
    update: {},
    create: {
      invoiceNo: 'INV-2026-001',
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      periodStart: new Date('2026-10-01'),
      periodEnd: new Date('2026-10-31'),
      issuedAt: new Date('2026-10-01'),
      dueAt: new Date('2026-11-15'), // Future due date -> Not overdue
      status: 'CONFIRMED',
      subtotalPaise: 900000,
      taxPaise: 100000,
      totalPaise: 1000000, // ₹10,000
    },
  });

  // Invoice 2: Globex - CONFIRMED and OVERDUE!
  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2026-002' },
    update: {},
    create: {
      invoiceNo: 'INV-2026-002',
      subscriptionId: subGlobex.id,
      customerId: customerGlobex.id,
      periodStart: new Date('2026-09-01'),
      periodEnd: new Date('2026-09-30'),
      issuedAt: new Date('2026-09-01'),
      dueAt: new Date('2026-09-25'), // Past due date -> Overdue!
      status: 'CONFIRMED',
      subtotalPaise: 2500000,
      taxPaise: 250000,
      totalPaise: 2750000, // ₹27,500
    },
  });

  // Invoice 3: Stark - Fully PAID
  const inv3 = await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2026-003' },
    update: {},
    create: {
      invoiceNo: 'INV-2026-003',
      subscriptionId: subStark.id,
      customerId: customerStark.id,
      periodStart: new Date('2026-10-01'),
      periodEnd: new Date('2026-10-07'),
      issuedAt: new Date('2026-10-01'),
      dueAt: new Date('2026-10-10'),
      status: 'PAID',
      subtotalPaise: 250000,
      taxPaise: 0,
      totalPaise: 250000, // ₹2,500
      paidAt: new Date('2026-10-05'),
    },
  });

  // Invoice 4: Acme - DRAFT invoice (not yet issued)
  await prisma.invoice.upsert({
    where: { invoiceNo: 'INV-2026-004' },
    update: {},
    create: {
      invoiceNo: 'INV-2026-004',
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      periodStart: new Date('2026-11-01'),
      periodEnd: new Date('2026-11-30'),
      issuedAt: new Date('2026-11-01'),
      dueAt: new Date('2026-11-20'),
      status: 'DRAFT',
      subtotalPaise: 1000000,
      taxPaise: 100000,
      totalPaise: 1100000,
    },
  });

  // Invoice Lines for Inv 1
  await prisma.invoiceLine.createMany({
    data: [
      {
        invoiceId: inv1.id,
        description: 'Enterprise Cloud Core - 10 Seats',
        quantity: 10,
        unitPricePaise: 80000,
        taxPaise: 80000,
        totalPaise: 880000,
      },
      {
        invoiceId: inv1.id,
        description: 'Premium SLA Add-on',
        quantity: 1,
        unitPricePaise: 100000,
        taxPaise: 20000,
        totalPaise: 120000,
      },
    ],
  });

  // 5. Payments
  // Partial payment for inv1 (Acme paid ₹4,000 of ₹10,000 via UPI)
  await prisma.payment.create({
    data: {
      invoiceId: inv1.id,
      recordedByUserId: staffJoe.id,
      amountPaise: 400000, // ₹4,000
      method: 'UPI',
      paidAt: new Date('2026-10-10T14:30:00Z'),
      reference: 'UPI-ACME-4000-01',
      note: 'Part payment 1 received via GPay',
    },
  });

  // Full payment for inv3 (Stark paid ₹2,500 via Bank Transfer)
  await prisma.payment.create({
    data: {
      invoiceId: inv3.id,
      recordedByUserId: staffJoe.id,
      amountPaise: 250000, // ₹2,500
      method: 'BANK_TRANSFER',
      paidAt: new Date('2026-10-05T11:00:00Z'),
      reference: 'HDFC-NEFT-99120',
      note: 'Full settlement for week 1',
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
