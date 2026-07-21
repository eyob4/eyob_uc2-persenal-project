import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    gradeLevel: { type: String, required: true, trim: true },
    schedule: [
      {
        day: String,
        subject: String,
        teacher: String,
        startTime: String,
        endTime: String,
      },
    ],
    attendance: [
      {
        date: Date,
        status: { type: String, enum: ["present", "absent", "late"], default: "present" },
      },
    ],
    grades: [
      {
        subject: String,
        term: String,
        score: Number,
        note: String,
      },
    ],
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
export default Student;
