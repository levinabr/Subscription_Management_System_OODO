import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { BillingService } from '@/services/billing/billing-service';
import { billingPreviewQuerySchema } from '@/validations/billing/billing-schema';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Unauthorized', 403);
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      asOfDate: searchParams.get('asOfDate') || undefined,
      subscriptionId: searchParams.get('subscriptionId') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const parsed = billingPreviewQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return errorResponse('Validation error', 422, parsed.error.flatten().fieldErrors);
    }

    const preview = await BillingService.previewBilling(
      parsed.data.asOfDate,
      parsed.data.subscriptionId
    );

    return successResponse(preview);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to generate billing preview';
    return errorResponse(msg, 500);
  }
}
