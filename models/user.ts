import mongoose, { type InferSchemaType, model } from "mongoose";

import { ROLES, ACCOUNT_STATUS, type Role, type AccountStatus } from "@/types";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be at most 100 characters"],
    },
    fatherName: {
      type: String,
      trim: true,
      minlength: [2, "Father name must be at least 2 characters"],
      maxlength: [100, "Father name must be at most 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [254, "Email address is too long"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [32, "Phone number is too long"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: [true, "Role is required"],
      index: true,
    },
    status: {
      type: String,
      enum: [
        ACCOUNT_STATUS.PENDING,
        ACCOUNT_STATUS.ACTIVE,
        ACCOUNT_STATUS.REJECTED,
        ACCOUNT_STATUS.SUSPENDED,
      ],
      default: ACCOUNT_STATUS.PENDING,
      required: true,
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const sanitized = ret as { passwordHash?: string; __v?: number };
        delete sanitized.passwordHash;
        delete sanitized.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        const sanitized = ret as { passwordHash?: string; __v?: number };
        delete sanitized.passwordHash;
        delete sanitized.__v;
        return ret;
      },
    },
  }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  role: Role;
  status: AccountStatus;
  fatherName?: string;
  rejectionReason?: string;
};

export const User: mongoose.Model<UserDocument> =
  (mongoose.models?.User as mongoose.Model<UserDocument>) ||
  model<UserDocument>("User", userSchema);
