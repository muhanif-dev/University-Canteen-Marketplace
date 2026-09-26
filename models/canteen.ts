import mongoose, { type InferSchemaType, model } from "mongoose";

const canteenSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"],
      unique: true,
      index: true,
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
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    building: {
      type: String,
      required: [true, "Building/Block is required"],
      trim: true,
    },
    openingTime: {
      type: String,
      required: [true, "Opening time is required"],
      trim: true,
    },
    closingTime: {
      type: String,
      required: [true, "Closing time is required"],
      trim: true,
    },
    cnic: {
      type: String,
      required: [true, "CNIC is required"],
      trim: true,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    coverImageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    verificationDocuments: {
      type: [String],
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
