import { NextRequest } from 'next/server';
import { getAuthUser, authorizeRoles } from '@/lib/auth/auth-helper';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api-response';
import { transitionSchema } from '@/validations/subscription/subscription.schema';
import { transitionSubscription } from '@/services/subscription/transitionService';

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
    const input = transitionSchema.parse(body);

    const updated = await transitionSubscription(id, input.toStatus, user);
    return apiSuccess(updated, `Subscription transitioned to ${input.toStatus}`);
  } catch (err) {
    return handleApiError(err);
  }
}
