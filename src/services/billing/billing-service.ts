import prisma from '@/lib/db/prisma';
import {
  calculateDueDate,
  getBillingPeriod,
  getNextBillingDate,
  toUtcDateOnly,
} from '@/lib/billing/billing-dates';
import {
  calculateInvoice,
  DiscountRuleInput,
  evaluateDiscountSavings,
  selectBestDiscountRule,
} from '@/lib/billing/invoice-calculator';
import { DiscountService } from '@/services/discount/discount-service';
import { Prisma } from '@prisma/client';

export interface BillingPreviewItem {
  subscriptionId: string;
  subscriptionNo: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  status: string;
  periodStart: Date;
  periodEnd: Date;
  nextBillingAt: Date;
  estimatedTotalPaise: number;
  eligible: boolean;
  exclusionReason?: string;
}

export interface BillingPreviewResult {
  asOfDate: Date;
  totalSubscriptionsChecked: number;
  dueCount: number;
  alreadyInvoicedCount: number;
  excludedByStatusCount: number;
  excludedByExpiryCount: number;
  expectedInvoiceCount: number;
  items: BillingPreviewItem[];
}

export interface BillingRunResultItem {
  subscriptionId: string;
  subscriptionNo: string;
  status: 'PROCESSED' | 'SKIPPED' | 'FAILED';
  invoiceId?: string;
  invoiceNo?: string;
  totalPaise?: number;
  discountPaise?: number;
  message?: string;
}

export interface BillingRunResult {
  asOfDate: Date;
  processedCount: number;
  skippedCount: number;
  failedCount: number;
  totalCount: number;
  results: BillingRunResultItem[];
}

export class BillingService {
  /**
   * Generates a preview of subscriptions due for billing as of a specific date.
   * Pure read-only operation: does not mutate state or generate invoices.
   */
  static async previewBilling(
    asOfDateInput?: Date | string,
    filterSubscriptionId?: string
  ): Promise<BillingPreviewResult> {
    const asOfDate = asOfDateInput ? toUtcDateOnly(asOfDateInput) : toUtcDateOnly(new Date());

    const where: Prisma.SubscriptionWhereInput = {};
    if (filterSubscriptionId) {
      where.id = filterSubscriptionId;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        nextBillingAt: 'asc',
      },
    });

    let dueCount = 0;
    let alreadyInvoicedCount = 0;
    let excludedByStatusCount = 0;
    let excludedByExpiryCount = 0;
    let expectedInvoiceCount = 0;

    const items: BillingPreviewItem[] = [];

    // Pre-load active candidate discounts for estimation
    const activeDiscounts = await DiscountService.getActiveCandidateRules(asOfDate);
    const candidateRuleInputs: DiscountRuleInput[] = activeDiscounts.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type as 'FIXED' | 'PERCENTAGE',
      scope: r.scope as 'PRODUCT' | 'SUBSCRIPTION',
      value: r.value,
      minPurchasePaise: r.minPurchasePaise,
      minQuantity: r.minQuantity,
      eligibleProductIds: r.eligibleProducts.map((p) => p.productId),
    }));

    for (const sub of subscriptions) {
      const nextBilling = toUtcDateOnly(sub.nextBillingAt);
      const isDue = nextBilling.getTime() <= asOfDate.getTime();

      if (isDue) {
        dueCount++;
      }

      // Check status
      if (sub.status !== 'ACTIVE') {
        excludedByStatusCount++;
        items.push({
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          customerId: sub.customerId,
          customerName: sub.customer.name,
          customerEmail: sub.customer.email,
          status: sub.status,
          periodStart: nextBilling,
          periodEnd: getNextBillingDate(nextBilling, sub.billingInterval),
          nextBillingAt: sub.nextBillingAt,
          estimatedTotalPaise: 0,
          eligible: false,
          exclusionReason: `Subscription status is ${sub.status} (only ACTIVE is eligible)`,
        });
        continue;
      }

      // Check contract expiry
      if (sub.expiresAt && toUtcDateOnly(sub.expiresAt).getTime() < asOfDate.getTime()) {
        excludedByExpiryCount++;
        items.push({
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          customerId: sub.customerId,
          customerName: sub.customer.name,
          customerEmail: sub.customer.email,
          status: sub.status,
          periodStart: nextBilling,
          periodEnd: getNextBillingDate(nextBilling, sub.billingInterval),
          nextBillingAt: sub.nextBillingAt,
          estimatedTotalPaise: 0,
          eligible: false,
          exclusionReason: `Contract expired on ${sub.expiresAt.toISOString()}`,
        });
        continue;
      }

      if (!isDue) {
        items.push({
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          customerId: sub.customerId,
          customerName: sub.customer.name,
          customerEmail: sub.customer.email,
          status: sub.status,
          periodStart: nextBilling,
          periodEnd: getNextBillingDate(nextBilling, sub.billingInterval),
          nextBillingAt: sub.nextBillingAt,
          estimatedTotalPaise: 0,
          eligible: false,
          exclusionReason: `Next billing date ${sub.nextBillingAt.toISOString()} is after as-of date ${asOfDate.toISOString()}`,
        });
        continue;
      }

      // Calculate period
      const { periodStart, periodEnd } = getBillingPeriod(sub.nextBillingAt, sub.billingInterval);

      // Check if already invoiced for this period
      const existingInvoice = await prisma.invoice.findUnique({
        where: {
          subscriptionId_periodStart: {
            subscriptionId: sub.id,
            periodStart,
          },
        },
      });

      if (existingInvoice) {
        alreadyInvoicedCount++;
        items.push({
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          customerId: sub.customerId,
          customerName: sub.customer.name,
          customerEmail: sub.customer.email,
          status: sub.status,
          periodStart,
          periodEnd,
          nextBillingAt: sub.nextBillingAt,
          estimatedTotalPaise: existingInvoice.totalPaise,
          eligible: false,
          exclusionReason: `Already invoiced for period starting ${periodStart.toISOString()} (Invoice: ${existingInvoice.invoiceNo})`,
        });
        continue;
      }

      // Estimate invoice totals
      const bestDiscount = selectBestDiscountRule(
        candidateRuleInputs,
        sub.planPricePaise,
        sub.lines
      );

      const totals = calculateInvoice(
        {
          planNameSnapshot: sub.planNameSnapshot,
          planPricePaise: sub.planPricePaise,
          planTaxRateBps: sub.planTaxRateBps,
          lines: sub.lines,
        },
        bestDiscount.selectedRule
          ? {
              rule: bestDiscount.selectedRule,
              savingsPaise: bestDiscount.savingsPaise,
              eligibleLineIndices: bestDiscount.eligibleLineIndices,
            }
          : null
      );

      expectedInvoiceCount++;
      items.push({
        subscriptionId: sub.id,
        subscriptionNo: sub.subscriptionNo,
        customerId: sub.customerId,
        customerName: sub.customer.name,
        customerEmail: sub.customer.email,
        status: sub.status,
        periodStart,
        periodEnd,
        nextBillingAt: sub.nextBillingAt,
        estimatedTotalPaise: totals.totalPaise,
        eligible: true,
      });
    }

    return {
      asOfDate,
      totalSubscriptionsChecked: subscriptions.length,
      dueCount,
      alreadyInvoicedCount,
      excludedByStatusCount,
      excludedByExpiryCount,
      expectedInvoiceCount,
      items,
    };
  }

  /**
   * Executes the recurring billing run idempotently.
   * Processes each eligible subscription inside an isolated transaction.
   * Duplicate billing is prevented by @@unique([subscriptionId, periodStart]).
   */
  static async runBilling(
    asOfDateInput?: Date | string,
    filterSubscriptionId?: string
  ): Promise<BillingRunResult> {
    const asOfDate = asOfDateInput ? toUtcDateOnly(asOfDateInput) : toUtcDateOnly(new Date());

    const where: Prisma.SubscriptionWhereInput = {
      status: 'ACTIVE',
      nextBillingAt: { lte: asOfDate },
    };
    if (filterSubscriptionId) {
      where.id = filterSubscriptionId;
    }

    const eligibleSubscriptions = await prisma.subscription.findMany({
      where,
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        nextBillingAt: 'asc',
      },
    });

    const results: BillingRunResultItem[] = [];
    let processedCount = 0;
    let skippedCount = 0;
    let failedCount = 0;

    for (const sub of eligibleSubscriptions) {
      try {
        const result = await this.processSingleSubscriptionBilling(sub, asOfDate);
        results.push(result);
        if (result.status === 'PROCESSED') processedCount++;
        else if (result.status === 'SKIPPED') skippedCount++;
        else failedCount++;
      } catch (err: unknown) {
        failedCount++;
        const errorMessage = err instanceof Error ? err.message : 'Unknown billing execution error';
        results.push({
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          status: 'FAILED',
          message: errorMessage,
        });
      }
    }

    return {
      asOfDate,
      processedCount,
      skippedCount,
      failedCount,
      totalCount: eligibleSubscriptions.length,
      results,
    };
  }

  /**
   * Processes billing for a single subscription in an isolated transaction.
   */
  private static async processSingleSubscriptionBilling(
    sub: Prisma.SubscriptionGetPayload<{
      include: { customer: true; lines: { include: { product: true } } };
    }>,
    asOfDate: Date
  ): Promise<BillingRunResultItem> {
    // 1. Contract expiry check
    if (sub.expiresAt && toUtcDateOnly(sub.expiresAt).getTime() < asOfDate.getTime()) {
      return {
        subscriptionId: sub.id,
        subscriptionNo: sub.subscriptionNo,
        status: 'SKIPPED',
        message: 'Contract has expired',
      };
    }

    // 2. Billing period
    const { periodStart, periodEnd } = getBillingPeriod(sub.nextBillingAt, sub.billingInterval);

    // 3. Check for existing invoice prior to transaction to avoid unnecessary work
    const existing = await prisma.invoice.findUnique({
      where: {
        subscriptionId_periodStart: {
          subscriptionId: sub.id,
          periodStart,
        },
      },
    });
    if (existing) {
      return {
        subscriptionId: sub.id,
        subscriptionNo: sub.subscriptionNo,
        status: 'SKIPPED',
        invoiceId: existing.id,
        invoiceNo: existing.invoiceNo,
        message: 'Already invoiced for this billing period',
      };
    }

    // 4. Candidate discount rules
    const activeDiscounts = await DiscountService.getActiveCandidateRules(asOfDate);
    const candidateRuleInputs: DiscountRuleInput[] = activeDiscounts.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type as 'FIXED' | 'PERCENTAGE',
      scope: r.scope as 'PRODUCT' | 'SUBSCRIPTION',
      value: r.value,
      minPurchasePaise: r.minPurchasePaise,
      minQuantity: r.minQuantity,
      eligibleProductIds: r.eligibleProducts.map((p) => p.productId),
    }));

    // 5. Run transactional creation
    try {
      return await prisma.$transaction(async (tx) => {
        // Double check existing invoice inside transaction for concurrent protection
        const existingInTx = await tx.invoice.findUnique({
          where: {
            subscriptionId_periodStart: {
              subscriptionId: sub.id,
              periodStart,
            },
          },
        });
        if (existingInTx) {
          return {
            subscriptionId: sub.id,
            subscriptionNo: sub.subscriptionNo,
            status: 'SKIPPED',
            invoiceId: existingInTx.id,
            invoiceNo: existingInTx.invoiceNo,
            message: 'Already invoiced for this billing period (concurrent)',
          };
        }

        // Evaluate candidate discounts in order of savings
        const candidateEvaluations = candidateRuleInputs
          .map((rule) => {
            const evaluation = evaluateDiscountSavings(rule, sub.planPricePaise, sub.lines);
            return {
              rule,
              ...evaluation,
            };
          })
          .filter((e) => e.isEligible && e.totalSavingsPaise > 0)
          .sort((a, b) => b.totalSavingsPaise - a.totalSavingsPaise);

        let appliedDiscount: {
          rule: DiscountRuleInput;
          savingsPaise: number;
          eligibleLineIndices: number[];
        } | null = null;

        // Try candidate rules in descending order of savings until one succeeds or none left
        for (const candidate of candidateEvaluations) {
          const success = await DiscountService.tryIncrementUsageTransactional(tx, candidate.rule.id);
          if (success) {
            appliedDiscount = {
              rule: candidate.rule,
              savingsPaise: candidate.totalSavingsPaise,
              eligibleLineIndices: candidate.eligibleLineIndices,
            };
            break;
          }
          // If usage increment returned false (limit reached), try next candidate
        }

        // Calculate invoice lines & totals
        const calculated = calculateInvoice(
          {
            planNameSnapshot: sub.planNameSnapshot,
            planPricePaise: sub.planPricePaise,
            planTaxRateBps: sub.planTaxRateBps,
            lines: sub.lines,
          },
          appliedDiscount
        );

        // Generate invoice number: INV-YYYYMMDD-SUBNO-XXXX
        const dateStr = periodStart.toISOString().slice(0, 10).replace(/-/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const invoiceNo = `INV-${dateStr}-${sub.subscriptionNo}-${randomSuffix}`;

        const dueAt = calculateDueDate(periodStart, sub.paymentTermsDays);

        // Create invoice
        const createdInvoice = await tx.invoice.create({
          data: {
            invoiceNo,
            subscriptionId: sub.id,
            customerId: sub.customerId,
            periodStart,
            periodEnd,
            issuedAt: new Date(),
            dueAt,
            status: 'DRAFT',
            subtotalPaise: calculated.subtotalPaise,
            discountPaise: calculated.discountPaise,
            taxPaise: calculated.taxPaise,
            totalPaise: calculated.totalPaise,
            discountRuleId: appliedDiscount?.rule.id || null,
            discountNameSnapshot: appliedDiscount?.rule.name || null,
            lines: {
              create: calculated.lines.map((line) => ({
                productId: line.productId || null,
                descriptionSnapshot: line.descriptionSnapshot,
                quantity: line.quantity,
                unitPricePaise: line.unitPricePaise,
                subtotalPaise: line.subtotalPaise,
                discountPaise: line.discountPaise,
                taxablePaise: line.taxablePaise,
                taxRateBps: line.taxRateBps,
                taxPaise: line.taxPaise,
                totalPaise: line.totalPaise,
              })),
            },
          },
        });

        // Advance nextBillingAt
        const nextBillingAt = getNextBillingDate(sub.nextBillingAt, sub.billingInterval);
        await tx.subscription.update({
          where: { id: sub.id },
          data: {
            nextBillingAt,
          },
        });

        return {
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          status: 'PROCESSED',
          invoiceId: createdInvoice.id,
          invoiceNo: createdInvoice.invoiceNo,
          totalPaise: createdInvoice.totalPaise,
          discountPaise: createdInvoice.discountPaise,
        };
      });
    } catch (err: unknown) {
      // Catch duplicate constraint violations (P2002)
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        return {
          subscriptionId: sub.id,
          subscriptionNo: sub.subscriptionNo,
          status: 'SKIPPED',
          message: 'Duplicate billing prevented by unique constraint @@unique([subscriptionId, periodStart])',
        };
      }
      throw err;
    }
  }
}
