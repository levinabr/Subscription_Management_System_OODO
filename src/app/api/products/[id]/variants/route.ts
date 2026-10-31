import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth/rbac";
import { ProductService } from "@/services/product.service";
import { createProductVariantSchema } from "@/validations/product/product.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireRole([UserRole.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const validated = createProductVariantSchema.parse(body);
    const variant = await ProductService.addVariant(id, validated, user);

    return apiSuccess(variant, "Product variant created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
