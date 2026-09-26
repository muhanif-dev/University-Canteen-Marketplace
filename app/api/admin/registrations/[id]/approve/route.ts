import mongoose from "mongoose";
import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireSuperAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { Canteen } from "@/models/canteen";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES } from "@/types";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    await requireSuperAdmin();
    await connectDB();

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ValidationError("Invalid user ID format.");
    }

    const user = await User.findById(id);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (user.status !== ACCOUNT_STATUS.PENDING) {
      throw new ValidationError(
        `Cannot approve account with status "${user.status}". Only PENDING accounts can be approved.`
      );
    }

    user.status = ACCOUNT_STATUS.ACTIVE;
    user.rejectionReason = undefined;
    await user.save();

    if (user.role === ROLES.CANTEEN_OWNER) {
      await Canteen.findOneAndUpdate(
        { owner: user._id },
        { isApproved: true, isActive: true }
      );
    }

    return apiSuccess(
      {
        user,
      },
      200,
      "Account has been approved and activated successfully."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
