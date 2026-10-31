import { NextRequest } from 'next/server';
import { getAuthUser, authorizeRoles } from '@/lib/auth/auth-helper';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api-response';
import { renewSchema } from '@/validations/subscription/subscription.schema';
import { renewSubscription } from '@/services/subscription/subscriptionService';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    const auth = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!auth.authorized) return apiError('FORBIDDEN', auth.error ?? 'Forbidden', 403);

    const { id } = await params;
    const body = await req.json();
    const input = renewSchema.parse(body);

    const renewed = await renewSubscription(id, input, user);
    return apiSuccess(renewed, 'Subscription renewed successfully', 201);
  } catch (err) {
    return handleApiError(err);
  }
}
