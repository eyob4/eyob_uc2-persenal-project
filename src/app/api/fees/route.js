import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole, ownsChild } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Fee from "@/models/Fee";
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
    const fees = await Fee.find({ studentId: own._id }).sort({ dueDate: -1 });
    return successResponse(fees);
  }

  if (user.role === "parent") {
    const parent = await Parent.findOne({ userId: user._id });
    if (studentId) {
      if (!ownsChild(parent, studentId)) {
        return errorResponse("Forbidden: not your child", 403);
      }
      const fees = await Fee.find({ studentId }).sort({ dueDate: -1 });
      return successResponse(fees);
    }
    const fees = await Fee.find({ studentId: { $in: parent?.children || [] } })
      .populate({ path: "studentId", populate: { path: "userId", select: "name email" } })
      .sort({ dueDate: -1 });
    return successResponse(fees);
  }

  // admin / teacher
  const query = studentId ? { studentId } : {};
  const fees = await Fee.find(query).populate({ path: "studentId", populate: { path: "userId", select: "name email" } }).sort({ dueDate: -1 });
  return successResponse(fees);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { studentId, amount, dueDate, status, paymentDate, receiptNo } = body;
  if (!studentId || amount == null || !dueDate) {
    return errorResponse("studentId, amount, and dueDate are required", 400);
  }

  await connectToDatabase();
  const created = await Fee.create({ studentId, amount, dueDate, status, paymentDate, receiptNo });
  return successResponse(created, "Fee created", { status: 201 });
}
