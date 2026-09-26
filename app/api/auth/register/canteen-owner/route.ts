import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { Canteen } from "@/models/canteen";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES } from "@/types";
import { canteenOwnerRegistrationSchema } from "@/validations/registration";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = await canteenOwnerRegistrationSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check if user email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError("An account with this email address already exists.");
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await User.create({
      name: validatedData.name.trim(),
      fatherName: validatedData.fatherName.trim(),
      email: normalizedEmail,
      phone: validatedData.phone.trim(),
      passwordHash,
      role: ROLES.CANTEEN_OWNER,
      status: ACCOUNT_STATUS.PENDING,
    });

    const canteen = await Canteen.create({
      owner: user._id,
      canteenName: validatedData.canteenName.trim(),
      description: validatedData.description.trim(),
      location: validatedData.location.trim(),
      building: validatedData.building.trim(),
      openingTime: validatedData.openingTime.trim(),
      closingTime: validatedData.closingTime.trim(),
      cnic: validatedData.cnic.trim(),
      logoUrl: validatedData.logoUrl?.trim() || "",
      coverImageUrl: validatedData.coverImageUrl?.trim() || "",
      verificationDocuments: validatedData.verificationDocuments || [],
      isApproved: false,
      isActive: false,
    });

    return apiSuccess(
      {
        user,
        canteen,
      },
      201,
      "Canteen Owner registration submitted successfully. Your account is pending Super Admin approval."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
