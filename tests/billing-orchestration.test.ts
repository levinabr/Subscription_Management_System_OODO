import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import prisma from '@/lib/db/prisma';
import { BillingService } from '@/services/billing/billing-service';
import { DiscountService } from '@/services/discount/discount-service';
import { toUtcDateOnly } from '@/lib/billing/billing-dates';

describe('Billing Run Orchestration & Idempotency', () => {
  let customerId: string;
  let planId: string;
  let productId: string;

  beforeEach(async () => {
    // Clear test tables in reverse foreign key order
    await prisma.invoiceLine.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.subscriptionLine.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.productDiscountLink.deleteMany();
    await prisma.discountRule.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.plan.deleteMany();
    await prisma.product.deleteMany();

    // Create shared customer, plan, and product
    const customer = await prisma.customer.create({
      data: {
        name: 'Acme Corp',
        email: 'billing@acme.test',
        company: 'Acme Industrial',
        address: '100 Industrial Road',
      },
    });
    customerId = customer.id;

    const plan = await prisma.plan.create({
      data: {
        name: 'Pro Monthly Plan',
        code: 'PRO-M',
        pricePaise: 40000, // ₹400.00
        billingInterval: 'MONTHLY',
        taxRateBps: 1800,
        taxName: 'GST 18%',
      },
    });
    planId = plan.id;

    const product = await prisma.product.create({
      data: {
        name: 'Extra Agent Seat',
        sku: 'AGENT-SEAT',
        salesPricePaise: 15000, // ₹150.00
        taxRateBps: 1800,
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('excludes PAUSED, CLOSED, or DRAFT subscriptions from billing', async () => {
    const asOfDate = new Date('2026-05-01T00:00:00.000Z');

    // Create a PAUSED subscription due on 2026-05-01
    await prisma.subscription.create({
      data: {
        subscriptionNo: 'SUB-PAUSED-1',
        customerId,
        planId,
        status: 'PAUSED',
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
        planNameSnapshot: 'Pro Monthly Plan',
        planPricePaise: 40000,
        billingInterval: 'MONTHLY',
      },
    });

    // Create a DRAFT subscription due on 2026-05-01
    await prisma.subscription.create({
      data: {
        subscriptionNo: 'SUB-DRAFT-1',
        customerId,
        planId,
        status: 'DRAFT',
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
        planNameSnapshot: 'Pro Monthly Plan',
        planPricePaise: 40000,
        billingInterval: 'MONTHLY',
      },
    });

    const preview = await BillingService.previewBilling(asOfDate);
    expect(preview.excludedByStatusCount).toBe(2);
    expect(preview.expectedInvoiceCount).toBe(0);

    const runResult = await BillingService.runBilling(asOfDate);
    expect(runResult.processedCount).toBe(0);
    expect(runResult.totalCount).toBe(0); // None eligible
  });

  it('excludes expired subscriptions whose contract ended before as-of date', async () => {
    const asOfDate = new Date('2026-06-01T00:00:00.000Z');

    await prisma.subscription.create({
      data: {
        subscriptionNo: 'SUB-EXPIRED-1',
        customerId,
        planId,
        status: 'ACTIVE',
        startDate: new Date('2026-01-01T00:00:00.000Z'),
        expiresAt: new Date('2026-05-15T00:00:00.000Z'), // Expired in May
        nextBillingAt: new Date('2026-06-01T00:00:00.000Z'),
        planNameSnapshot: 'Pro Monthly Plan',
        planPricePaise: 40000,
        billingInterval: 'MONTHLY',
      },
    });

    const preview = await BillingService.previewBilling(asOfDate);
    expect(preview.excludedByExpiryCount).toBe(1);
    expect(preview.expectedInvoiceCount).toBe(0);

    const runResult = await BillingService.runBilling(asOfDate);
    expect(runResult.processedCount).toBe(0);
    expect(runResult.skippedCount).toBe(1);
    expect(runResult.results[0].message).toContain('expired');
  });

  it('processes an eligible subscription, creates DRAFT invoice with snapshots, and advances nextBillingAt', async () => {
    const asOfDate = new Date('2026-05-01T00:00:00.000Z');

    const sub = await prisma.subscription.create({
      data: {
        subscriptionNo: 'SUB-ACTIVE-1',
        customerId,
        planId,
        status: 'ACTIVE',
        startDate: new Date('2026-04-01T00:00:00.000Z'),
        nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
        planNameSnapshot: 'Pro Monthly Plan',
        planPricePaise: 40000,
        planTaxRateBps: 1800,
        billingInterval: 'MONTHLY',
        paymentTermsDays: 15,
        lines: {
          create: [
            {
              productId,
              descriptionSnapshot: 'Extra Agent Seat',
              quantity: 2,
              unitPricePaise: 15000,
              taxRateBps: 1800,
            },
          ],
        },
      },
    });

    const runResult = await BillingService.runBilling(asOfDate);
    expect(runResult.processedCount).toBe(1);
    expect(runResult.failedCount).toBe(0);

    // Verify invoice created
    const invoice = await prisma.invoice.findFirst({
      where: { subscriptionId: sub.id },
      include: { lines: true },
    });

    expect(invoice).toBeDefined();
    expect(invoice?.status).toBe('DRAFT');
    expect(invoice?.periodStart.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(invoice?.periodEnd.toISOString()).toBe('2026-05-31T23:59:59.999Z');

    // Subtotal = 40000 (plan) + 2*15000 = 70000 (₹700.00)
    expect(invoice?.subtotalPaise).toBe(70000);
    // Tax = 70000 * 1800 / 10000 = 12600
    expect(invoice?.taxPaise).toBe(12600);
    expect(invoice?.totalPaise).toBe(82600);

    // Lines count = 1 plan + 1 product = 2 lines
    expect(invoice?.lines).toHaveLength(2);

    // Verify nextBillingAt advanced by 1 month to June 1, 2026
    const updatedSub = await prisma.subscription.findUnique({ where: { id: sub.id } });
    expect(updatedSub?.nextBillingAt.toISOString()).toBe('2026-06-01T00:00:00.000Z');
  });

  it('prevents duplicate billing and guarantees idempotency when run is repeated', async () => {
    const asOfDate = new Date('2026-05-01T00:00:00.000Z');

    const sub = await prisma.subscription.create({
      data: {
        subscriptionNo: 'SUB-DUP-TEST',
        customerId,
        planId,
        status: 'ACTIVE',
        startDate: new Date('2026-04-01T00:00:00.000Z'),
        nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
        planNameSnapshot: 'Pro Monthly Plan',
        planPricePaise: 40000,
        billingInterval: 'MONTHLY',
      },
    });

    // First billing run: processes successfully
    const firstRun = await BillingService.runBilling(asOfDate);
    expect(firstRun.processedCount).toBe(1);

    // Reset nextBillingAt back to 2026-05-01 to simulate duplicate run attempt for same period
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { nextBillingAt: new Date('2026-05-01T00:00:00.000Z') },
    });

    // Second billing run: must SKIPPED cleanly due to existing invoice and unique constraint
    const secondRun = await BillingService.runBilling(asOfDate);
    expect(secondRun.processedCount).toBe(0);
    expect(secondRun.skippedCount).toBe(1);
    expect(secondRun.results[0].message).toContain('Already invoiced');

    // Verify exactly ONE invoice exists for this subscription
    const invoiceCount = await prisma.invoice.count({ where: { subscriptionId: sub.id } });
    expect(invoiceCount).toBe(1);
  });

  it('handles two concurrent billing requests without creating duplicates', async () => {
    const asOfDate = new Date('2026-05-01T00:00:00.000Z');

    const sub = await prisma.subscription.create({
      data: {
        subscriptionNo: 'SUB-CONCURRENT-1',
        customerId,
        planId,
        status: 'ACTIVE',
        startDate: new Date('2026-04-01T00:00:00.000Z'),
        nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
        planNameSnapshot: 'Pro Monthly Plan',
        planPricePaise: 40000,
        billingInterval: 'MONTHLY',
      },
    });

    // Trigger two runs concurrently in parallel
    const [runA, runB] = await Promise.all([
      BillingService.runBilling(asOfDate, sub.id),
      BillingService.runBilling(asOfDate, sub.id),
    ]);

    const totalProcessed = runA.processedCount + runB.processedCount;
    const totalSkipped = runA.skippedCount + runB.skippedCount;

    // Exactly one must succeed, and one must be skipped
    expect(totalProcessed).toBe(1);
    expect(totalSkipped).toBe(1);

    const invoices = await prisma.invoice.findMany({ where: { subscriptionId: sub.id } });
    expect(invoices).toHaveLength(1);
  });

  describe('Discount Usage Limits and Transaction Safety', () => {
    it('applies discount and atomically increments usedCount', async () => {
      const asOfDate = new Date('2026-05-01T00:00:00.000Z');

      const discount = await prisma.discountRule.create({
        data: {
          name: 'Limited 10 Uses 10%',
          type: 'PERCENTAGE',
          scope: 'SUBSCRIPTION',
          value: 1000, // 10%
          startsAt: new Date('2026-01-01T00:00:00.000Z'),
          endsAt: new Date('2026-12-31T00:00:00.000Z'),
          usageLimit: 10,
          usedCount: 0,
          isActive: true,
        },
      });

      await prisma.subscription.create({
        data: {
          subscriptionNo: 'SUB-DISC-1',
          customerId,
          planId,
          status: 'ACTIVE',
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
          planNameSnapshot: 'Pro Monthly Plan',
          planPricePaise: 40000,
          billingInterval: 'MONTHLY',
        },
      });

      const result = await BillingService.runBilling(asOfDate);
      expect(result.processedCount).toBe(1);

      // Verify discount usedCount incremented to 1
      const updatedDiscount = await prisma.discountRule.findUnique({ where: { id: discount.id } });
      expect(updatedDiscount?.usedCount).toBe(1);
    });

    it('does not apply an exhausted discount where usedCount equals usageLimit', async () => {
      const asOfDate = new Date('2026-05-01T00:00:00.000Z');

      // Exhausted discount (usedCount == usageLimit == 1)
      await prisma.discountRule.create({
        data: {
          name: 'Exhausted Promo',
          type: 'PERCENTAGE',
          scope: 'SUBSCRIPTION',
          value: 2000,
          startsAt: new Date('2026-01-01T00:00:00.000Z'),
          endsAt: new Date('2026-12-31T00:00:00.000Z'),
          usageLimit: 1,
          usedCount: 1, // Already reached limit
          isActive: true,
        },
      });

      const sub = await prisma.subscription.create({
        data: {
          subscriptionNo: 'SUB-EXHAUSTED-TEST',
          customerId,
          planId,
          status: 'ACTIVE',
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          nextBillingAt: new Date('2026-05-01T00:00:00.000Z'),
          planNameSnapshot: 'Pro Monthly Plan',
          planPricePaise: 40000,
          billingInterval: 'MONTHLY',
        },
      });

      const result = await BillingService.runBilling(asOfDate);
      expect(result.processedCount).toBe(1);

      // Verify invoice generated with 0 discount
      const invoice = await prisma.invoice.findFirst({ where: { subscriptionId: sub.id } });
      expect(invoice?.discountPaise).toBe(0);
      expect(invoice?.discountRuleId).toBeNull();
    });

    it('does not apply an expired discount whose endsAt is past as-of date', async () => {
      const asOfDate = new Date('2026-06-01T00:00:00.000Z');

      await prisma.discountRule.create({
        data: {
          name: 'Past Promo',
          type: 'PERCENTAGE',
          scope: 'SUBSCRIPTION',
          value: 2000,
          startsAt: new Date('2026-01-01T00:00:00.000Z'),
          endsAt: new Date('2026-05-01T00:00:00.000Z'), // Expired in May
          usageLimit: 100,
          usedCount: 0,
          isActive: true,
        },
      });

      const sub = await prisma.subscription.create({
        data: {
          subscriptionNo: 'SUB-EXP-DISC-TEST',
          customerId,
          planId,
          status: 'ACTIVE',
          startDate: new Date('2026-04-01T00:00:00.000Z'),
          nextBillingAt: new Date('2026-06-01T00:00:00.000Z'),
          planNameSnapshot: 'Pro Monthly Plan',
          planPricePaise: 40000,
          billingInterval: 'MONTHLY',
        },
      });

      const result = await BillingService.runBilling(asOfDate);
      expect(result.processedCount).toBe(1);

      const invoice = await prisma.invoice.findFirst({ where: { subscriptionId: sub.id } });
      expect(invoice?.discountPaise).toBe(0);
    });

    it('rolls back discount usage increment if invoice creation fails in the transaction', async () => {
      const discount = await prisma.discountRule.create({
        data: {
          name: 'Rollback Test Rule',
          type: 'FIXED',
          scope: 'SUBSCRIPTION',
          value: 5000,
          startsAt: new Date('2026-01-01T00:00:00.000Z'),
          endsAt: new Date('2026-12-31T00:00:00.000Z'),
          usageLimit: 5,
          usedCount: 0,
          isActive: true,
        },
      });

      // Execute a transaction that increments usage and then fails
      await expect(
        prisma.$transaction(async (tx) => {
          const success = await DiscountService.tryIncrementUsageTransactional(tx, discount.id);
          expect(success).toBe(true);

          // Simulate database error / constraint failure
          throw new Error('Forced transaction failure for rollback test');
        })
      ).rejects.toThrow('Forced transaction failure');

      // Verify discount usedCount was rolled back to 0!
      const currentDiscount = await prisma.discountRule.findUnique({ where: { id: discount.id } });
      expect(currentDiscount?.usedCount).toBe(0);
    });
  });
});
