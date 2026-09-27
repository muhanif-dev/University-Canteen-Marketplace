import * as yup from "yup";

const objectIdPattern = /^[a-f\d]{24}$/i;

export const notificationIdSchema = yup
  .string()
  .matches(objectIdPattern, "Invalid notification ID")
  .required("Notification ID is required");

export const notificationPaginationSchema = yup.object({
  page: yup
    .number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() !== ""
        ? Number(originalValue)
        : value
    )
    .integer("Page must be a whole number")
    .min(1, "Page must be at least 1")
    .max(1000, "Page is too high")
    .default(1),
  limit: yup
    .number()
    .transform((value, originalValue) =>
      typeof originalValue === "string" && originalValue.trim() !== ""
        ? Number(originalValue)
        : value
    )
    .integer("Limit must be a whole number")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(20),
});

export type NotificationPagination = yup.InferType<
  typeof notificationPaginationSchema
>;
