import * as yup from "yup";

const objectId = yup
  .string()
  .matches(/^[a-f\d]{24}$/i, "Select a valid option")
  .required("This field is required");

export const categoryInputSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters")
    .max(60, "Category name must be at most 60 characters")
    .required("Category name is required"),
  description: yup
    .string()
    .trim()
    .max(300, "Description must be at most 300 characters")
    .default(""),
  isActive: yup.boolean().default(true),
});

const optionalMoney = yup
  .number()
  .transform((value, originalValue: unknown) =>
    originalValue === "" || originalValue === null ? undefined : value
  )
  .min(0, "Price cannot be negative")
  .max(1000000, "Price is too high")
  .test("cents", "Price can have at most two decimal places", (value) =>
    value === undefined || Math.abs(value * 100 - Math.round(value * 100)) < 1e-8
  )
  .optional();

export const productInputSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Product name must be at least 2 characters")
    .max(100, "Product name must be at most 100 characters")
    .required("Product name is required"),
  description: yup
    .string()
    .trim()
    .max(1000, "Description must be at most 1000 characters")
    .required("Description is required"),
  category: objectId,
  price: yup
    .number()
    .typeError("Enter a valid price")
    .min(0, "Price cannot be negative")
    .max(1000000, "Price is too high")
    .test("cents", "Price can have at most two decimal places", (value) =>
      value === undefined || Math.abs(value * 100 - Math.round(value * 100)) < 1e-8
    )
    .required("Price is required"),
  discountPrice: optionalMoney.test(
    "below-price",
    "Discount price must be less than the regular price",
    function (value) {
      return value === undefined || this.parent.price === undefined || value < this.parent.price;
    }
  ),
  image: yup
    .string()
    .trim()
    .max(2048, "Image URL is too long")
    .url("Enter a valid image URL")
    .test(
      "http-url",
      "Image URL must use HTTP or HTTPS",
      (value) => !value || /^https?:\/\//i.test(value)
    )
    .default(""),
  stockQuantity: yup
    .number()
    .typeError("Enter a valid stock quantity")
    .integer("Stock quantity must be a whole number")
    .min(0, "Stock cannot be negative")
    .max(1000000, "Stock is too high")
    .required("Stock quantity is required"),
  isAvailable: yup.boolean().default(true),
  preparationTime: yup
    .number()
    .typeError("Enter a valid preparation time")
    .integer("Preparation time must be a whole number")
    .min(1, "Preparation time must be at least 1 minute")
    .max(240, "Preparation time must be at most 240 minutes")
    .required("Preparation time is required"),
});

export const marketplaceQuerySchema = yup.object({
  q: yup.string().trim().max(80, "Search is limited to 80 characters").default(""),
  canteenId: yup.string().matches(/^[a-f\d]{24}$/i).optional(),
  categoryId: yup.string().matches(/^[a-f\d]{24}$/i).optional(),
  available: yup.boolean().default(true),
});

export { objectId as marketplaceObjectId };
export type CategoryInput = yup.InferType<typeof categoryInputSchema>;
export type ProductInput = yup.InferType<typeof productInputSchema>;
