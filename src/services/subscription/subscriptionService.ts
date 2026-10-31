import { prisma } from '@/lib/db/prisma';
import { SubscriptionQueryInput, RenewInput } from '@/validations/subscription/subscription.schema';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  customerId?: string | null;
}

function generateSubscriptionNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUB-${ts}-${rand}`;
}

export async function listSubscriptions(query: SubscriptionQueryInput, user: AuthUser) {
  const { page, pageSize, status, customerId, search, dateFrom, dateTo } = query;

  // Customers can only see their own subscriptions
  const effectiveCustomerId =
    user.role === 'CUSTOMER' ? (user.customerId ?? undefined) : customerId;

  const where: any = {};

  if (effectiveCustomerId) where.customerId = effectiveCustomerId;
  if (status) where.status = status;
  if (search) where.subscriptionNo = { contains: search };
  if (dateFrom || dateTo) {
    where.startDate = {};
    if (dateFrom) where.startDate.gte = new Date(dateFrom);
    if (dateTo) where.startDate.lte = new Date(dateTo);
  }

  const [items, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { id: true, businessName: true, billingEmail: true },
        },
        plan: { select: { id: true, name: true, code: true } },
      },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getSubscriptionById(id: string, user: AuthUser) {
  const sub = await prisma.subscription.findUnique({
    where: { id },
    include: {
      customer: true,
      plan: { include: { taxRule: true } },
      lines: {
        include: {
          product: { select: { id: true, name: true, sku: true } },
          variant: true,
        },
      },
      invoices: {
        orderBy: { periodStart: 'desc' },
        select: {
          id: true,
          invoiceNo: true,
          status: true,
          periodStart: true,
          periodEnd: true,
          dueAt: true,
          totalPaise: true,
          subtotalPaise: true,
          taxPaise: true,
          discountPaise: true,
        },
      },
    },
  });

  if (!sub) throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });

  // Customer isolation — customers can only view their own subscriptions
  if (user.role === 'CUSTOMER' && (sub as any).customerId !== user.customerId) {
    throw Object.assign(new Error('Forbidden'), { statusCode: 403 });
  }

  return sub;
}

export async function renewSubscription(subscriptionId: string, input: RenewInput, user: AuthUser) {
  const original = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: { lines: true },
  });

  if (!original) throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });
  if (!(original as any).canRenew) {
    throw Object.assign(new Error('This subscription plan does not allow renewal'), { statusCode: 400 });
  }
  if (!['ACTIVE', 'EXPIRED', 'CLOSED'].includes((original as any).status)) {
    throw Object.assign(new Error('Renewal is only available for active, expired, or closed subscriptions'), { statusCode: 400 });
  }

  const newStart = new Date(input.startDate);
  const subscriptionNo = generateSubscriptionNo();

  const paymentTermsDays =
    input.paymentTermsDays ?? (original as any).paymentTermsDays ?? 15;

  // Create new subscription copying snapshots from original
  const renewed = await prisma.subscription.create({
    data: {
      subscriptionNo,
      customerId: (original as any).customerId,
      planId: (original as any).planId,
      createdByUserId: user.id,
      status: 'QUOTATION',
      startDate: newStart,
      nextBillingAt: newStart,
      paymentTermsDays,
      planNameSnapshot: (original as any).planNameSnapshot,
      planPricePaise: (original as any).planPricePaise,
      billingInterval: (original as any).billingInterval,
      planTaxNameSnapshot: (original as any).planTaxNameSnapshot,
      planTaxRateBps: (original as any).planTaxRateBps,
      autoCloseAtEnd: (original as any).autoCloseAtEnd,
      canCloseEarly: (original as any).canCloseEarly,
      canPause: (original as any).canPause,
      canRenew: (original as any).canRenew,
      recurringTotalPaise: (original as any).recurringTotalPaise,
      quoteExpiresAt: (() => {
        const d = new Date(newStart);
        d.setDate(d.getDate() + 30);
        return d;
      })(),
      lines: {
        create: ((original as any).lines ?? []).map((l: any) => ({
          productId: l.productId,
          variantId: l.variantId,
          descriptionSnapshot: l.descriptionSnapshot,
          skuSnapshot: l.skuSnapshot,
          variantSnapshot: l.variantSnapshot,
          quantity: l.quantity,
          unitPricePaise: l.unitPricePaise,
          taxNameSnapshot: l.taxNameSnapshot,
          taxRateBps: l.taxRateBps,
        })),
      },
    },
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
  });

  return renewed;
}
