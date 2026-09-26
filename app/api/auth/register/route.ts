import { NextRequest } from "next/server";

import { apiSuccess, handleApiError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { ConflictError, ForbiddenError, ValidationError } from "@/lib/errors";
import { hashPassword } from "@/lib/password";
import { Canteen } from "@/models/canteen";
import { Faculty } from "@/models/faculty";
import { Student } from "@/models/student";
import { User } from "@/models/user";
import { ACCOUNT_STATUS, ROLES } from "@/types";
import {
  canteenOwnerRegistrationSchema,
  facultyRegistrationSchema,
  studentRegistrationSchema,
} from "@/validations/registration";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const role = body?.role;

    if (!role) {
      throw new ValidationError("Registration role is required.");
    }

    if (role === ROLES.SUPER_ADMIN) {
      throw new ForbiddenError(
        "Super Admin accounts cannot be created through public registration."
      );
    }

    if (role === ROLES.STUDENT) {
      const validatedData = await studentRegistrationSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const normalizedEmail = validatedData.email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new ConflictError(
          "An account with this email address already exists."
        );
      }

      const existingStudent = await Student.findOne({
        studentId: validatedData.studentId.trim(),
      });
      if (existingStudent) {
        throw new ConflictError(
          "A student with this Student ID is already registered."
        );
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
        universityEmail:
          validatedData.universityEmail?.toLowerCase().trim() || "",
      });

      return apiSuccess(
        { user, student },
        201,
        "Student registration submitted successfully. Your account is pending Super Admin approval."
      );
    }

    if (role === ROLES.FACULTY) {
      const validatedData = await facultyRegistrationSchema.validate(body, {
        abortEarly: false,
        stripUnknown: true,
      });

      const normalizedEmail = validatedData.email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new ConflictError(
          "An account with this email address already exists."
        );
      }

      const existingFaculty = await Faculty.findOne({
        employeeId: validatedData.employeeId.trim(),
      });
      if (existingFaculty) {
        throw new ConflictError(
          "A faculty member with this Employee ID is already registered."
        );
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
        { user, faculty },
        201,
        "Faculty registration submitted successfully. Your account is pending Super Admin approval."
      );
    }

    if (role === ROLES.CANTEEN_OWNER) {
      const validatedData = await canteenOwnerRegistrationSchema.validate(
        body,
        {
          abortEarly: false,
          stripUnknown: true,
        }
      );

      const normalizedEmail = validatedData.email.toLowerCase().trim();
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        throw new ConflictError(
          "An account with this email address already exists."
        );
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
        { user, canteen },
        201,
        "Canteen Owner registration submitted successfully. Your account is pending Super Admin approval."
      );
    }

    throw new ValidationError(
      `Invalid registration role "${role}". Supported roles are STUDENT, FACULTY, and CANTEEN_OWNER.`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
