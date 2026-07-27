import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }],
    classesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    qualification: { type: String, trim: true },
    joiningDate: Date,
  },
  { timestamps: true }
);

const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
