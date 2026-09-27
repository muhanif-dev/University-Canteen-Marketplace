import mongoose, { type InferSchemaType, model } from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
      validate: { validator: Number.isInteger, message: "Quantity must be a whole number" },
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    items: {
      type: [cartItemSchema],
      default: [],
      validate: {
        validator: (items: unknown[]) => items.length <= 100,
        message: "A cart can contain at most 100 products",
      },
    },
  },
  { timestamps: true, optimisticConcurrency: true }
);

export type CartDocument = InferSchemaType<typeof cartSchema>;

export const Cart: mongoose.Model<CartDocument> =
  (mongoose.models?.Cart as mongoose.Model<CartDocument>) ||
  model<CartDocument>("Cart", cartSchema);
