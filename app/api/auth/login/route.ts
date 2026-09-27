import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { createSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { verifyPassword } from "@/lib/password";
import { User } from "@/models/user";
import { ACCOUNT_STATUS } from "@/types";
import { loginSchema, type LoginInput } from "@/validations/auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    const credentials = (await loginSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    })) as LoginInput;

    await connectDB();
    const user = await User.findOne({ email: credentials.email }).select(
      "+passwordHash"
    );
    if (!user?.passwordHash || !(await verifyPassword(String(credentials.password), String(user.passwordHash)))) {
      throw new UnauthorizedError("Email or password is incorrect.");
    }

    if (user.status !== ACCOUNT_STATUS.ACTIVE) {
      const message =
        user.status === ACCOUNT_STATUS.PENDING
          ? "Your registration is awaiting approval."
          : user.status === ACCOUNT_STATUS.REJECTED
            ? "Your registration was not approved. Contact the administrator for assistance."
            : "Your account is not active. Contact the administrator for assistance.";
      throw new ForbiddenError(message);
    }

    await createSession({ userId: user._id.toString(), role: user.role });
    return apiSuccess({
      user: { id: user._id.toString(), name: user.name, role: user.role },
    }, 200, "Signed in successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
