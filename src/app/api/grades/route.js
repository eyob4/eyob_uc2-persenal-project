import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole, ownsChild } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Grade from "@/models/Grade";
import Student from "@/models/Student";
import Parent from "@/models/Parent";

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
    const grades = await Grade.find({ studentId: own._id }).populate("subjectId");
    return successResponse(grades);
  }

  if (user.role === "parent") {
    if (!studentId) {
      return errorResponse("studentId is required", 400);
    }
    const parent = await Parent.findOne({ userId: user._id });
    if (!ownsChild(parent, studentId)) {
      return errorResponse("Forbidden: not your child", 403);
    }
    const grades = await Grade.find({ studentId }).populate("subjectId");
    return successResponse(grades);
  }

  // admin / teacher
  const query = studentId ? { studentId } : {};
  const grades = await Grade.find(query)
    .populate("subjectId")
    .populate({ path: "studentId", populate: { path: "userId", select: "name email" } });
  return successResponse(grades);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["teacher", "admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { studentId, subjectId, examType, marksObtained, totalMarks, term, remarks } = body;
  if (!studentId || !subjectId || marksObtained == null || totalMarks == null) {
    return errorResponse("studentId, subjectId, marksObtained, and totalMarks are required", 400);
  }

  await connectToDatabase();
  const created = await Grade.create({ studentId, subjectId, examType, marksObtained, totalMarks, term, remarks });
  await created.populate("subjectId");

  return successResponse(created, "Grade recorded", { status: 201 });
}
