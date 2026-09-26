import { NextResponse } from "next/server";
import { ValidationError as YupValidationError } from "yup";

import { AppError } from "@/lib/errors";

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof YupValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        errors: error.errors,
      },
      { status: 400 }
    );
  }

  // MongoDB duplicate key error code
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "A record with this information already exists.",
        code: "DUPLICATE_KEY_ERROR",
      },
      { status: 409 }
    );
  }

  console.error("Unhandled API Error:", error);

  return NextResponse.json(
    {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
      code: "INTERNAL_ERROR",
    },
    { status: 500 }
  );
}

export function apiSuccess<T>(data: T, status = 200, message?: string) {
  return NextResponse.json(
    {
      success: true,
      ...(message ? { message } : {}),
      data,
    },
    { status }
  );
}
