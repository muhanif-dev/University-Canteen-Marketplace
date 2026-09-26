import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { ConflictError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { Student } from "@/models/student";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES } from "@/types";
import { studentRegistrationSchema } from "@/validations/registration";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const validatedData = await studentRegistrationSchema.validate(body, {
      abortEarly: false,
      stripUnknown: true,
    });

    const normalizedEmail = validatedData.email.toLowerCase().trim();

    // Check if user email already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ConflictError("An account with this email address already exists.");
    }

    // Check if studentId already exists
    const existingStudent = await Student.findOne({
      studentId: validatedData.studentId.trim(),
    });
    if (existingStudent) {
      throw new ConflictError("A student with this Student ID is already registered.");
    }

    const passwordHash = await hashPassword(validatedData.password);

    const user = await User.create({
      name: validatedData.name.trim(),
      fatherName: validatedData.fatherName.trim(),
      email: normalizedEmail,
      phone: validatedData.phone.trim(),
      passwordHash,
      role: ROLES.STUDENT,
      status: ACCOUNT_STATUS.PENDING,
    });

    const student = await Student.create({
      user: user._id,
      studentId: validatedData.studentId.trim(),
      department: validatedData.department.trim(),
      program: validatedData.program.trim(),
      semester: validatedData.semester.trim(),
      section: validatedData.section.trim(),
      studentCardUrl: validatedData.studentCardUrl?.trim() || "",
      universityEmail: validatedData.universityEmail?.toLowerCase().trim() || "",
    });

    return apiSuccess(
      {
        user,
        student,
      },
      201,
      "Student registration submitted successfully. Your account is pending Super Admin approval."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
