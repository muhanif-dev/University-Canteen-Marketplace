import mongoose, { type InferSchemaType, model } from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    facultyType: {
      type: String,
      required: [true, "Faculty type is required"],
      trim: true,
    },
    universityIdCardUrl: {
      type: String,
      trim: true,
      default: "",
    },
    employmentVerificationUrl: {
      type: String,
      trim: true,
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
