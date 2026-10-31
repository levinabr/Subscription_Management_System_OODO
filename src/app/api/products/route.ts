import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireRole } from "@/lib/auth/rbac";
import { ProductService } from "@/services/product.service";
import {
  createProductSchema,
  productQuerySchema,
} from "@/validations/product/product.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const searchParams = req.nextUrl.searchParams;
    const query = productQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      productType: searchParams.get("productType") || undefined,
      activeOnly: searchParams.get("activeOnly") || undefined,
      page: searchParams.get("page") || 1,
      pageSize: searchParams.get("pageSize") || 10,
    });

    const result = await ProductService.listProducts(query, user);
    return apiSuccess(result.products, "Products retrieved", 200, {
      page: result.page,
      pageSize: query.pageSize,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole([UserRole.ADMIN]);

    const body = await req.json();
    const validated = createProductSchema.parse(body);
    const product = await ProductService.createProduct(validated, user);

    return apiSuccess(product, "Product created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
