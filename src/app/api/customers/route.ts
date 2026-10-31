import { NextRequest } from "next/server";
import { requireAuthenticatedUser, requireRole } from "@/lib/auth/rbac";
import { CustomerService } from "@/services/customer.service";
import {
  createCustomerSchema,
  customerQuerySchema,
} from "@/validations/customer/customer.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";
import { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuthenticatedUser();

    const searchParams = req.nextUrl.searchParams;
    const query = customerQuerySchema.parse({
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || 1,
      pageSize: searchParams.get("pageSize") || 10,
    });

    const result = await CustomerService.listCustomers(query, user);
    return apiSuccess(result.customers, "Customers retrieved", 200, {
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
    // Only internal staff and admins can create customers directly
    const user = await requireRole([UserRole.ADMIN, UserRole.STAFF]);

    const body = await req.json();
    const validated = createCustomerSchema.parse(body);
    const customer = await CustomerService.createCustomer(validated, user);

    return apiSuccess(customer, "Customer created successfully", 201);
  } catch (error) {
    return handleApiError(error);
  }
}
