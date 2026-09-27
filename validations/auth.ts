import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .max(254, "Email address is too long")
    .lowercase()
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password cannot exceed 72 characters")
    .test(
      "bcrypt-byte-length",
      "Password must not exceed 72 UTF-8 bytes",
      (value) => !value || new TextEncoder().encode(value).length <= 72
    )
    .required("Password is required"),
});

export type LoginInput = yup.InferType<typeof loginSchema>;
