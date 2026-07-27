import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    rollNumber: { type: String, trim: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class" },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: "Parent" },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    address: { type: String, trim: true },
    admissionDate: Date,
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
