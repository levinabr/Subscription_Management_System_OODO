import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { InvoiceService } from '@/services/invoice/invoice-service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Only staff and admins can confirm invoices', 403);
    }

    const confirmed = await InvoiceService.confirmInvoice(params.id);
    return successResponse(confirmed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to confirm invoice';
    const status = msg.includes('not found') ? 404 : 400;
    return errorResponse(msg, status);
  }
}
