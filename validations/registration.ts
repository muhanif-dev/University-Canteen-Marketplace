import * as yup from "yup";

export const studentRegistrationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .required("Full Name is required"),
  fatherName: yup
    .string()
    .trim()
    .min(2, "Father Name must be at least 2 characters")
    .max(100, "Father Name must be at most 100 characters")
    .required("Father Name is required"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  studentId: yup
    .string()
    .trim()
    .required("Student ID is required"),
  department: yup
    .string()
    .trim()
    .required("Department is required"),
  program: yup
    .string()
    .trim()
    .required("Program is required"),
  semester: yup
    .string()
    .trim()
    .required("Semester is required"),
  section: yup
    .string()
    .trim()
    .required("Section is required"),
  studentCardUrl: yup
    .string()
    .trim()
    .default(""),
  universityEmail: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid university email")
    .default(""),
});

export type StudentRegistrationInput = yup.InferType<
  typeof studentRegistrationSchema
>;

export const facultyRegistrationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .required("Full Name is required"),
  fatherName: yup
    .string()
    .trim()
    .min(2, "Father Name must be at least 2 characters")
    .max(100, "Father Name must be at most 100 characters")
    .required("Father Name is required"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .required("Phone number is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  employeeId: yup
    .string()
    .trim()
    .required("Employee ID is required"),
  department: yup
    .string()
    .trim()
    .required("Department is required"),
  designation: yup
    .string()
    .trim()
    .required("Designation is required"),
  facultyType: yup
    .string()
    .trim()
    .required("Faculty Type is required"),
  universityIdCardUrl: yup
    .string()
    .trim()
    .default(""),
  employmentVerificationUrl: yup
    .string()
    .trim()
    .default(""),
});

export type FacultyRegistrationInput = yup.InferType<
  typeof facultyRegistrationSchema
>;

export const canteenOwnerRegistrationSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .required("Full Name is required"),
  fatherName: yup
    .string()
    .trim()
    .min(2, "Father Name must be at least 2 characters")
    .max(100, "Father Name must be at most 100 characters")
    .required("Father Name is required"),
  cnic: yup
    .string()
    .trim()
    .min(10, "CNIC must be at least 10 characters")
    .required("CNIC is required"),
  phone: yup
    .string()
    .trim()
    .min(7, "Phone number must be at least 7 characters")
    .required("Phone number is required"),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  canteenName: yup
    .string()
    .trim()
    .min(2, "Canteen Name must be at least 2 characters")
    .max(100, "Canteen Name must be at most 100 characters")
    .required("Canteen Name is required"),
  description: yup
    .string()
    .trim()
    .required("Canteen description is required"),
  location: yup
    .string()
    .trim()
    .required("Location is required"),
  building: yup
    .string()
    .trim()
    .required("Building / Block is required"),
  openingTime: yup
    .string()
    .trim()
    .required("Opening Time is required"),
  closingTime: yup
    .string()
    .trim()
    .required("Closing Time is required"),
  logoUrl: yup
    .string()
    .trim()
    .default(""),
  coverImageUrl: yup
    .string()
    .trim()
    .default(""),
  verificationDocuments: yup
    .array()
    .of(yup.string().required())
    .default([]),
});

export type CanteenOwnerRegistrationInput = yup.InferType<
  typeof canteenOwnerRegistrationSchema
>;

export const rejectionReasonSchema = yup.object({
  reason: yup
    .string()
    .trim()
    .min(3, "Rejection reason must be at least 3 characters")
    .max(500, "Rejection reason must be at most 500 characters")
    .required("Rejection reason is required"),
});

export type RejectionReasonInput = yup.InferType<typeof rejectionReasonSchema>;
