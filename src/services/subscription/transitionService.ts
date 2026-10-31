import { prisma } from '@/lib/db/prisma';

interface AuthUser {
  id: string;
  email: string;
  role: string;
  customerId?: string | null;
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['QUOTATION'],
  QUOTATION: ['CONFIRMED', 'CLOSED'],
  CONFIRMED: ['ACTIVE'],
  ACTIVE: ['PAUSED', 'CLOSED', 'EXPIRED'],
  PAUSED: ['ACTIVE'],
};

export async function transitionSubscription(
  subscriptionId: string,
  toStatus: string,
  user: AuthUser
) {
  // Load current subscription
  const sub = await prisma.subscription.findUnique({ where: { id: subscriptionId } });
  if (!sub) throw Object.assign(new Error('Subscription not found'), { statusCode: 404 });

  const fromStatus = (sub as any).status as string;
  const now = new Date();

  // Validate allowed transition
  const allowed = ALLOWED_TRANSITIONS[fromStatus] ?? [];
  if (!allowed.includes(toStatus)) {
    throw Object.assign(
      new Error(`Cannot transition from ${fromStatus} to ${toStatus}`),
      { statusCode: 400 }
    );
  }

  // Business rule checks
  if (fromStatus === 'QUOTATION' && toStatus === 'CONFIRMED') {
    const exp = (sub as any).quoteExpiresAt ? new Date((sub as any).quoteExpiresAt) : null;
    if (exp && now > exp) {
      throw Object.assign(new Error('Quotation has expired and cannot be confirmed'), { statusCode: 400 });
    }
  }

  if (fromStatus === 'CONFIRMED' && toStatus === 'ACTIVE') {
    const startDate = new Date((sub as any).startDate);
    if (now < startDate) {
      throw Object.assign(
        new Error(`Subscription cannot be activated before start date (${startDate.toISOString().slice(0, 10)})`),
        { statusCode: 400 }
      );
    }
  }

  if (toStatus === 'PAUSED' && !(sub as any).canPause) {
    throw Object.assign(new Error('This subscription plan does not allow pausing'), { statusCode: 400 });
  }

  if (toStatus === 'CLOSED' && fromStatus === 'ACTIVE' && !(sub as any).canCloseEarly) {
    throw Object.assign(new Error('This subscription plan does not allow early closure'), { statusCode: 400 });
  }

  if (['CLOSED', 'EXPIRED'].includes(fromStatus)) {
    throw Object.assign(new Error(`A ${fromStatus} subscription cannot be reactivated`), { statusCode: 400 });
  }

  // Build update data with lifecycle timestamps
  const updateData: Record<string, unknown> = { status: toStatus };

  if (toStatus === 'CONFIRMED') updateData.confirmedAt = now;
  if (toStatus === 'ACTIVE') updateData.activatedAt = now;
  if (toStatus === 'CLOSED') updateData.closedAt = now;
  if (toStatus === 'PAUSED') updateData.pausedAt = now;
  if (toStatus === 'EXPIRED') {
    updateData.closedAt = now; // use closedAt as generic end timestamp
  }

  const updated = await prisma.subscription.update({
    where: { id: subscriptionId },
    data: updateData as any,
    include: {
      customer: true,
      plan: true,
      lines: true,
    },
  });

  return updated;
}
