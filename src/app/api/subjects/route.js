import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Subject from "@/models/Subject";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  await connectToDatabase();
  const subjects = await Subject.find().populate("classId").populate("teacherId");
  return successResponse(subjects);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { name, code, classId, teacherId } = body;
  if (!name || !code) {
    return errorResponse("Name and code are required", 400);
  }

  await connectToDatabase();
  const existing = await Subject.findOne({ code });
  if (existing) {
    return errorResponse("Subject code already exists", 400);
  }

  const created = await Subject.create({ name, code, classId: classId || undefined, teacherId: teacherId || undefined });
  return successResponse(created, "Subject created", { status: 201 });
}
