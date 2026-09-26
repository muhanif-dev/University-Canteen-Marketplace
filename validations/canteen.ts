import * as yup from "yup";

export const canteenProfileSchema = yup.object({
  canteenName: yup
    .string()
    .trim()
    .min(2, "Canteen name must be at least 2 characters")
    .max(100, "Canteen name must be at most 100 characters")
    .required("Canteen name is required"),
  description: yup
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(1000, "Description must be at most 1000 characters")
    .required("Description is required"),
  location: yup
    .string()
    .trim()
    .min(2, "Location must be at least 2 characters")
    .max(200, "Location must be at most 200 characters")
    .required("Location is required"),
  building: yup
    .string()
    .trim()
    .min(2, "Building / Block must be at least 2 characters")
    .max(100, "Building / Block must be at most 100 characters")
    .required("Building / Block is required"),
  openingTime: yup
    .string()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time (HH:MM)")
    .required("Opening time is required"),
  closingTime: yup
    .string()
    .trim()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/, "Use 24-hour time (HH:MM)")
    .required("Closing time is required"),
  cnic: yup
    .string()
    .trim()
    .matches(/^\d{5}-?\d{7}-?\d{1}$/, "Enter a valid 13-digit CNIC")
    .required("CNIC is required"),
  logoUrl: yup
    .string()
    .trim()
    .max(2048, "Logo URL is too long")
    .url("Enter a valid image URL")
    .default(""),
  coverImageUrl: yup
    .string()
    .trim()
    .max(2048, "Cover image URL is too long")
    .url("Enter a valid image URL")
    .default(""),
});

export const canteenProfileUpdateSchema = canteenProfileSchema.omit(["cnic"]);

export type CanteenProfileInput = yup.InferType<typeof canteenProfileSchema>;
