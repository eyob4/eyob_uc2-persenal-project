import { connectToDatabase } from "@/lib/mongodb";
import { getAuthUser } from "@/lib/auth";
import { requireRole } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/utils";
import Parent from "@/models/Parent";

export async function PUT(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { phone, occupation, children } = body;

  await connectToDatabase();
  const updated = await Parent.findByIdAndUpdate(
    id,
    { phone, occupation, children },
    { new: true }
  ).populate("userId", "name email").populate("children");

  if (!updated) {
    return errorResponse("Parent not found", 404);
  }
  return successResponse(updated, "Parent updated");
}

export async function DELETE(request, { params }) {
  const user = await getAuthUser(request);
  const denied = requireRole(user, ["admin"]);
  if (denied) return denied;

  const { id } = await params;
  await connectToDatabase();
  const deleted = await Parent.findByIdAndDelete(id);
  if (!deleted) {
    return errorResponse("Parent not found", 404);
  }
  return successResponse(null, "Parent removed");
}
