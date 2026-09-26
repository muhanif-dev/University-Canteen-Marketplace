import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { requireActiveCanteenOwner } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { Canteen } from "@/models/canteen";
import {
  canteenProfileSchema,
  canteenProfileUpdateSchema,
} from "@/validations/canteen";

export const runtime = "nodejs";

const profileFields =
  "canteenName description location building openingTime closingTime logoUrl coverImageUrl isApproved isActive createdAt updatedAt";

export async function GET() {
  try {
    const { session } = await requireActiveCanteenOwner();
    await connectDB();
    const canteen = await Canteen.findOne({ owner: session.userId })
      .select(profileFields)
      .lean();

    if (!canteen) {
      throw new NotFoundError("Canteen profile not found");
    }

    return apiSuccess(canteen);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { session } = await requireActiveCanteenOwner();
    await connectDB();

    if (await Canteen.exists({ owner: session.userId })) {
      throw new ConflictError("A canteen profile already exists for this account.");
    }

    const body: unknown = await request.json();
    const profile = await canteenProfileSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const createdCanteen = await Canteen.create({
      ...profile,
      owner: session.userId,
      isApproved: false,
      isActive: false,
    });

    const canteen = await Canteen.findById(createdCanteen._id)
      .select(profileFields)
      .lean();
    return apiSuccess(canteen, 201, "Canteen profile created.");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { session } = await requireActiveCanteenOwner();
    await connectDB();
    const body: unknown = await request.json();
    const profile = await canteenProfileUpdateSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const canteen = await Canteen.findOneAndUpdate(
      { owner: session.userId },
      { $set: profile },
      { new: true, runValidators: true }
    ).select(profileFields);

    if (!canteen) {
      throw new NotFoundError("Canteen profile not found");
    }

    return apiSuccess(canteen.toJSON(), 200, "Canteen profile updated.");
  } catch (error) {
    return handleApiError(error);
  }
}
