import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { InvoiceService } from '@/services/invoice/invoice-service';
import { cancelInvoiceSchema } from '@/validations/invoice/invoice-schema';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Only staff and admins can cancel invoices', 403);
    }

    let reason: string | undefined;
    try {
      const body = await request.json();
      const parsed = cancelInvoiceSchema.safeParse(body);
      if (parsed.success) {
        reason = parsed.data.reason;
      }
    } catch {
      // Reason is optional
    }

    const cancelled = await InvoiceService.cancelInvoice(params.id, reason);
    return successResponse(cancelled);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to cancel invoice';
    const status = msg.includes('not found') ? 404 : 400;
    return errorResponse(msg, status);
  }
}
