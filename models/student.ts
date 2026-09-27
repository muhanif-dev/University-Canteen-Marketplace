import mongoose, { type InferSchemaType, model } from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      unique: true,
    },
    studentId: {
      type: String,
      required: [true, "Student ID is required"],
      unique: true,
      trim: true,
      maxlength: [50, "Student ID is too long"],
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department is too long"],
    },
    program: {
      type: String,
      required: [true, "Program is required"],
      trim: true,
      maxlength: [100, "Program is too long"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
      maxlength: [30, "Semester is too long"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
      maxlength: [30, "Section is too long"],
    },
    studentCardUrl: {
      type: String,
      trim: true,
      maxlength: [2048, "Student card URL is too long"],
      default: "",
    },
    universityEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [254, "University email is too long"],
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
