import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth/session';
import { CreatePaymentSchema } from '@/validations/payment/payment.schema';
import { recordInvoicePayment, getInvoiceDetails } from '@/services/payment/payment.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    if (!user || !isStaffOrAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Staff or Admin role required to record payments.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = CreatePaymentSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await recordInvoicePayment(id, parseResult.data, user.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getSessionUser(req);
    const customerScope = user?.role === 'CUSTOMER' ? user.customerId || undefined : undefined;

    const invoice = await getInvoiceDetails(id, customerScope);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ payments: invoice.payments });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    );
  }
}
