import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { ValidationError as YupValidationError } from "yup";

import { AppError } from "@/lib/errors";

export function handleApiError(error: unknown) {
  if (error instanceof mongoose.Error.VersionError) {
    return NextResponse.json(
      {
        success: false,
        error: "This record changed in another request. Reload and try again.",
        code: "CONCURRENT_UPDATE",
      },
      { status: 409 }
    );
  }

  if (error instanceof SyntaxError) {
    return NextResponse.json(
      {
        success: false,
        error: "Request body must be valid JSON.",
        code: "INVALID_JSON",
      },
      { status: 400 }
    );
  }

  if (error instanceof mongoose.Error.CastError) {
    return NextResponse.json(
      {
        success: false,
        error: "A provided identifier or value is invalid.",
        code: "INVALID_VALUE",
      },
      { status: 400 }
    );
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: "The submitted information is invalid.",
        code: "DATA_VALIDATION_FAILED",
      },
      { status: 400 }
    );
  }

  if (error instanceof AppError) {
    const isSafeToExpose = error.isOperational;
    return NextResponse.json(
      {
        success: false,
        error: isSafeToExpose
          ? error.message
          : "An unexpected error occurred. Please try again later.",
        code: isSafeToExpose ? error.code : "INTERNAL_ERROR",
      },
      { status: isSafeToExpose ? error.statusCode : 500 }
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
