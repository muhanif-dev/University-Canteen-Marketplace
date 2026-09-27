import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { connectDB } from "@/lib/db";
import { AppError, ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { User } from "@/models/user";
import {
  ACCOUNT_STATUS,
  CUSTOMER_TYPE,
  ROLES,
  type CustomerType,
  type Role,
} from "@/types";

const SESSION_COOKIE = "auth-session";
const SESSION_EXPIRY = "7d";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new AppError(
      "AUTH_SECRET environment variable is not defined",
      500,
      "AUTH_CONFIG_ERROR"
    );
  }

  return new TextEncoder().encode(secret);
}

export interface SessionPayload {
  userId: string;
  role: Role;
  email: string;
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRY)
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.role === "string" &&
      typeof payload.email === "string"
    ) {
      return {
        userId: payload.userId,
        role: payload.role as Role,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new UnauthorizedError("Authentication required");
  }
  return session;
}

export async function requireRole(
  allowedRoles: Role[]
): Promise<SessionPayload> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError("Insufficient permissions");
  }
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  return requireRole([ROLES.SUPER_ADMIN]);
}

export async function requireActiveCanteenOwner(): Promise<{
  session: SessionPayload;
  user: InstanceType<typeof User>;
}> {
  const session = await requireRole([ROLES.CANTEEN_OWNER]);
  await connectDB();
  const user = await User.findById(session.userId);

  if (!user) {
    throw new UnauthorizedError("User account not found");
  }

  if (user.role !== ROLES.CANTEEN_OWNER) {
    throw new ForbiddenError("Only canteen owners can access this resource.");
  }

  if (user.status !== ACCOUNT_STATUS.ACTIVE) {
    throw new ForbiddenError(
      `Account is ${user.status.toLowerCase()}. Only active canteen owners can access this resource.`
    );
  }

  return { session, user };
}

export async function requireActiveCustomer(): Promise<{
  session: SessionPayload;
  user: InstanceType<typeof User>;
  customerType: CustomerType;
}> {
  const session = await requireRole([ROLES.STUDENT, ROLES.FACULTY]);
  await connectDB();
  const user = await User.findById(session.userId);

  if (!user) {
    throw new UnauthorizedError("User account not found");
  }

  if (user.status !== ACCOUNT_STATUS.ACTIVE) {
    throw new ForbiddenError(
      "Only active students and faculty members can use shopping features."
    );
  }

  const customerType =
    user.role === ROLES.STUDENT
      ? CUSTOMER_TYPE.STUDENT
      : user.role === ROLES.FACULTY
        ? CUSTOMER_TYPE.FACULTY
        : null;

  if (!customerType) {
    throw new ForbiddenError("Only students and faculty members can use shopping features.");
  }

  return { session, user, customerType };
}
