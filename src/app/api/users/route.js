import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import { createRoleProfile } from "@/lib/profiles";
import User from "@/models/User";
import Student from "@/models/Student";
import Parent from "@/models/Parent";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  await connectToDatabase();
  const users = await User.find().select("-password").lean();

  const studentUserIds = users.filter((u) => u.role === "student").map((u) => u._id);
  const parentUserIds = users.filter((u) => u.role === "parent").map((u) => u._id);

  const students = await Student.find({ userId: { $in: studentUserIds } }).lean();
  const parents = await Parent.find({ userId: { $in: parentUserIds } }).lean();

  const studentByUser = new Map(students.map((s) => [s.userId.toString(), s]));
  const parentByUser = new Map(parents.map((p) => [p.userId.toString(), p]));

  const enriched = users.map((u) => ({
    ...u,
    student: studentByUser.get(u._id.toString()) || null,
    children: parentByUser.get(u._id.toString())?.children || [],
  }));

  return successResponse(enriched);
}

export async function POST(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const body = await request.json().catch(() => ({}));
  const { name, email, password, role } = body;
  if (!name || !email || !password || !role) {
    return errorResponse("Missing required fields", 400);
  }

  await connectToDatabase();
  const existing = await User.findOne({ email });
  if (existing) {
    return errorResponse("Email already registered", 400);
  }

  const created = await User.create({ name, email, password, role });
  await createRoleProfile(role, created._id);

  return successResponse(
    { id: created._id, name: created.name, email: created.email, role: created.role },
    "Created user",
    { status: 201 }
  );
}
