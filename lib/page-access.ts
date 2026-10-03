import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES, type Role } from "@/types";

export interface NavigationUser {
  id: string;
  name: string;
  role: Role;
  status: string;
}

export async function getNavigationUser(): Promise<NavigationUser | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("name role status").lean();
    if (!user || user.role !== session.role) return null;

    return {
      id: user._id.toString(),
      name: String(user.name),
      role: user.role as Role,
      status: String(user.status),
    };
  } catch {
    return null;
  }
}

export async function requirePageRoles(allowedRoles: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");

  await connectDB();
  const user = await User.findById(session.userId).select("name role status").lean();
  if (!user || user.role !== session.role) redirect("/login");
  if (user.status !== ACCOUNT_STATUS.ACTIVE) redirect("/account/status");

  if (!allowedRoles.includes(user.role)) {
    if (user.role === ROLES.CANTEEN_OWNER) redirect("/canteen-owner/dashboard");
    if (user.role === ROLES.SUPER_ADMIN) redirect("/admin/registrations");
    redirect("/marketplace");
  }

  return user;
}
