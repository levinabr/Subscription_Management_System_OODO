import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { DiscountService } from '@/services/discount/discount-service';
import { updateDiscountSchema } from '@/validations/discount/discount-schema';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const discount = await DiscountService.getDiscountById(params.id);
    if (!discount) {
      return errorResponse('Discount rule not found', 404);
    }
    return successResponse(discount);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch discount rule';
    return errorResponse(msg, 500);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Only admins can modify discount rules', 403);
    }

    const existing = await DiscountService.getDiscountById(params.id);
    if (!existing) {
      return errorResponse('Discount rule not found', 404);
    }

    const body = await request.json();
    const parsed = updateDiscountSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation error', 422, parsed.error.flatten().fieldErrors);
    }

    const updated = await DiscountService.updateDiscount(params.id, parsed.data);
    return successResponse(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update discount rule';
    return errorResponse(msg, 500);
  }
}
