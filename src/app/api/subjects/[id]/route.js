import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Subject from "@/models/Subject";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  await connectToDatabase();
  const updated = await Subject.findByIdAndUpdate(id, body, { new: true });
  if (!updated) {
    return errorResponse("Subject not found", 404);
  }
  return successResponse(updated, "Subject updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;

  await connectToDatabase();
  const deleted = await Subject.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Subject not found", 404);
  }
  return successResponse(null, "Subject removed");
}
