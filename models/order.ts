import mongoose, { type InferSchemaType, model } from "mongoose";

import { CUSTOMER_TYPE, ORDER_STATUS } from "@/types";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: { type: String, required: true, trim: true, maxlength: 100 },
    categoryName: { type: String, required: true, trim: true, maxlength: 60 },
    image: { type: String, trim: true, maxlength: 2048, default: "" },
    originalUnitPrice: { type: Number, required: true, min: 0 },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 1000000,
      validate: { validator: Number.isInteger, message: "Quantity must be a whole number" },
    },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerType: {
      type: String,
      enum: Object.values(CUSTOMER_TYPE),
      required: true,
    },
    canteen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canteen",
      required: true,
    },
    canteenName: { type: String, required: true, trim: true, maxlength: 100 },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0 && items.length <= 100,
        message: "An order must contain between 1 and 100 items",
      },
    },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PENDING,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CASH_ON_PICKUP"],
      default: "CASH_ON_PICKUP",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_document, result) {
        const safe = result as { customer?: mongoose.Types.ObjectId; __v?: number };
        delete safe.customer;
        delete safe.__v;
        return result;
      },
    },
  }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ canteen: 1, createdAt: -1 });

export type OrderDocument = InferSchemaType<typeof orderSchema>;

export const Order: mongoose.Model<OrderDocument> =
  (mongoose.models?.Order as mongoose.Model<OrderDocument>) ||
  model<OrderDocument>("Order", orderSchema);
