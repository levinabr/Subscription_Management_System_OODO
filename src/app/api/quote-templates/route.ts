import { NextRequest } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser, authorizeRoles } from '@/lib/auth/auth-helper';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api-response';

export async function GET(req: NextRequest) {
  try {
    const user = getAuthUser(req);
    const auth = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!auth.authorized) return apiError('FORBIDDEN', auth.error ?? 'Forbidden', 403);

    const templates = await prisma.quoteTemplate.findMany({
      where: { isActive: true },
      include: {
        plan: { select: { id: true, name: true, code: true, billingInterval: true } },
        lines: {
          include: { product: { select: { id: true, name: true, sku: true } } },
        },
      },
      orderBy: { name: 'asc' },
    });

    return apiSuccess(templates, 'Quote templates retrieved successfully');
  } catch (err) {
    return handleApiError(err);
  }
}
