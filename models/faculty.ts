import mongoose, { type InferSchemaType, model } from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Employee ID is too long"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department is too long"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: [100, "Designation is too long"],
    },
    facultyType: {
      type: String,
      required: [true, "Faculty type is required"],
      trim: true,
      maxlength: [60, "Faculty type is too long"],
    },
    universityIdCardUrl: {
      type: String,
      trim: true,
      maxlength: [2048, "University ID card URL is too long"],
      default: "",
    },
    employmentVerificationUrl: {
      type: String,
      trim: true,
      maxlength: [2048, "Employment verification URL is too long"],
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export type FacultyDocument = InferSchemaType<typeof facultySchema>;

export const Faculty: mongoose.Model<FacultyDocument> =
  (mongoose.models?.Faculty as mongoose.Model<FacultyDocument>) ||
  model<FacultyDocument>("Faculty", facultySchema);
