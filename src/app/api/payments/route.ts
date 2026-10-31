import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth/session';
import { PaymentFilterSchema, CreatePaymentSchema } from '@/validations/payment/payment.schema';
import { getPaymentHistory, recordInvoicePayment } from '@/services/payment/payment.service';

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

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isStaffOrAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Staff or Admin role required to record payments.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const invoiceId = body.invoiceId;
    if (!invoiceId) {
      return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
    }

    const parseResult = CreatePaymentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const result = await recordInvoicePayment(invoiceId, parseResult.data, user.id);
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    );
  }
}
