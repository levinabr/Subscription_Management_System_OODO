import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { getAuthUser } from '@/lib/auth/auth-helper';
import { InvoiceService } from '@/services/invoice/invoice-service';
import { invoiceListQuerySchema } from '@/validations/invoice/invoice-schema';

export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const { searchParams } = new URL(request.url);

    const rawQuery = {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      overdue: searchParams.get('overdue') || undefined,
      customerId: searchParams.get('customerId') || undefined,
    };

    const parsed = invoiceListQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return errorResponse('Validation error', 422, parsed.error.flatten().fieldErrors);
    }

    // Customer scoping: If user is CUSTOMER, only permit their own customerId
    const enforcedCustomerId = user.role === 'CUSTOMER' ? user.customerId || user.id : undefined;

    const result = await InvoiceService.listInvoices({
      ...parsed.data,
      enforcedCustomerId,
    });

    return successResponse(result.invoices, 200, result.pagination);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to list invoices';
    return errorResponse(msg, 500);
  }
}
