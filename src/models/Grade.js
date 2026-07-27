import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    examType: { type: String, trim: true },
    marksObtained: { type: Number, required: true },
    totalMarks: { type: Number, required: true },
    term: { type: String, trim: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

const Grade = mongoose.models.Grade || mongoose.model("Grade", gradeSchema);
export default Grade;
