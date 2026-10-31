import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireRole } from "@/lib/auth/rbac";
import { ProductService } from "@/services/product.service";
import { updateProductSchema } from "@/validations/product/product.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    const product = await ProductService.getProductById(id, user);
    return apiSuccess(product, "Product retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireRole([UserRole.ADMIN]);
    const { id } = await params;

    const body = await req.json();
    const validated = updateProductSchema.parse(body);
    const updated = await ProductService.updateProduct(id, validated, user);

    return apiSuccess(updated, "Product updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
