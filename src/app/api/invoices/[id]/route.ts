import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth/auth-helper';
import { InvoiceService } from '@/services/invoice/invoice-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const enforcedCustomerId = user.role === 'CUSTOMER' ? user.customerId || user.id : undefined;

    const invoice = await InvoiceService.getInvoiceById(params.id, enforcedCustomerId);
    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    return successResponse(invoice);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch invoice';
    const status = msg.includes('Forbidden') ? 403 : 500;
    return errorResponse(msg, status);
  }
}
