import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Class from "@/models/Class";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  await connectToDatabase();
  const updated = await Class.findByIdAndUpdate(id, body, { new: true });
  if (!updated) {
    return errorResponse("Class not found", 404);
  }
  return successResponse(updated, "Class updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;

  await connectToDatabase();
  const deleted = await Class.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Class not found", 404);
  }
  return successResponse(null, "Class removed");
}
