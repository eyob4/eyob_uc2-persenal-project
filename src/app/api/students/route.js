import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Student from "@/models/Student";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin", "teacher", "student"]);
  if (denied) return denied;

  await connectToDatabase();

  if (user.role === "student") {
    const own = await Student.findOne({ userId: user._id })
      .populate("userId", "name email")
      .populate("classId")
      .populate({ path: "parentId", populate: { path: "userId", select: "name email" } });
    return successResponse(own ? [own] : []);
  }

  const students = await Student.find()
    .populate("userId", "name email")
    .populate("classId")
    .populate({ path: "parentId", populate: { path: "userId", select: "name email" } });

  return successResponse(students);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { userId, rollNumber, classId, parentId, dateOfBirth, gender, address, admissionDate } = body;
  if (!userId) {
    return errorResponse("userId is required", 400);
  }

  await connectToDatabase();
  const existing = await Student.findOne({ userId });
  if (existing) {
    return errorResponse("This user already has a student profile", 400);
  }

  const created = await Student.create({
    userId,
    rollNumber,
    classId: classId || undefined,
    parentId: parentId || undefined,
    dateOfBirth: dateOfBirth || undefined,
    gender: gender || undefined,
    address,
    admissionDate: admissionDate || undefined,
  });

  return successResponse(created, "Student profile created", { status: 201 });
}
