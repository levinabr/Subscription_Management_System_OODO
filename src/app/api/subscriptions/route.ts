import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAuthUser, authorizeRoles } from '@/lib/auth/auth-helper';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api-response';
import { subscriptionQuerySchema } from '@/validations/subscription/subscription.schema';
import { createSubscriptionFromTemplateSchema } from '@/validations/quotation/quotation.schema';
import { listSubscriptions } from '@/services/subscription/subscriptionService';
import { createSubscriptionFromTemplate } from '@/services/quotation/quoteService';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const auth = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!auth.authorized) return apiError('FORBIDDEN', auth.error ?? 'Forbidden', 403);

    const sp = Object.fromEntries(req.nextUrl.searchParams.entries());
    const query = subscriptionQuerySchema.parse({
      ...sp,
      page: sp.page ? Number(sp.page) : 1,
      pageSize: sp.pageSize ? Number(sp.pageSize) : 20,
    });

    const result = await listSubscriptions(query, user);
    return apiSuccess(result, 'Subscriptions retrieved successfully');
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const auth = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!auth.authorized) return apiError('FORBIDDEN', auth.error ?? 'Forbidden', 403);

    const body = await req.json();
    const input = createSubscriptionFromTemplateSchema.parse(body);

    const subscription = await createSubscriptionFromTemplate(input, user);
    return apiSuccess(subscription, 'Subscription quotation created successfully', 201);
  } catch (err) {
    return handleApiError(err);
  }
}
