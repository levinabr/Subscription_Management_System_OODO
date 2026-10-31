import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { BillingService } from '@/services/billing/billing-service';
import { billingRunBodySchema } from '@/validations/billing/billing-schema';

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Unauthorized', 403);
    }

    let body = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is valid and runs with current UTC date
      body = {};
    }

    const parsed = billingRunBodySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Validation error', 422, parsed.error.flatten().fieldErrors);
    }

    const runResult = await BillingService.runBilling(
      parsed.data.asOfDate,
      parsed.data.subscriptionId
    );

    return successResponse(runResult, 200);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to execute billing run';
    return errorResponse(msg, 500);
  }
}
