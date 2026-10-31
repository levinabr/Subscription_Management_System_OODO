import { NextRequest } from 'next/server';
import { getAuthUser, authorizeRoles } from '@/lib/auth/auth-helper';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api-response';
import { getSubscriptionById } from '@/services/subscription/subscriptionService';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    // Both internal users and customers may access (ownership enforced in service)
    const { id } = await params;
    const sub = await getSubscriptionById(id, user);
    return apiSuccess(sub, 'Subscription retrieved successfully');
  } catch (err) {
    return handleApiError(err);
  }
}
