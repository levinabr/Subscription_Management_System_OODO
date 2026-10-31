import { NextRequest } from "next/server";
import { requireAuthenticatedUser } from "@/lib/auth/rbac";
import { CustomerService } from "@/services/customer.service";
import { updateCustomerSchema } from "@/validations/customer/customer.schema";
import { apiSuccess, handleApiError } from "@/lib/utils/api-response";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    const customer = await CustomerService.getCustomerById(id, user);
    return apiSuccess(customer, "Customer retrieved successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteProps) {
  try {
    const user = await requireAuthenticatedUser();
    const { id } = await params;

    const body = await req.json();
    const validated = updateCustomerSchema.parse(body);
    const updated = await CustomerService.updateCustomer(id, validated, user);

    return apiSuccess(updated, "Customer updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
