import { prisma } from '@/lib/db/prisma';
import { DashboardFilterInput } from '@/validations/payment/payment.schema';
import { BillingInterval, InvoiceStatus } from '@prisma/client';

export interface DashboardSummary {
  metrics: {
    activeSubscriptions: number;
    estimatedMrrPaise: number;
    paymentsReceivedPeriodPaise: number;
    paymentsReceivedCount: number;
    outstandingBalancePaise: number;
    overdueInvoiceCount: number;
    totalConfirmedInvoices: number;
    totalPaidInvoices: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
  invoiceBreakdown: {
    status: InvoiceStatus;
    count: number;
    totalPaise: number;
  }[];
  recentPayments: {
    id: string;
    amountPaise: number;
    method: string;
    paidAt: Date;
    reference: string | null;
    invoiceNo: string;
    customerName: string;
  }[];
  overdueInvoices: {
    id: string;
    invoiceNo: string;
    customerName: string;
    dueAt: Date;
    totalPaise: number;
    outstandingPaise: number;
    daysOverdue: number;
  }[];
}

/**
 * Resolves date range bounds from a filter input or preset period
 */
export function resolveDateRange(filter?: DashboardFilterInput) {
  const now = new Date();
  let startDate = filter?.startDate;
  let endDate = filter?.endDate || now;
  let label = 'Custom Period';

  if (!startDate) {
    const period = filter?.period || 'month';
    switch (period) {
      case 'today': {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        startDate = start;
        label = 'Today';
        break;
      }
      case '7d': {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        label = 'Last 7 Days';
        break;
      }
      case '30d': {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        label = 'Last 30 Days';
        break;
      }
      case 'month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        label = 'This Month';
        break;
      }
      case 'quarter': {
        const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        label = 'This Quarter';
        break;
      }
      case 'year': {
        startDate = new Date(now.getFullYear(), 0, 1);
        label = 'This Year';
        break;
      }
      case 'all':
      default: {
        startDate = new Date(2000, 0, 1);
        label = 'All Time';
        break;
      }
    }
  }

  return { startDate, endDate, label };
}

/**
 * Calculates primary finance metrics using efficient Prisma queries
 */
export async function getDashboardSummary(
  filter?: DashboardFilterInput
): Promise<DashboardSummary> {
  const { startDate, endDate, label } = resolveDateRange(filter);
  const now = new Date();

  // 1. Active subscriptions count
  const activeSubscriptionsPromise = prisma.subscription.count({
    where: { status: 'ACTIVE' },
  });

  // 2. Estimated MRR calculation via groupBy
  const subsByIntervalPromise = prisma.subscription.groupBy({
    by: ['billingInterval'],
    where: { status: 'ACTIVE' },
    _sum: {
      recurringTotalPaise: true,
    },
  });

  // 3. Payments received within period
  const paymentsAggPromise = prisma.payment.aggregate({
    where: {
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      amountPaise: true,
    },
    _count: {
      id: true,
    },
  });

  // 4. Invoices breakdown by status
  const invoiceStatusGroupsPromise = prisma.invoice.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { totalPaise: true },
  });

  // 5. Confirmed invoices with their payments (to compute outstanding balance and overdue count)
  const confirmedInvoicesPromise = prisma.invoice.findMany({
    where: {
      status: 'CONFIRMED',
    },
    select: {
      id: true,
      invoiceNo: true,
      dueAt: true,
      totalPaise: true,
      customer: {
        select: {
          businessName: true,
        },
      },
      payments: {
        select: {
          amountPaise: true,
        },
      },
    },
    orderBy: { dueAt: 'asc' },
  });

  // 6. Recent payments (latest 10)
  const recentPaymentsPromise = prisma.payment.findMany({
    take: 10,
    orderBy: { paidAt: 'desc' },
    select: {
      id: true,
      amountPaise: true,
      method: true,
      paidAt: true,
      reference: true,
      invoice: {
        select: {
          invoiceNo: true,
          customer: {
            select: {
              businessName: true,
            },
          },
        },
      },
    },
  });

  const [
    activeSubscriptions,
    subsByInterval,
    paymentsAgg,
    invoiceStatusGroups,
    confirmedInvoices,
    recentPaymentsRaw,
  ] = await Promise.all([
    activeSubscriptionsPromise,
    subsByIntervalPromise,
    paymentsAggPromise,
    invoiceStatusGroupsPromise,
    confirmedInvoicesPromise,
    recentPaymentsPromise,
  ]);

  // Compute Estimated MRR
  // Monthly: total * 1
  // Yearly: total / 12
  // Weekly: total * 52 / 12
  // Daily: total * 365 / 12
  let rawEstimatedMrr = 0;
  for (const group of subsByInterval) {
    const total = group._sum.recurringTotalPaise || 0;
    switch (group.billingInterval) {
      case 'MONTHLY':
        rawEstimatedMrr += total * 1;
        break;
      case 'YEARLY':
        rawEstimatedMrr += total / 12;
        break;
      case 'WEEKLY':
        rawEstimatedMrr += (total * 52) / 12;
        break;
      case 'DAILY':
        rawEstimatedMrr += (total * 365) / 12;
        break;
    }
  }
  const estimatedMrrPaise = Math.round(rawEstimatedMrr);

  // Payments received in period
  const paymentsReceivedPeriodPaise = paymentsAgg._sum.amountPaise || 0;
  const paymentsReceivedCount = paymentsAgg._count.id || 0;

  // Invoice status counts
  let totalConfirmedInvoices = 0;
  let totalPaidInvoices = 0;
  const invoiceBreakdown = invoiceStatusGroups.map((g) => {
    if (g.status === 'CONFIRMED') totalConfirmedInvoices = g._count.id;
    if (g.status === 'PAID') totalPaidInvoices = g._count.id;
    return {
      status: g.status as any,
      count: g._count.id,
      totalPaise: g._sum.totalPaise || 0,
    };
  });

  // Calculate outstanding balance and overdue invoices from confirmed invoices
  let outstandingBalancePaise = 0;
  let overdueInvoiceCount = 0;
  const overdueInvoices: DashboardSummary['overdueInvoices'] = [];

  for (const inv of confirmedInvoices) {
    const totalPaid = inv.payments.reduce((sum, p) => sum + p.amountPaise, 0);
    const outstanding = Math.max(0, inv.totalPaise - totalPaid);

    if (outstanding > 0) {
      outstandingBalancePaise += outstanding;

      if (inv.dueAt < now) {
        overdueInvoiceCount++;
        const diffMs = now.getTime() - inv.dueAt.getTime();
        const daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

        overdueInvoices.push({
          id: inv.id,
          invoiceNo: inv.invoiceNo,
          customerName: inv.customer?.businessName || 'Unknown Customer',
          dueAt: inv.dueAt,
          totalPaise: inv.totalPaise,
          outstandingPaise: outstanding,
          daysOverdue,
        });
      }
    }
  }

  // Format recent payments
  const recentPayments = recentPaymentsRaw.map((p) => ({
    id: p.id,
    amountPaise: p.amountPaise,
    method: p.method,
    paidAt: p.paidAt,
    reference: p.reference,
    invoiceNo: p.invoice?.invoiceNo || 'N/A',
    customerName: p.invoice?.customer?.businessName || 'Unknown',
  }));

  return {
    metrics: {
      activeSubscriptions,
      estimatedMrrPaise,
      paymentsReceivedPeriodPaise,
      paymentsReceivedCount,
      outstandingBalancePaise,
      overdueInvoiceCount,
      totalConfirmedInvoices,
      totalPaidInvoices,
    },
    period: {
      startDate,
      endDate,
      label,
    },
    invoiceBreakdown,
    recentPayments,
    overdueInvoices,
  };
}

/**
 * Generates monthly / period revenue trend aggregation based on actual payment dates
 */
export async function getRevenueTrend(filter?: DashboardFilterInput) {
  const { startDate, endDate } = resolveDateRange(filter);

  // Fetch payments within period bounded by dates
  const payments = await prisma.payment.findMany({
    where: {
      paidAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      amountPaise: true,
      paidAt: true,
      method: true,
    },
    orderBy: { paidAt: 'asc' },
  });

  // Group by year-month (e.g. "2026-10")
  const monthlyMap = new Map<string, { label: string; totalPaise: number; count: number }>();

  for (const p of payments) {
    const d = new Date(p.paidAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthName = d.toLocaleString('default', { month: 'short' });
    const label = `${monthName} ${d.getFullYear()}`;

    const existing = monthlyMap.get(key) || { label, totalPaise: 0, count: 0 };
    existing.totalPaise += p.amountPaise;
    existing.count += 1;
    monthlyMap.set(key, existing);
  }

  const trend = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, data]) => ({
      key,
      label: data.label,
      totalPaise: data.totalPaise,
      count: data.count,
    }));

  return {
    period: { startDate, endDate },
    trend,
    totalPaise: payments.reduce((sum, p) => sum + p.amountPaise, 0),
    totalCount: payments.length,
  };
}
