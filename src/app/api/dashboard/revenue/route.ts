import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, isStaffOrAdmin } from '@/lib/auth/session';
import { DashboardFilterSchema } from '@/validations/payment/payment.schema';
import { getRevenueTrend } from '@/services/dashboard/dashboard.service';

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user || !isStaffOrAdmin(user)) {
      return NextResponse.json(
        { error: 'Unauthorized: Customers cannot access internal finance revenue reports' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawQuery = {
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      period: searchParams.get('period') || undefined,
    };

    const parseResult = DashboardFilterSchema.safeParse(rawQuery);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid dashboard filter parameters', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const trend = await getRevenueTrend(parseResult.data);
    return NextResponse.json(trend);
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status }
    );
  }
}
