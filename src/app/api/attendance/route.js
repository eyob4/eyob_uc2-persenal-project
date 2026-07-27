import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole, ownsChild } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import Parent from "@/models/Parent";
import Teacher from "@/models/Teacher";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  const studentId = request.nextUrl.searchParams.get("studentId");

  await connectToDatabase();

  if (user.role === "student") {
    const own = await Student.findOne({ userId: user._id });
    if (!own || (studentId && studentId !== own._id.toString())) {
      return errorResponse("Forbidden", 403);
    }
    const records = await Attendance.find({ studentId: own._id }).sort({ date: -1 });
    return successResponse(records);
  }

  if (user.role === "parent") {
    if (!studentId) {
      return errorResponse("studentId is required", 400);
    }
    const parent = await Parent.findOne({ userId: user._id });
    if (!ownsChild(parent, studentId)) {
      return errorResponse("Forbidden: not your child", 403);
    }
    const records = await Attendance.find({ studentId }).sort({ date: -1 });
    return successResponse(records);
  }

  const query = studentId ? { studentId } : {};
  const records = await Attendance.find(query)
    .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
    .sort({ date: -1 });
  return successResponse(records);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["teacher", "admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { studentId, classId, date, status } = body;
  if (!studentId || !date) {
    return errorResponse("studentId and date are required", 400);
  }

  await connectToDatabase();

  let markedBy;
  if (user.role === "teacher") {
    const teacher = await Teacher.findOne({ userId: user._id });
    markedBy = teacher?._id;
  }

  const created = await Attendance.create({ studentId, classId: classId || undefined, date, status, markedBy });
  return successResponse(created, "Attendance recorded", { status: 201 });
}
