import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { AppError } from "@/lib/errors";
import { type Role } from "@/types";

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
