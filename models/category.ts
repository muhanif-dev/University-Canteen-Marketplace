import mongoose, { type InferSchemaType, model } from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: [true, "Canteen reference is required"],
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [60, "Category name must be at most 60 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, "Description must be at most 300 characters"],
      default: "",
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

categorySchema.index(
  { canteen: 1, name: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

export type CategoryDocument = InferSchemaType<typeof categorySchema>;

export const Category: mongoose.Model<CategoryDocument> =
  (mongoose.models?.Category as mongoose.Model<CategoryDocument>) ||
  model<CategoryDocument>("Category", categorySchema);
