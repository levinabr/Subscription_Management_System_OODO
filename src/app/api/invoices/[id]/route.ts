import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth/auth-helper';
import { getInvoiceDetails } from '@/services/payment/payment.service';
import { InvoiceService } from '@/services/invoice/invoice-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await Promise.resolve(params);
    const user = getAuthUser(request);
    const enforcedCustomerId = user.role === 'CUSTOMER' ? user.customerId || user.id : undefined;

    let invoice: any;
    try {
      invoice = await getInvoiceDetails(id, enforcedCustomerId);
    } catch (err: any) {
      if (err?.statusCode === 403 || err?.message?.includes('Access denied') || err?.message?.includes('Forbidden')) {
        return errorResponse(err.message, 403);
      }
      // If not found in payment service or failed otherwise, try InvoiceService
      invoice = await InvoiceService.getInvoiceById(id, enforcedCustomerId);
    }

    if (!invoice) {
      return errorResponse('Invoice not found', 404);
    }

    return successResponse(invoice);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch invoice';
    const status = (err as any)?.statusCode || (msg.includes('Forbidden') || msg.includes('Access denied') ? 403 : 500);
    return errorResponse(msg, status);
  }
}
