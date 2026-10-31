import { NextRequest } from 'next/server';
import { errorResponse, successResponse } from '@/lib/api-response';
import { authorizeRoles, getAuthUser } from '@/lib/auth/auth-helper';
import { DiscountService } from '@/services/discount/discount-service';
import { createDiscountSchema } from '@/validations/discount/discount-schema';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActiveParam = searchParams.get('isActive');
    const scope = searchParams.get('scope') || undefined;
    const type = searchParams.get('type') || undefined;

    const isActive =
      isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined;

    const discounts = await DiscountService.getDiscounts({
      isActive,
      scope,
      type,
    });

    return successResponse(discounts);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch discounts';
    return errorResponse(msg, 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    const authCheck = authorizeRoles(user, ['ADMIN']);
    if (!authCheck.authorized) {
      return errorResponse(authCheck.error || 'Only admins can create discount rules', 403);
    }

    const body = await request.json();
    const parsed = createDiscountSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation error', 422, parsed.error.flatten().fieldErrors);
    }

    const created = await DiscountService.createDiscount(parsed.data);
    return successResponse(created, 201);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to create discount rule';
    return errorResponse(msg, 500);
  }
}
