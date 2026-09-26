import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { Faculty } from "@/models/faculty";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES } from "@/types";
import { facultyRegistrationSchema } from "@/validations/registration";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = await facultyRegistrationSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check if user email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError("An account with this email address already exists.");
    }

    // Check if employeeId already exists
    const existingFaculty = await Faculty.findOne({
      employeeId: validatedData.employeeId.trim(),
    });
    if (existingFaculty) {
      throw new ConflictError("A faculty member with this Employee ID is already registered.");
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await User.create({
      name: validatedData.name.trim(),
      fatherName: validatedData.fatherName.trim(),
      email: normalizedEmail,
      phone: validatedData.phone.trim(),
      passwordHash,
      role: ROLES.FACULTY,
      status: ACCOUNT_STATUS.PENDING,
    });

    const faculty = await Faculty.create({
      user: user._id,
      employeeId: validatedData.employeeId.trim(),
      department: validatedData.department.trim(),
      designation: validatedData.designation.trim(),
      facultyType: validatedData.facultyType.trim(),
      universityIdCardUrl: validatedData.universityIdCardUrl?.trim() || "",
      employmentVerificationUrl:
        validatedData.employmentVerificationUrl?.trim() || "",
    });

    return apiSuccess(
      {
        user,
        faculty,
      },
      201,
      "Faculty registration submitted successfully. Your account is pending Super Admin approval."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
