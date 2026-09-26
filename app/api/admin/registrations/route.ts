import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Canteen } from "@/models/canteen";
import { Faculty } from "@/models/faculty";
import { Student } from "@/models/student";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES } from "@/types";

export async function GET(request: NextRequest) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const requestedStatus =
      searchParams.get("status") || ACCOUNT_STATUS.PENDING;
    const requestedRole = searchParams.get("role");

    const query: Record<string, unknown> = {
      role: { $ne: ROLES.SUPER_ADMIN },
    };

    if (requestedStatus) {
      query.status = requestedStatus;
    }

    if (requestedRole) {
      query.role = requestedRole;
    }

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    const userIds = users.map((u) => u._id);

    const [students, faculties, canteens] = await Promise.all([
      Student.find({ user: { $in: userIds } }).lean(),
      Faculty.find({ user: { $in: userIds } }).lean(),
      Canteen.find({ owner: { $in: userIds } }).lean(),
    ]);

    const studentMap = new Map(
      students.map((s) => [s.user.toString(), s])
    );
    const facultyMap = new Map(
      faculties.map((f) => [f.user.toString(), f])
    );
    const canteenMap = new Map(
      canteens.map((c) => [c.owner.toString(), c])
    );

    const enrichedRegistrations = users.map((user) => {
      const userIdStr = user._id.toString();
      let profile = null;

      if (user.role === ROLES.STUDENT) {
        profile = studentMap.get(userIdStr) || null;
      } else if (user.role === ROLES.FACULTY) {
        profile = facultyMap.get(userIdStr) || null;
      } else if (user.role === ROLES.CANTEEN_OWNER) {
        profile = canteenMap.get(userIdStr) || null;
      }

      return {
        ...user,
        profile,
      };
    });

    return apiSuccess(
      {
        count: enrichedRegistrations.length,
        registrations: enrichedRegistrations,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
