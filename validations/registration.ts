import * as yup from "yup";

const passwordSchema = yup
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password cannot exceed 72 characters")
  .test(
    "bcrypt-byte-length",
    "Password must not exceed 72 UTF-8 bytes",
    (value) => !value || new TextEncoder().encode(value).length <= 72
  )
  .required("Password is required");

const optionalHttpUrl = (label: string) =>
  yup
    .string()
    .trim()
    .max(2048, `${label} URL is too long`)
    .url(`Enter a valid ${label.toLowerCase()} URL`)
    .test(
      "http-url",
      `${label} URL must use HTTP or HTTPS`,
      (value) => !value || /^https?:\/\//i.test(value)
    )
    .default("");

const phoneSchema = yup
  .string()
  .trim()
  .matches(/^[+()\d\s.-]{7,32}$/, "Enter a valid phone number")
  .required("Phone number is required");

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
    .max(254, "Email address is too long")
    .required("Email is required"),
  phone: phoneSchema,
  password: passwordSchema,
  studentId: yup
    .string()
    .trim()
    .max(50, "Student ID must be at most 50 characters")
    .required("Student ID is required"),
  department: yup
    .string()
    .trim()
    .max(100, "Department must be at most 100 characters")
    .required("Department is required"),
  program: yup
    .string()
    .trim()
    .max(100, "Program must be at most 100 characters")
    .required("Program is required"),
  semester: yup
    .string()
    .trim()
    .max(30, "Semester must be at most 30 characters")
    .required("Semester is required"),
  section: yup
    .string()
    .trim()
    .max(30, "Section must be at most 30 characters")
    .required("Section is required"),
  studentCardUrl: optionalHttpUrl("Student card"),
  universityEmail: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid university email")
    .max(254, "University email is too long")
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
    .max(254, "Email address is too long")
    .required("Email is required"),
  phone: phoneSchema,
  password: passwordSchema,
  employeeId: yup
    .string()
    .trim()
    .max(50, "Employee ID must be at most 50 characters")
    .required("Employee ID is required"),
  department: yup
    .string()
    .trim()
    .max(100, "Department must be at most 100 characters")
    .required("Department is required"),
  designation: yup
    .string()
    .trim()
    .max(100, "Designation must be at most 100 characters")
    .required("Designation is required"),
  facultyType: yup
    .string()
    .trim()
    .max(60, "Faculty type must be at most 60 characters")
    .required("Faculty Type is required"),
  universityIdCardUrl: optionalHttpUrl("University ID card"),
  employmentVerificationUrl: optionalHttpUrl("Employment verification"),
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
    .matches(/^\d{5}-?\d{7}-?\d{1}$/, "Enter a valid 13-digit CNIC")
    .required("CNIC is required"),
  phone: phoneSchema,
  email: yup
    .string()
    .trim()
    .lowercase()
    .email("Please enter a valid email address")
    .max(254, "Email address is too long")
    .required("Email is required"),
  password: passwordSchema,
  canteenName: yup
    .string()
    .trim()
    .min(2, "Canteen Name must be at least 2 characters")
    .max(100, "Canteen Name must be at most 100 characters")
    .required("Canteen Name is required"),
  description: yup
    .string()
    .trim()
    .min(5, "Canteen description must be at least 5 characters")
    .max(1000, "Canteen description must be at most 1000 characters")
    .required("Canteen description is required"),
  location: yup
    .string()
    .trim()
    .max(200, "Location must be at most 200 characters")
    .required("Location is required"),
  building: yup
    .string()
    .trim()
    .max(100, "Building / Block must be at most 100 characters")
    .required("Building / Block is required"),
  openingTime: yup
    .string()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time (HH:MM)")
    .required("Opening Time is required"),
  closingTime: yup
    .string()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time (HH:MM)")
    .required("Closing Time is required"),
  logoUrl: optionalHttpUrl("Logo"),
  coverImageUrl: optionalHttpUrl("Cover image"),
  verificationDocuments: yup
    .array()
    .of(optionalHttpUrl("Verification document"))
    .max(10, "You can provide at most 10 verification documents")
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
