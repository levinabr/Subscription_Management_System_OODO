import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { PaymentFilterSchema } from '@/validations/payment/payment.schema';
import { getPaymentHistory } from '@/services/payment/payment.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
      invoiceId: searchParams.get('invoiceId') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      method: searchParams.get('method') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const parseResult = PaymentFilterSchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid filter parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Customers can ONLY view their own payments
    const customerScope = user.role === 'CUSTOMER' ? user.customerId || 'non-existent' : undefined;

    const data = await getPaymentHistory(parseResult.data, customerScope);
    return NextResponse.json(data);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    );
  }
}
