import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Student from "@/models/Student";
import Teacher from "@/models/Teacher";
import Parent from "@/models/Parent";

export async function ensureDemoUsers() {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  await connectToDatabase();
  if ((await User.countDocuments()) > 0) {
    return;
  }

  await User.create({ name: "Admin User", email: "admin@sms.com", password: "admin123", role: "admin" });

  const teacherUser = await User.create({ name: "Teacher User", email: "teacher@sms.com", password: "teacher123", role: "teacher" });
  await Teacher.create({ userId: teacherUser._id });

  const studentUser = await User.create({ name: "Student User", email: "student@sms.com", password: "student123", role: "student" });
  const studentDoc = await Student.create({ userId: studentUser._id });

  const parentUser = await User.create({ name: "Parent User", email: "parent@sms.com", password: "parent123", role: "parent" });
  const parentDoc = await Parent.create({ userId: parentUser._id, children: [studentDoc._id] });

  studentDoc.parentId = parentDoc._id;
  await studentDoc.save();
}
