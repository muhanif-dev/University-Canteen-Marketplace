import mongoose, { type InferSchemaType, model } from "mongoose";

const productSchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: [true, "Canteen reference is required"],
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category reference is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters"],
      maxlength: [100, "Product name must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description must be at most 1000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      max: [1000000, "Price is too high"],
    },
    discountPrice: {
      type: Number,
      min: [0, "Discount price cannot be negative"],
      max: [1000000, "Discount price is too high"],
    },
    image: { type: String, trim: true, maxlength: 2048, default: "" },
    stockQuantity: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      max: [1000000, "Stock is too high"],
      validate: { validator: Number.isInteger, message: "Stock must be a whole number" },
      default: 0,
    },
    isAvailable: { type: Boolean, default: true, index: true },
    preparationTime: {
      type: Number,
      min: [1, "Preparation time must be at least 1 minute"],
      max: [240, "Preparation time must be at most 240 minutes"],
      validate: { validator: Number.isInteger, message: "Preparation time must be a whole number" },
      required: [true, "Preparation time is required"],
    },
  },
  { timestamps: true }
);

productSchema.index({ canteen: 1, isAvailable: 1, name: 1 });

export type ProductDocument = InferSchemaType<typeof productSchema>;

export const Product: mongoose.Model<ProductDocument> =
  (mongoose.models?.Product as mongoose.Model<ProductDocument>) ||
  model<ProductDocument>("Product", productSchema);
