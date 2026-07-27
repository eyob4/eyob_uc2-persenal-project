import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse } from "@/lib/utils";
import Teacher from "@/models/Teacher";

export async function GET(request) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, []);
  if (denied) return denied;

  await connectToDatabase();
  const teachers = await Teacher.find()
    .populate("userId", "name email")
    .populate("subjects")
    .populate("classesAssigned");

  return successResponse(teachers);
}
