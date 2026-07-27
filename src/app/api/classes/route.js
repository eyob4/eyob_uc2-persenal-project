import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Class from "@/models/Class";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  await connectToDatabase();
  const classes = await Class.find().populate("classTeacherId");
  return successResponse(classes);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { name, classTeacherId } = body;
  if (!name) {
    return errorResponse("Class name is required", 400);
  }

  await connectToDatabase();
  const created = await Class.create({ name, classTeacherId: classTeacherId || undefined });
  return successResponse(created, "Class created", { status: 201 });
}
