import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const UserRole = { ADMIN: "ADMIN", STAFF: "STAFF", CUSTOMER: "CUSTOMER" } as const;
const BillingInterval = { DAILY: "DAILY", WEEKLY: "WEEKLY", MONTHLY: "MONTHLY", YEARLY: "YEARLY" } as const;
const SubscriptionStatus = { DRAFT: "DRAFT", QUOTATION: "QUOTATION", CONFIRMED: "CONFIRMED", ACTIVE: "ACTIVE", PAUSED: "PAUSED", CLOSED: "CLOSED", EXPIRED: "EXPIRED", CANCELLED: "CANCELLED" } as const;
const InvoiceStatus = { DRAFT: "DRAFT", CONFIRMED: "CONFIRMED", PAID: "PAID", CANCELLED: "CANCELLED" } as const;
const PaymentMethod = { BANK_TRANSFER: "BANK_TRANSFER", CASH: "CASH", CARD: "CARD", UPI: "UPI", OTHER: "OTHER" } as const;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting PLANZO database seeding...");

  // 1. Bootstrap Admin Account (Amal's Foundation)
  const adminName = process.env.ADMIN_NAME || "PLANZO Admin";
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@PLANZO.io").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword123!";

  console.log(`Checking bootstrap admin account: ${adminEmail}...`);
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
        password: adminPassword,
        role: UserRole.ADMIN,
      },
    });
    console.log(`✅ Admin account created successfully: ${admin.email} (ID: ${admin.id})`);
  } else {
    console.log(`ℹ️ Admin account already exists: ${existingAdmin.email} (ID: ${existingAdmin.id}) - Skipping creation.`);
  }

  // 2. Default Tax Rule (Amal's Foundation)
  const existingTax = await prisma.taxRule.findFirst({
    where: { name: "GST Standard 18%" },
  });

  if (!existingTax) {
    const tax = await prisma.taxRule.create({
      data: {
        name: "GST Standard 18%",
        rate: 1800, // 1800 basis points = 18.00%
        active: true,
      },
    });
    console.log(`✅ Default Tax Rule created: ${tax.name} (Rate: ${tax.rate} bps)`);
  } else {
    console.log(`ℹ️ Default Tax Rule already exists: ${existingTax.name}`);
  }

  // 3. Staff and Admin Users (Joe's Data)
  const staffHash = await bcrypt.hash("StaffPassword123!", 12);
  const staffJoe = await prisma.user.upsert({
    where: { email: "joe.finance@PLANZO.com" },
    update: {},
    create: {
      id: "usr_staff_01",
      name: "Joe Finance Lead",
      email: "joe.finance@PLANZO.com",
      passwordHash: staffHash,
      password: "StaffPassword123!",
      role: UserRole.STAFF,
    },
  });

  const adminLevin = await prisma.user.upsert({
    where: { email: "admin@PLANZO.com" },
    update: {},
    create: {
      id: "usr_admin_01",
      name: "Levin Admin",
      email: "admin@PLANZO.com",
      passwordHash: staffHash,
      password: "AdminPassword123!",
      role: UserRole.ADMIN,
    },
  });

  // 4. Customers (Joe's Data)
  const customerAcme = await prisma.customer.upsert({
    where: { email: "billing@acme.com" },
    update: {},
    create: {
      id: "cust_acme_01",
      companyName: "Acme Enterprise Solutions",
      businessName: "Acme Enterprise Solutions",
      contactName: "Acme Billing Contact",
      email: "billing@acme.com",
      billingEmail: "billing@acme.com",
      phone: "+91 98765 43210",
      address: "401 Cyber City, Phase 2, Bangalore",
      addressLine1: "401 Cyber City, Phase 2",
      city: "Bangalore",
      state: "Karnataka",
      postalCode: "560100",
      country: "India",
      taxId: "29ABCDE1234F1Z5",
      taxIdentifier: "29ABCDE1234F1Z5",
    },
  });

  const customerGlobex = await prisma.customer.upsert({
    where: { email: "finance@globex.org" },
    update: {},
    create: {
      id: "cust_globex_02",
      companyName: "Globex Cloud Technologies",
      businessName: "Globex Cloud Technologies",
      contactName: "Globex Finance Contact",
      email: "finance@globex.org",
      billingEmail: "finance@globex.org",
      phone: "+91 91234 56789",
      address: "Tech Park South Wing, Hyderabad",
      addressLine1: "Tech Park South Wing",
      city: "Hyderabad",
      state: "Telangana",
      postalCode: "500081",
      country: "India",
      taxId: "36GHIJK5678L2Z8",
      taxIdentifier: "36GHIJK5678L2Z8",
    },
  });

  const customerStark = await prisma.customer.upsert({
    where: { email: "accounts@stark.io" },
    update: {},
    create: {
      id: "cust_stark_03",
      companyName: "Stark Logistics Pvt Ltd",
      businessName: "Stark Logistics Pvt Ltd",
      contactName: "Stark Accounts Contact",
      email: "accounts@stark.io",
      billingEmail: "accounts@stark.io",
      phone: "+91 98220 11223",
      address: "Tower B, Nariman Point, Mumbai",
      addressLine1: "Tower B, Nariman Point",
      city: "Mumbai",
      state: "Maharashtra",
      postalCode: "400021",
      country: "India",
      taxId: "27MNOPQ9012R3Z1",
      taxIdentifier: "27MNOPQ9012R3Z1",
    },
  });

  // Link portal user to Acme
  await prisma.user.upsert({
    where: { email: "billing@acme.com" },
    update: {},
    create: {
      id: "usr_cust_01",
      name: "Acme Billing Admin",
      email: "billing@acme.com",
      passwordHash: staffHash,
      password: "CustomerPassword123!",
      role: UserRole.CUSTOMER,
      customerId: customerAcme.id,
    },
  });

  // 5. Plans & Subscriptions
  const planMonthly = await prisma.plan.upsert({
    where: { code: "PLAN-ENT-MONTHLY" },
    update: {},
    create: {
      id: "plan_monthly_01",
      code: "PLAN-ENT-MONTHLY",
      name: "Enterprise Cloud Suite (Monthly)",
      pricePaise: 1000000,
      basePricePaise: 1000000,
      basePrice: 1000000,
      billingInterval: "MONTHLY",
    },
  });

  const planAnnual = await prisma.plan.upsert({
    where: { code: "PLAN-BUS-ANNUAL" },
    update: {},
    create: {
      id: "plan_annual_01",
      code: "PLAN-BUS-ANNUAL",
      name: "Annual Business Backbone",
      pricePaise: 12000000,
      basePricePaise: 12000000,
      basePrice: 12000000,
      billingInterval: "YEARLY",
    },
  });

  const planWeekly = await prisma.plan.upsert({
    where: { code: "PLAN-SYNC-WEEKLY" },
    update: {},
    create: {
      id: "plan_weekly_01",
      code: "PLAN-SYNC-WEEKLY",
      name: "Weekly High-Volume Sync",
      pricePaise: 250000,
      basePricePaise: 250000,
      basePrice: 250000,
      billingInterval: "WEEKLY",
    },
  });

  // Acme: Monthly plan (₹10,000/mo -> 1,000,000 paise)
  const subAcme = await prisma.subscription.upsert({
    where: { subscriptionNo: "SUB-2026-001" },
    update: {},
    create: {
      subscriptionNo: "SUB-2026-001",
      customerId: customerAcme.id,
      planId: planMonthly.id,
      planPricePaise: 1000000,
      status: SubscriptionStatus.ACTIVE,
      planNameSnapshot: "Enterprise Cloud Suite (Monthly)",
      billingInterval: BillingInterval.MONTHLY,
      startDate: new Date("2026-01-01"),
      recurringTotalPaise: 1000000, // ₹10,000/mo
      nextBillingAt: new Date("2026-12-01"),
    },
  });

  // Globex: Yearly plan (₹120,000/yr -> 12,000,000 paise)
  const subGlobex = await prisma.subscription.upsert({
    where: { subscriptionNo: "SUB-2026-002" },
    update: {},
    create: {
      subscriptionNo: "SUB-2026-002",
      customerId: customerGlobex.id,
      planId: planAnnual.id,
      planPricePaise: 12000000,
      status: SubscriptionStatus.ACTIVE,
      planNameSnapshot: "Annual Business Backbone",
      billingInterval: BillingInterval.YEARLY,
      startDate: new Date("2026-06-01"),
      recurringTotalPaise: 12000000, // ₹120,000/yr
      nextBillingAt: new Date("2027-06-01"),
    },
  });

  // Stark: Weekly plan (₹2,500/wk -> 250,000 paise)
  const subStark = await prisma.subscription.upsert({
    where: { subscriptionNo: "SUB-2026-003" },
    update: {},
    create: {
      subscriptionNo: "SUB-2026-003",
      customerId: customerStark.id,
      planId: planWeekly.id,
      planPricePaise: 250000,
      status: SubscriptionStatus.ACTIVE,
      planNameSnapshot: "Weekly High-Volume Sync",
      billingInterval: BillingInterval.WEEKLY,
      startDate: new Date("2026-09-01"),
      recurringTotalPaise: 250000, // ₹2,500/week
      nextBillingAt: new Date("2026-11-07"),
    },
  });

  // 6. Invoices
  // Invoice 1: Acme - CONFIRMED with Partial Payment
  const inv1 = await prisma.invoice.upsert({
    where: { invoiceNo: "INV-2026-001" },
    update: {},
    create: {
      invoiceNo: "INV-2026-001",
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      periodStart: new Date("2026-10-01"),
      periodEnd: new Date("2026-10-31"),
      issuedAt: new Date("2026-10-01"),
      dueAt: new Date("2026-11-15"),
      status: InvoiceStatus.CONFIRMED,
      subtotalPaise: 900000,
      taxPaise: 100000,
      totalPaise: 1000000, // ₹10,000
    },
  });

  // Invoice 2: Globex - CONFIRMED and OVERDUE
  const inv2 = await prisma.invoice.upsert({
    where: { invoiceNo: "INV-2026-002" },
    update: {},
    create: {
      invoiceNo: "INV-2026-002",
      subscriptionId: subGlobex.id,
      customerId: customerGlobex.id,
      periodStart: new Date("2026-09-01"),
      periodEnd: new Date("2026-09-30"),
      issuedAt: new Date("2026-09-01"),
      dueAt: new Date("2026-09-25"), // Past due date -> Overdue!
      status: InvoiceStatus.CONFIRMED,
      subtotalPaise: 2500000,
      taxPaise: 250000,
      totalPaise: 2750000, // ₹27,500
    },
  });

  // Invoice 3: Stark - Fully PAID
  const inv3 = await prisma.invoice.upsert({
    where: { invoiceNo: "INV-2026-003" },
    update: {},
    create: {
      invoiceNo: "INV-2026-003",
      subscriptionId: subStark.id,
      customerId: customerStark.id,
      periodStart: new Date("2026-10-01"),
      periodEnd: new Date("2026-10-07"),
      issuedAt: new Date("2026-10-01"),
      dueAt: new Date("2026-10-10"),
      status: InvoiceStatus.PAID,
      subtotalPaise: 250000,
      taxPaise: 0,
      totalPaise: 250000, // ₹2,500
      paidAt: new Date("2026-10-05"),
    },
  });

  // Invoice 4: Acme - DRAFT invoice
  await prisma.invoice.upsert({
    where: { invoiceNo: "INV-2026-004" },
    update: {},
    create: {
      invoiceNo: "INV-2026-004",
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      periodStart: new Date("2026-11-01"),
      periodEnd: new Date("2026-11-30"),
      issuedAt: new Date("2026-11-01"),
      dueAt: new Date("2026-11-20"),
      status: InvoiceStatus.DRAFT,
      subtotalPaise: 1000000,
      taxPaise: 100000,
      totalPaise: 1100000,
    },
  });

  // Invoice Lines for Inv 1 (only create if none exist for inv1)
  const existingLines = await prisma.invoiceLine.count({
    where: { invoiceId: inv1.id },
  });

  if (existingLines === 0) {
    await prisma.invoiceLine.createMany({
      data: [
        {
          invoiceId: inv1.id,
          descriptionSnapshot: "Enterprise Cloud Core - 10 Seats",
          quantity: 10,
          unitPricePaise: 80000,
          subtotalPaise: 800000,
          taxablePaise: 800000,
          taxRateBps: 1000,
          taxPaise: 80000,
          totalPaise: 880000,
        },
        {
          invoiceId: inv1.id,
          descriptionSnapshot: "Premium SLA Add-on",
          quantity: 1,
          unitPricePaise: 100000,
          subtotalPaise: 100000,
          taxablePaise: 100000,
          taxRateBps: 2000,
          taxPaise: 20000,
          totalPaise: 120000,
        },
      ],
    });
  }

  // 7. Payments (only create if not existing)
  const existingPayments = await prisma.payment.count({
    where: { invoiceId: inv1.id },
  });

  if (existingPayments === 0) {
    await prisma.payment.create({
      data: {
        invoiceId: inv1.id,
        recordedByUserId: staffJoe.id,
        amount: 400000,
        amountPaise: 400000, // ₹4,000
        paymentMethod: PaymentMethod.UPI,
        method: PaymentMethod.UPI,
        paidAt: new Date("2026-10-10T14:30:00Z"),
        reference: "UPI-ACME-4000-01",
        note: "Part payment 1 received via GPay",
      },
    });
  }

  const existingPaymentsInv3 = await prisma.payment.count({
    where: { invoiceId: inv3.id },
  });

  if (existingPaymentsInv3 === 0) {
    await prisma.payment.create({
      data: {
        invoiceId: inv3.id,
        recordedByUserId: staffJoe.id,
        amount: 250000,
        amountPaise: 250000, // ₹2,500
        paymentMethod: PaymentMethod.BANK_TRANSFER,
        method: PaymentMethod.BANK_TRANSFER,
        paidAt: new Date("2026-10-05T11:00:00Z"),
        reference: "HDFC-NEFT-99120",
        note: "Full settlement for week 1",
      },
    });
  }

  console.log("✅ Database seeded successfully with foundation accounts and financial records!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
