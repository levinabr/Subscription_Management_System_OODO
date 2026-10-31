import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { ApiError } from "@/lib/errors/api-error";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/api";

export function apiSuccess<T>(
  data: T,
  message = "Completed successfully",
  statusCode = 200,
  meta?: ApiSuccessResponse<T>["meta"]
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      ...(meta ? { meta } : {}),
    },
    { status: statusCode }
  );
}

export function apiError(
  code: string,
  message: string,
  statusCode = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status: statusCode }
  );
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return apiError(error.code, error.message, error.statusCode, error.details);
  }

  if (error instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of error.issues) {
      const path = issue.path.join(".") || "root";
      if (!fieldErrors[path]) {
        fieldErrors[path] = [];
      }
      fieldErrors[path].push(issue.message);
    }

    return apiError(
      "VALIDATION_ERROR",
      "Invalid request data provided",
      422,
      fieldErrors
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (error.code === "P2002") {
      const target = (error.meta?.target as string[])?.join(", ") || "field";
      return apiError(
        "DUPLICATE_ENTRY",
        `A record with this ${target} already exists.`,
        409
      );
    }

    // Record not found
    if (error.code === "P2025") {
      return apiError(
        "NOT_FOUND",
        "The requested record could not be found.",
        404
      );
    }

    // Foreign key constraint failed
    if (error.code === "P2003") {
      return apiError(
        "FOREIGN_KEY_VIOLATION",
        "Referenced related record does not exist or cannot be modified.",
        400
      );
    }

    // Default safe prisma error
    return apiError(
      "DATABASE_ERROR",
      "A database error occurred while processing your request.",
      400
    );
  }

  // Generic fallback without exposing internal stack traces
  console.error("Unhandled API error:", error);
  return apiError(
    "INTERNAL_ERROR",
    "An unexpected error occurred. Please try again later.",
    500
  );
}
