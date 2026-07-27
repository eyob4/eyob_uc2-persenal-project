import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Teacher from "@/models/Teacher";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { qualification, joiningDate } = body;

  await connectToDatabase();
  const updated = await Teacher.findByIdAndUpdate(
    id,
    { qualification, joiningDate: joiningDate || undefined },
    { new: true }
  ).populate("userId", "name email");

  if (!updated) {
    return errorResponse("Teacher not found", 404);
  }
  return successResponse(updated, "Teacher updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  await connectToDatabase();
  const deleted = await Teacher.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Teacher not found", 404);
  }
  return successResponse(null, "Teacher removed");
}
