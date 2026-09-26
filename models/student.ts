import mongoose, { type InferSchemaType, model } from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    program: {
      type: String,
      required: [true, "Program is required"],
      trim: true,
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    studentCardUrl: {
      type: String,
      trim: true,
      default: "",
    },
    universityEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export type StudentDocument = InferSchemaType<typeof studentSchema>;

export const Student: mongoose.Model<StudentDocument> =
  (mongoose.models?.Student as mongoose.Model<StudentDocument>) ||
  model<StudentDocument>("Student", studentSchema);
