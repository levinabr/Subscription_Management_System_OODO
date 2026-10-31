import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { getAuthUser, authorizeRoles } from '@/lib/auth/auth-helper';
import { apiSuccess, apiError, handleApiError } from '@/lib/utils/api-response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(req);
    const auth = authorizeRoles(user, ['ADMIN', 'STAFF']);
    if (!auth.authorized) return apiError('FORBIDDEN', auth.error ?? 'Forbidden', 403);

    const { id } = await params;

    const template = await prisma.quoteTemplate.findUnique({
      where: { id },
      include: {
        plan: { include: { taxRule: true } },
        lines: {
          include: {
            product: { select: { id: true, name: true, sku: true, type: true } },
            variant: true,
          },
        },
      },
    });

    if (!template) return apiError('NOT_FOUND', 'Quote template not found', 404);

    return apiSuccess(template, 'Quote template retrieved successfully');
  } catch (err) {
    return handleApiError(err);
  }
}
