import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { InvoiceService } from '@/services/invoice/invoice-service';
import { sendInvoiceSchema } from '@/validations/invoice/invoice-schema';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Only staff and admins can send invoices', 403);
    }

    let emailOverride: string | undefined;
    try {
      const body = await request.json();
      const parsed = sendInvoiceSchema.safeParse(body);
      if (parsed.success) {
        emailOverride = parsed.data.email;
      }
    } catch {
      // Optional
    }

    const sent = await InvoiceService.sendInvoice(params.id, emailOverride);
    return successResponse(sent);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send invoice';
    const status = msg.includes('not found') ? 404 : 400;
    return errorResponse(msg, status);
  }
}
