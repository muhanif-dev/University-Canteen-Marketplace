import mongoose, { type InferSchemaType, model } from "mongoose";

const canteenSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
      unique: true,
    },
    canteenName: {
      type: String,
      required: [true, "Canteen name is required"],
      trim: true,
      minlength: [2, "Canteen name must be at least 2 characters"],
      maxlength: [100, "Canteen name must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description is too long"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [200, "Location is too long"],
    },
    building: {
      type: String,
      required: [true, "Building/Block is required"],
      trim: true,
      maxlength: [100, "Building/Block is too long"],
    },
    openingTime: {
      type: String,
      required: [true, "Opening time is required"],
      trim: true,
      maxlength: [5, "Opening time is invalid"],
    },
    closingTime: {
      type: String,
      required: [true, "Closing time is required"],
      trim: true,
      maxlength: [5, "Closing time is invalid"],
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
      trim: true,
      maxlength: [15, "CNIC is invalid"],
    },
    logoUrl: {
      type: String,
      trim: true,
      maxlength: [2048, "Logo URL is too long"],
      default: "",
    },
    coverImageUrl: {
      type: String,
      trim: true,
      maxlength: [2048, "Cover image URL is too long"],
      default: "",
    },
    verificationDocuments: {
      type: [String],
      validate: { validator: (items: string[]) => items.length <= 10, message: "Too many verification documents" },
      default: [],
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export type CanteenDocument = InferSchemaType<typeof canteenSchema>;

export const Canteen: mongoose.Model<CanteenDocument> =
  (mongoose.models?.Canteen as mongoose.Model<CanteenDocument>) ||
  model<CanteenDocument>("Canteen", canteenSchema);
