import { prisma } from "@/lib/db/prisma";
import { AuthenticatedUser } from "@/lib/auth/session";
import { ApiError } from "@/lib/errors/api-error";
import {
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerQueryInput,
} from "@/validations/customer/customer.schema";
import { Prisma, UserRole } from "@prisma/client";

export class CustomerService {
  static async listCustomers(query: CustomerQueryInput, user: AuthenticatedUser) {
    // If CUSTOMER role, isolate to their own customer
    if (user.role === UserRole.CUSTOMER) {
      if (!user.customerId) {
        return { customers: [], total: 0, page: 1, totalPages: 0 };
      }
      const customer = await prisma.customer.findUnique({
        where: { id: user.customerId },
      });
      return {
        customers: customer ? [customer] : [],
        total: customer ? 1 : 0,
        page: 1,
        totalPages: customer ? 1 : 0,
      };
    }

    const { search, page, pageSize } = query;
    const skip = (page - 1) * pageSize;

    const where: Prisma.CustomerWhereInput = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: {
              users: true,
              subscriptions: true,
              invoices: true,
            },
          },
        },
      }),
    ]);

    return {
      customers,
      total,
      page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  static async getCustomerById(id: string, user: AuthenticatedUser) {
    if (user.role === UserRole.CUSTOMER && user.customerId !== id) {
      throw ApiError.forbidden("Access denied: You can only view your own customer profile.");
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            subscriptions: true,
            invoices: true,
          },
        },
      },
    });

    if (!customer) {
      throw ApiError.notFound("Customer not found.");
    }

    return customer;
  }

  static async createCustomer(input: CreateCustomerInput, user: AuthenticatedUser) {
    if (user.role === UserRole.CUSTOMER) {
      throw ApiError.forbidden("Customers are not authorized to create new customer accounts.");
    }

    const normalizedEmail = input.email.toLowerCase().trim();

    return prisma.customer.create({
      data: {
        ...input,
        email: normalizedEmail,
      },
    });
  }

  static async updateCustomer(
    id: string,
    input: UpdateCustomerInput,
    user: AuthenticatedUser
  ) {
    if (user.role === UserRole.CUSTOMER) {
      if (user.customerId !== id) {
        throw ApiError.forbidden("Access denied: You can only update your own profile.");
      }
      // Customer cannot deactivate their account or alter corporate identifiers
      delete input.active;
    }

    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw ApiError.notFound("Customer not found.");
    }

    return prisma.customer.update({
      where: { id },
      data: {
        ...input,
        ...(input.email ? { email: input.email.toLowerCase().trim() } : {}),
      },
    });
  }
}
